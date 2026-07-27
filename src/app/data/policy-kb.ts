// 기획 정책 챗봇 — 지식 베이스 (Policy KB)
//
// 문서를 "## 제목" 단위로 청크 분할하고, 간단한 한국어 키워드 스코어링으로
// 질문과 관련된 청크를 검색한다.
//
// 지식 소스 (우선순위):
//   1. 로컬 SQLite DB (POC) — 개발서버의 /api/policy-bot/policies 에서 런타임 로드
//      (data/policy-bot.db, server/policy-db.mjs — 최초 실행 시 기획 정책 문서로 자동 시드)
//   2. 번들 문서(폴백) — API가 없는 환경(GitHub Pages 배포본 등)에서는 빌드 시
//      raw로 포함된 docs/policies/*.md 사용
//
// 범위: **기획 정책 문서만** (PRD Q1 결정 2026-07-27 — 디자인 가이드/온보딩 제외)
// ⚠️ ECM(OneFFICE) 자동 동기화는 현재 불가(그룹웨어 인증 필요) — docs/policies/README.md 참조.

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
  return docs;
}

const BUNDLED_DOCS: PolicyDoc[] = buildDocs();

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

// ── 지식 베이스 상태 (기본: 번들 문서 → initPolicyKb() 성공 시 로컬 DB로 교체) ──

export type KbSource = "bundled" | "local-db";

let currentDocs: PolicyDoc[] = BUNDLED_DOCS;
let currentChunks: PolicyChunk[] = BUNDLED_DOCS.flatMap(chunkDoc);
let kbSource: KbSource = "bundled";

export function getKbStatus(): { source: KbSource; docCount: number } {
  return { source: kbSource, docCount: currentDocs.length };
}

/**
 * 로컬 DB API에서 문서를 로드해 지식 베이스를 교체한다.
 * API가 없거나 실패하면(배포본 등) 번들 문서를 그대로 사용한다.
 */
export async function initPolicyKb(): Promise<{ source: KbSource; docCount: number }> {
  try {
    const res = await fetch("/api/policy-bot/policies");
    if (res.ok) {
      const data = await res.json();
      const docs: PolicyDoc[] = (data.docs ?? []).map(
        (d: { id: string; title: string; source: string; content: string }) => ({
          id: d.id,
          title: d.title,
          source: d.source,
          content: d.content,
        }),
      );
      if (docs.length > 0) {
        currentDocs = docs;
        currentChunks = docs.flatMap(chunkDoc);
        kbSource = "local-db";
      }
    }
  } catch {
    // API 없음(프로덕션 정적 배포 등) → 번들 문서 유지
  }
  return getKbStatus();
}

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
  const scored = currentChunks.map((c) => ({ ...c, score: scoreChunk(c, tokens) }))
    .filter((c) => c.score >= tokens.length * 2) // 잡음 컷
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, k);
}
