// 기획 정책 챗봇 프록시 — Vercel 서버리스 함수 (Claude API 경유)
//
// 역할: 프론트(src/app/services/policy-bot-answer.ts 의 llmProvider)의
//   POST { question, history, contextChunks } 를 받아 Claude 호출 →
//   { body, sources: [{doc, section, path}] } 반환.
//
// 환경변수 (Vercel 프로젝트에만 등록 — 코드/깃에 키를 넣지 않는다):
//   ANTHROPIC_API_KEY   (필수) Claude API 키
//   ANTHROPIC_BASE_URL  (선택) 사내 Claude 호환 엔드포인트로 교체 시
//   POLICY_BOT_MODEL    (선택) 기본 claude-opus-5
//   ALLOW_ORIGIN        (선택) CORS 허용 도메인 (미설정 시 전체 허용)
//
// 키가 없으면 503을 반환하고, 프론트는 오프라인 검색 모드로 폴백한다.

import Anthropic from "@anthropic-ai/sdk";

const MODEL = process.env.POLICY_BOT_MODEL || "claude-opus-5";

const SYSTEM =
  "너는 '세법/노무 AI 도우미' 프로토타입 팀의 내부 기획 정책 안내 챗봇이다. " +
  "PM·디자이너·개발자가 서비스 기획/정책 스펙을 물어보면, 반드시 함께 제공된 " +
  "정책 문서 발췌(contextChunks)에 근거해서만 한국어로 답한다.\n" +
  "- 문서에 근거가 있으면: 핵심 결론을 먼저 한두 문장으로 단정하고, 이어서 세부 규칙을 설명한다. " +
  "정책 확정일·PRD ID(예: CHA-004)가 문서에 있으면 함께 언급한다.\n" +
  "- 문서에 근거가 없으면: 추측하지 말고 '문서에서 확인되지 않는다'고 답하고, " +
  "기획 담당자 확인 또는 docs/policies/ 문서화가 필요하다고 안내한다.\n" +
  "- sources 배열에는 실제로 답변 근거로 사용한 발췌의 doc/section/path만 담는다.";

const OUTPUT_SCHEMA = {
  type: "object",
  properties: {
    body: {
      type: "string",
      description: "한국어 답변 본문. 서식 없는 줄글, 필요 시 줄바꿈(\\n)으로 문단 구분.",
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        properties: {
          doc: { type: "string" },
          section: { type: "string" },
          path: { type: "string" },
        },
        required: ["doc", "section", "path"],
        additionalProperties: false,
      },
    },
  },
  required: ["body", "sources"],
  additionalProperties: false,
};

export default async function handler(req, res) {
  const allowOrigin = process.env.ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ body: "Method Not Allowed", sources: [] });
  if (!process.env.ANTHROPIC_API_KEY)
    return res.status(503).json({ body: "프록시에 ANTHROPIC_API_KEY가 설정되지 않았습니다.", sources: [] });

  let question = "";
  let history = [];
  let contextChunks = [];
  try {
    const parsed = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    question = String(parsed.question ?? "");
    history = Array.isArray(parsed.history) ? parsed.history : [];
    contextChunks = Array.isArray(parsed.contextChunks) ? parsed.contextChunks : [];
  } catch {
    return res.status(400).json({ body: "잘못된 요청 형식입니다.", sources: [] });
  }

  const contextText = contextChunks.length
    ? contextChunks
        .map(
          (c, i) =>
            `[발췌 ${i + 1}] doc="${c.doc}" section="${c.section}" path="${c.path}"\n${c.text}`,
        )
        .join("\n\n")
    : "(관련 발췌 없음)";

  // 이전 대화를 user/assistant 턴으로 재구성 (역할 교대 보장을 위해 텍스트로 합침)
  const priorText = history.length
    ? "이전 대화:\n" + history.map((h) => `${h.role === "user" ? "Q" : "A"}: ${h.text}`).join("\n") + "\n\n"
    : "";

  const client = new Anthropic(); // ANTHROPIC_API_KEY / ANTHROPIC_BASE_URL 환경변수 사용

  let response;
  try {
    // 서버측 fallback 기본 활성화: 안전 분류기가 요청을 거절하면 권장 모델로 자동 재시도
    response = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 4096,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: SYSTEM,
      output_config: { format: { type: "json_schema", schema: OUTPUT_SCHEMA } },
      messages: [
        {
          role: "user",
          content: `${priorText}정책 문서 발췌:\n${contextText}\n\n질문: ${question}`,
        },
      ],
    });
  } catch (e) {
    console.error("[policy-bot] Claude API 오류:", e?.status, e?.message);
    return res.status(502).json({ body: "LLM 호출에 실패했습니다.", sources: [] });
  }

  if (response.stop_reason === "refusal") {
    return res.status(200).json({
      body: "이 질문에는 답변을 생성할 수 없었어요. 질문을 바꿔 다시 시도해 주세요.",
      sources: [],
    });
  }

  const text = (response.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  let out = { body: "", sources: [] };
  try {
    const parsed = JSON.parse(text);
    out.body = String(parsed.body ?? "");
    out.sources = Array.isArray(parsed.sources)
      ? parsed.sources.map((s) => ({
          doc: String(s.doc ?? ""),
          section: String(s.section ?? ""),
          path: String(s.path ?? ""),
        }))
      : [];
  } catch {
    out.body = text || "";
  }

  if (!out.body.trim())
    return res.status(502).json({ body: "LLM 응답이 비어 있습니다.", sources: [] });

  return res.status(200).json(out);
}
