// 멀티턴 답변 프록시 — Vercel 서버리스 함수 (Google Gemini 무료 티어 경유)
//
// 엔드포인트: https://<project>.vercel.app/api/multi-turn
// 역할: 프론트(src/app/services/multi-turn-answer.ts 의 llmProvider)의
//   POST { question, priorQuestions } 를 받아 Gemini 호출 → { body, sources:[{name,url}] } 반환.
//
// ⚠️ API 키는 이 파일/깃에 넣지 않는다. Vercel 프로젝트 환경변수 GEMINI_API_KEY 로만 등록.
//    무료 키 발급: https://aistudio.google.com/apikey

const MODEL = "gemini-2.5-flash"; // 무료 티어 지원 모델

const SYSTEM =
  "너는 한국 세법·노무 상담 도우미다. 사용자의 질문 유형을 분석해, 근거를 갖춘 " +
  "흐르는 줄글 문단(서식/번호/불릿 없이)으로 한국어로 답하라. 관련 법령·해석례를 " +
  "name(법령명 조문)과 url(국가법령정보센터 등 공식 링크) 배열로 함께 제시하라. " +
  "확실하지 않은 URL은 넣지 말 것.";

const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    body: { type: "STRING" },
    sources: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, url: { type: "STRING" } },
        required: ["name", "url"],
      },
    },
  },
  required: ["body", "sources"],
};

export default async function handler(req, res) {
  // 허용 도메인: 프로덕션은 ALLOW_ORIGIN 환경변수로 내 GitHub Pages 도메인만 두는 것을 권장.
  const allowOrigin = process.env.ALLOW_ORIGIN || "*";
  res.setHeader("Access-Control-Allow-Origin", allowOrigin);
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ body: "Method Not Allowed", sources: [] });
  if (!process.env.GEMINI_API_KEY)
    return res.status(500).json({ body: "프록시에 GEMINI_API_KEY가 설정되지 않았습니다.", sources: [] });

  // 본문 파싱 (Vercel이 JSON을 자동 파싱하지만, 문자열로 올 때도 대비)
  let question = "";
  let priorQuestions = [];
  try {
    const parsed = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    question = String(parsed.question ?? "");
    priorQuestions = Array.isArray(parsed.priorQuestions) ? parsed.priorQuestions : [];
  } catch {
    return res.status(400).json({ body: "잘못된 요청 형식입니다.", sources: [] });
  }

  const userText =
    (priorQuestions.length ? `이전 질문: ${priorQuestions.join(" / ")}\n\n` : "") +
    `질문: ${question}`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
  let r;
  try {
    r = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY, // ← 서버 환경변수에서만 읽음
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts: [{ text: userText }] }],
        generationConfig: { responseMimeType: "application/json", responseSchema: RESPONSE_SCHEMA },
      }),
    });
  } catch (e) {
    return res.status(502).json({ body: `LLM 호출 실패: ${e}`, sources: [] });
  }

  if (!r.ok) {
    const detail = await r.text();
    return res.status(502).json({ body: `Gemini 오류 ${r.status}: ${detail.slice(0, 300)}`, sources: [] });
  }

  const data = await r.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");

  let out = { body: "", sources: [] };
  try {
    const parsed = JSON.parse(text);
    out.body = String(parsed.body ?? "");
    out.sources = Array.isArray(parsed.sources)
      ? parsed.sources.map((s) => ({ name: String(s.name ?? ""), url: String(s.url ?? "") }))
      : [];
  } catch {
    out.body = text || "답변을 생성하지 못했습니다.";
  }

  return res.status(200).json(out);
}
