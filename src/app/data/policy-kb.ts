// 기획 정책 챗봇 — 지식 베이스 (Policy KB)
//
// 빌드 시점에 저장소 문서를 raw로 불러와 "## 제목" 단위로 청크 분할하고,
// 간단한 한국어 키워드 스코어링으로 질문과 관련된 청크를 검색한다.
//
// 소스:
//   - docs/policies/*.md  (ECM 내보내기 문서 — 폴더에 추가하면 자동 포함)
//   - ONBOARDING.md, guidelines/Guidelines.md, DESIGN_SYSTEM.md
//
// ⚠️ ECM(OneFFICE) 자동 동기화는 현재 불가(그룹웨어 인증 필요) — docs/policies/README.md 참조.

import onboardingRaw from "../../../ONBOARDING.md?raw";
import guidelinesRaw from "../../../guidelines/Guidelines.md?raw";
import designSystemRaw from "../../../DESIGN_SYSTEM.md?raw";

export interface PolicyDoc {
  /** 파일 경로 기반 id */
  id: string;
  /** 문서 제목 (첫 "# 제목" 또는 파일명) */
  title: string;
  /** 원본 위치 표시용 */
  source: string;
  content: string;
}

export interface PolicyChunk {
  docId: string;
  docTitle: string;
  source: string;
  /** 섹션 제목 ("##" 헤딩, 없으면 문서 제목) */
  section: string;
  text: string;
}

// docs/policies/*.md 자동 수집 (README 제외)
const policyFiles = import.meta.glob("../../../docs/policies/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
}) as Record<string, string>;

function titleOf(content: string, fallback: string): string {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

function buildDocs(): PolicyDoc[] {
  const docs: PolicyDoc[] = [];
  for (const [path, content] of Object.entries(policyFiles)) {
    const file = path.split("/").pop() ?? path;
    if (file.toLowerCase() === "readme.md") continue;
    docs.push({
      id: `policies/${file}`,
      title: titleOf(content, file),
      source: `docs/policies/${file}`,
      content,
    });
  }
  docs.push(
    { id: "onboarding", title: titleOf(onboardingRaw, "ONBOARDING"), source: "ONBOARDING.md", content: onboardingRaw },
    { id: "guidelines", title: titleOf(guidelinesRaw, "디자인 가이드"), source: "guidelines/Guidelines.md", content: guidelinesRaw },
    { id: "design-system", title: titleOf(designSystemRaw, "디자인 시스템"), source: "DESIGN_SYSTEM.md", content: designSystemRaw },
  );
  return docs;
}

export const POLICY_DOCS: PolicyDoc[] = buildDocs();

// "##" 헤딩 단위 청크 분할 (헤딩 이전 서두는 문서 제목 섹션으로)
function chunkDoc(doc: PolicyDoc): PolicyChunk[] {
  const lines = doc.content.split("\n");
  const chunks: PolicyChunk[] = [];
  let section = doc.title;
  let buf: string[] = [];

  const flush = () => {
    const text = buf.join("\n").trim();
    if (text.length > 0) {
      chunks.push({ docId: doc.id, docTitle: doc.title, source: doc.source, section, text });
    }
    buf = [];
  };

  for (const line of lines) {
    const h = line.match(/^##\s+(.+)$/);
    if (h) {
      flush();
      section = h[1].trim();
    } else {
      buf.push(line);
    }
  }
  flush();
  return chunks;
}

export const POLICY_CHUNKS: PolicyChunk[] = POLICY_DOCS.flatMap(chunkDoc);

// ── 검색 (간단 키워드 스코어링) ──
// 한국어는 조사 붙은 어절 단위라 완전 일치가 잘 안 되므로,
// 질의 어절 + 2글자 부분 문자열(바이그램)을 함께 매칭한다.

function tokenize(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 2);
}

function bigrams(token: string): string[] {
  if (token.length <= 2) return [token];
  const out: string[] = [];
  for (let i = 0; i < token.length - 1; i++) out.push(token.slice(i, i + 2));
  return out;
}

function scoreChunk(chunk: PolicyChunk, tokens: string[]): number {
  const hay = (chunk.section + "\n" + chunk.text).toLowerCase();
  let score = 0;
  for (const t of tokens) {
    if (hay.includes(t)) {
      score += t.length * 3; // 어절 전체 일치 가중
      if (chunk.section.toLowerCase().includes(t)) score += t.length * 2; // 섹션 제목 일치 가중
      continue;
    }
    // 부분 일치(바이그램)
    const grams = bigrams(t);
    const hit = grams.filter((g) => hay.includes(g)).length;
    score += hit;
  }
  return score;
}

export interface RetrievedChunk extends PolicyChunk {
  score: number;
}

/** 질문과 관련된 상위 k개 청크 검색. 관련성 없으면 빈 배열. */
export function searchPolicyChunks(query: string, k = 4): RetrievedChunk[] {
  const tokens = tokenize(query);
  if (tokens.length === 0) return [];
  const scored = POLICY_CHUNKS.map((c) => ({ ...c, score: scoreChunk(c, tokens) }))
    .filter((c) => c.score >= tokens.length * 2) // 잡음 컷
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
