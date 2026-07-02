// 멀티턴 답변 생성 — 프로바이더 추상화 (LLM-ready)
//
// 목적: 멀티턴 답변을 "줄글 본문 + 하단 법령 하이퍼링크" 형태로 만든다.
// 현재는 오프라인 더미가 기본. 환경변수만 바꾸면 실제 LLM(프록시 경유)로 전환된다.
//
// 전환 방법 (코드 수정 불필요):
//   1) 백엔드/서버리스 프록시 배포 (Cloudflare Worker, Vercel/Netlify Function 등)
//      - 프록시가 ANTHROPIC_API_KEY를 "서버 환경변수"로 보관 (클라이언트에 키를 두지 않음)
//      - 프록시는 아래 형태로 Claude API를 호출:
//          POST /v1/messages
//          { model: "claude-opus-4-8",
//            output_config: { format: { type: "json_schema", schema: {   // 구조화 출력으로 형태 강제
//              type: "object",
//              properties: {
//                body: { type: "string" },                                // 서식 없는 줄글 문단
//                sources: { type: "array", items: { type: "object",
//                  properties: { name: {type:"string"}, url: {type:"string"} },
//                  required: ["name","url"], additionalProperties: false } }
//              }, required: ["body","sources"], additionalProperties: false } } },
//            system: "질문 유형을 분석해 3단 흐름의 흐르는 줄글로 답하라(제목/번호/불릿 금지, 2~3문단):
//                     (1) 핵심 결론·필수 요건 단정, (2) 근거(법령 취지·대법원 판례 경향)와 미준수 리스크,
//                     (3) '따라서 반드시 ~하셔야' 형태의 실무 조치. 법령 인용은 body가 아니라 sources
//                     배열(name=법령명 조문, url=공식 링크)로만 제시. (proxy/api/multi-turn.js 의 SYSTEM과 동일)",
//            messages: [{ role: "user", content: <question(+prior)> }] }
//      - 응답 JSON을 { body, sources:[{name,url}] } 형태로 그대로 반환
//   2) 빌드 환경변수 설정:
//        VITE_MULTI_TURN_PROVIDER=llm
//        VITE_LLM_ENDPOINT=https://<your-proxy>/multi-turn
//
// ⚠️ API 키를 이 프론트엔드 코드/환경변수에 넣지 말 것 — 정적 배포라 유출된다. 반드시 프록시 서버에 둔다.

import { EnhancedResponseData, buildMultiTurnBody } from "@/app/data/dummy-responses";

export type MultiTurnSourceType = "법령" | "해석례" | "사규" | "판례";

export interface MultiTurnSource {
  type: MultiTurnSourceType;
  title: string;
  url?: string;
}

export interface MultiTurnAnswer {
  /** 대화형 본문 (서식 없는 줄글) */
  body: string;
  /** 하단 법령/해석례 하이퍼링크 (사규는 렌더 단계에서 제외) */
  sources: MultiTurnSource[];
}

export interface MultiTurnAnswerRequest {
  /** 이번 후속 질문 */
  question: string;
  /** 세션의 이전 질문들 (LLM 맥락용) */
  priorQuestions?: string[];
  /** 오프라인 더미용 근거 데이터 */
  enhancedData?: EnhancedResponseData;
}

export type MultiTurnProvider = (req: MultiTurnAnswerRequest) => Promise<MultiTurnAnswer>;

// ── 기본 프로바이더: 오프라인 더미 (기존 동작 유지) ──
const dummyProvider: MultiTurnProvider = async (req) => {
  const data = req.enhancedData;
  if (!data) return { body: req.question, sources: [] };
  return {
    body: buildMultiTurnBody(data),
    sources: (data.sources ?? []).map((s) => ({ type: s.type, title: s.title, url: s.url })),
  };
};

// ── 실제 LLM 프로바이더: 백엔드 프록시 경유 (키는 프록시 서버에만 존재) ──
const llmProvider: MultiTurnProvider = async (req) => {
  const endpoint = import.meta.env.VITE_LLM_ENDPOINT as string | undefined;
  if (!endpoint) {
    throw new Error("VITE_LLM_ENDPOINT 미설정 — LLM 프록시 엔드포인트가 필요합니다.");
  }
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question: req.question, priorQuestions: req.priorQuestions ?? [] }),
  });
  if (!res.ok) throw new Error(`LLM 프록시 오류: ${res.status}`);
  const data = await res.json(); // 기대 형태: { body: string, sources: [{ name, url }] }
  const sources: MultiTurnSource[] = (data.sources ?? []).map((s: { name: string; url?: string }) => ({
    type: "법령",
    title: s.name,
    url: s.url,
  }));
  return { body: String(data.body ?? ""), sources };
};

/**
 * 멀티턴 답변 생성. 프로바이더는 VITE_MULTI_TURN_PROVIDER로 선택('llm'이면 프록시, 아니면 더미).
 * 반환 형태는 두 프로바이더 모두 동일(MultiTurnAnswer)하므로 렌더 코드는 바뀌지 않는다.
 */
export function generateMultiTurnAnswer(req: MultiTurnAnswerRequest): Promise<MultiTurnAnswer> {
  const provider: MultiTurnProvider =
    (import.meta.env.VITE_MULTI_TURN_PROVIDER as string) === "llm" ? llmProvider : dummyProvider;
  return provider(req);
}
