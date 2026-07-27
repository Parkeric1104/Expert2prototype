// 기획 정책 챗봇 — 답변 생성 (프로바이더 추상화)
//
// 기본: 오프라인 검색 모드 — 지식 베이스에서 관련 정책 발췌를 그대로 보여준다 (LLM 불필요).
// LLM 모드: 환경변수 설정 시 Claude 프록시(proxy/api/policy-bot.js) 경유로 실제 답변 생성.
//
// 전환 방법 (.env.local — 코드 수정 불필요):
//   VITE_POLICY_BOT_PROVIDER=llm
//   VITE_POLICY_BOT_ENDPOINT=https://<proxy>/api/policy-bot
//
// ⚠️ API 키를 프론트 코드/환경변수에 넣지 말 것 — 키는 프록시 서버 환경변수에만 둔다.

import { searchPolicyChunks, RetrievedChunk } from "@/app/data/policy-kb";

export interface PolicyBotSource {
  /** 문서 제목 */
  doc: string;
  /** 섹션 제목 */
  section: string;
  /** 저장소 내 경로 */
  path: string;
}

export interface PolicyBotAnswer {
  /** 답변 본문 (마크다운 아님 — 줄글 + 줄바꿈) */
  body: string;
  sources: PolicyBotSource[];
  /** 오프라인(검색) 모드 여부 — UI 안내용 */
  offline: boolean;
}

export interface PolicyBotRequest {
  question: string;
  /** 이전 대화 (LLM 맥락용) — [질문, 답변, 질문, ...] 순 */
  history?: { role: "user" | "assistant"; text: string }[];
}

function toSources(chunks: RetrievedChunk[]): PolicyBotSource[] {
  const seen = new Set<string>();
  const out: PolicyBotSource[] = [];
  for (const c of chunks) {
    const key = `${c.docId}#${c.section}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ doc: c.docTitle, section: c.section, path: c.source });
  }
  return out;
}

// ── 오프라인 프로바이더: 관련 정책 발췌를 그대로 제시 ──
async function offlineProvider(req: PolicyBotRequest): Promise<PolicyBotAnswer> {
  const chunks = searchPolicyChunks(req.question, 3);
  if (chunks.length === 0) {
    return {
      body:
        "관련된 기획 정책 문서를 찾지 못했어요.\n\n다른 키워드로 다시 질문해 보시거나, 해당 정책이 아직 문서화되지 않았다면 docs/policies/ 폴더에 문서를 추가해 주세요.",
      sources: [],
      offline: true,
    };
  }
  const body = chunks
    .map((c) => `【${c.docTitle} › ${c.section}】\n${c.text.trim()}`)
    .join("\n\n");
  return { body, sources: toSources(chunks), offline: true };
}

// ── LLM 프로바이더: Claude 프록시 경유 ──
async function llmProvider(req: PolicyBotRequest): Promise<PolicyBotAnswer> {
  const endpoint = import.meta.env.VITE_POLICY_BOT_ENDPOINT as string | undefined;
  if (!endpoint) throw new Error("VITE_POLICY_BOT_ENDPOINT 미설정");

  // 클라이언트에서 검색한 관련 청크를 프록시에 함께 보낸다 (프록시는 KB를 갖지 않음)
  const chunks = searchPolicyChunks(req.question, 6);
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      question: req.question,
      history: req.history ?? [],
      contextChunks: chunks.map((c) => ({
        doc: c.docTitle,
        section: c.section,
        path: c.source,
        text: c.text,
      })),
    }),
  });
  if (!res.ok) throw new Error(`정책 챗봇 프록시 오류: ${res.status}`);
  const data = await res.json(); // { body, sources: [{doc, section, path}] }
  return {
    body: String(data.body ?? ""),
    sources: Array.isArray(data.sources)
      ? data.sources.map((s: PolicyBotSource) => ({
          doc: String(s.doc ?? ""),
          section: String(s.section ?? ""),
          path: String(s.path ?? ""),
        }))
      : toSources(chunks),
    offline: false,
  };
}

export async function generatePolicyBotAnswer(req: PolicyBotRequest): Promise<PolicyBotAnswer> {
  const useLlm = (import.meta.env.VITE_POLICY_BOT_PROVIDER as string) === "llm";
  if (useLlm) {
    try {
      return await llmProvider(req);
    } catch (e) {
      console.warn("[policy-bot] LLM 프록시 실패 — 오프라인 검색 모드로 폴백", e);
      return offlineProvider(req);
    }
  }
  return offlineProvider(req);
}
