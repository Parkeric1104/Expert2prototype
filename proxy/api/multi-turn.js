// 멀티턴 답변 프록시 — Vercel 서버리스 함수 (Google Gemini 무료 티어 경유)
//
// 엔드포인트: https://<project>.vercel.app/api/multi-turn
// 역할: 프론트(src/app/services/multi-turn-answer.ts 의 llmProvider)의
//   POST { question, priorQuestions } 를 받아 Gemini 호출 → { body, sources:[{name,url}] } 반환.
//
// ⚠️ API 키는 이 파일/깃에 넣지 않는다. Vercel 프로젝트 환경변수 GEMINI_API_KEY 로만 등록.
//    무료 키 발급: https://aistudio.google.com/apikey

import { pickFallbackAnswer } from "./_fallback-answers.js";

const MODEL = "gemini-2.5-flash"; // 무료 티어 지원 모델

const SYSTEM =
  "너는 한국 세법·노무 상담 도우미다. 질문 유형을 분석해, 아래 3단 흐름의 '흐르는 줄글'로 " +
  "한국어 답변을 작성하라. 제목·번호·불릿·머리기호를 절대 쓰지 말고 2~3개 문단으로만 쓴다.\n" +
  "(1) 첫 문단: 핵심 결론과 필수 요건을 한두 문장으로 단정한다.\n" +
  "(2) 둘째 문단: 그 근거(관련 법령의 취지, 대법원 판례의 경향)와 지키지 않을 경우의 법적 리스크를 설명한다.\n" +
  "(3) 셋째 문단: '따라서 반드시 ~하셔야 합니다' 형태로 구체적 실무 조치를 안내한다.\n" +
  "각 문단은 paragraphs 배열의 개별 원소로 담는다(문단 하나 = 배열 원소 하나, 총 2~3개).\n" +
  "법령·판례 인용은 문단 본문에 넣지 말고, 반드시 sources 배열로만 제시한다 " +
  "(name=법령명과 조문 예: '근로기준법 제17조', url=국가법령정보센터 등 공식 링크). " +
  "확실하지 않은 url은 넣지 말 것.";

// paragraphs를 배열로 받아 서버에서 \n\n으로 합친다 → 문단 구분을 확실히 보장.
const RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    paragraphs: {
      type: "ARRAY",
      description: "2~3개의 문단. 각 원소가 하나의 문단(서식 없는 줄글)이다.",
      items: { type: "STRING" },
    },
    sources: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: { type: "STRING" }, url: { type: "STRING" } },
        required: ["name", "url"],
      },
    },
  },
  required: ["paragraphs", "sources"],
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
  } catch {
    // 네트워크 등 호출 자체 실패 → 정형화된 답변으로 폴백(에러 노출 안 함)
    return res.status(200).json(pickFallbackAnswer());
  }

  if (!r.ok) {
    // 429(무료 티어 한도 초과) 및 기타 오류 → 정형화된 답변 10종 중 무작위 노출
    return res.status(200).json(pickFallbackAnswer());
  }

  const data = await r.json();
  const text = (data?.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");

  let out = { body: "", sources: [] };
  try {
    const parsed = JSON.parse(text);
    // 문단 배열을 빈 줄로 합쳐 본문 구성(문단 구분 보장). 구버전 호환으로 body도 허용.
    out.body = Array.isArray(parsed.paragraphs)
      ? parsed.paragraphs.map((p) => String(p).trim()).filter(Boolean).join("\n\n")
      : String(parsed.body ?? "");
    out.sources = Array.isArray(parsed.sources)
      ? parsed.sources.map((s) => ({ name: String(s.name ?? ""), url: String(s.url ?? "") }))
      : [];
  } catch {
    out.body = text || "";
  }

  // 본문이 비었으면(파싱 실패·빈 응답 등) 정형화된 답변으로 폴백
  if (!out.body.trim()) return res.status(200).json(pickFallbackAnswer());

  return res.status(200).json(out);
}
