// 멀티턴 답변 프록시 — Google Gemini(무료 티어) 경유
//
// 역할: 프론트엔드(src/app/services/multi-turn-answer.ts 의 llmProvider)가 보내는
//   POST { question, priorQuestions } 를 받아 Gemini를 호출하고,
//   프론트가 기대하는 { body, sources:[{name,url}] } 형태로 그대로 돌려준다.
//   → 프론트엔드 코드는 제공사(Gemini/Claude)를 몰라도 되며 수정 불필요.
//
// ⚠️ API 키는 이 파일/깃에 넣지 않는다. 배포 후 아래 명령으로 "서버 시크릿"에만 등록:
//     wrangler secret put GEMINI_API_KEY
//   무료 키 발급: https://aistudio.google.com/apikey  (Google 계정으로 즉시 발급)

const MODEL = "gemini-2.5-flash"; // 무료 티어 지원 모델

const SYSTEM =
  "너는 한국 세법·노무 상담 도우미다. 사용자의 질문 유형을 분석해, 근거를 갖춘 " +
  "흐르는 줄글 문단(서식/번호/불릿 없이)으로 한국어로 답하라. 관련 법령·해석례를 " +
  "name(법령명 조문)과 url(국가법령정보센터 등 공식 링크) 배열로 함께 제시하라. " +
  "확실하지 않은 URL은 넣지 말 것.";

// Gemini 구조화 출력 스키마 (프론트 계약과 동일한 형태 강제)
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

export default {
  async fetch(req, env) {
    // 허용 도메인: 프로덕션은 내 GitHub Pages 도메인만 두는 것을 권장. 미설정 시 전체 허용(프로토타입).
    const allowOrigin = env.ALLOW_ORIGIN || "*";
    const cors = {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (req.method === "OPTIONS") return new Response(null, { headers: cors });
    if (req.method !== "POST")
      return new Response("Method Not Allowed", { status: 405, headers: cors });
    if (!env.GEMINI_API_KEY)
      return json({ body: "프록시에 GEMINI_API_KEY가 설정되지 않았습니다.", sources: [] }, 500, cors);

    let question = "";
    let priorQuestions = [];
    try {
      const parsed = await req.json();
      question = String(parsed.question ?? "");
      priorQuestions = Array.isArray(parsed.priorQuestions) ? parsed.priorQuestions : [];
    } catch {
      return json({ body: "잘못된 요청 형식입니다.", sources: [] }, 400, cors);
    }

    const userText =
      (priorQuestions.length ? `이전 질문: ${priorQuestions.join(" / ")}\n\n` : "") +
      `질문: ${question}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
    let res;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-goog-api-key": env.GEMINI_API_KEY, // ← 서버 시크릿에서만 읽음 (URL·프론트에 노출 안 함)
        },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: "user", parts: [{ text: userText }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: RESPONSE_SCHEMA,
          },
        }),
      });
    } catch (e) {
      return json({ body: `LLM 호출 실패: ${e}`, sources: [] }, 502, cors);
    }

    if (!res.ok) {
      const detail = await res.text();
      return json({ body: `Gemini 오류 ${res.status}: ${detail.slice(0, 300)}`, sources: [] }, 502, cors);
    }

    const data = await res.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") ?? "";

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

    return json(out, 200, cors);
  },
};

function json(obj, status, cors) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json", ...cors },
  });
}
