// 골든셋 매칭 — 사용자 질문을 노무사 검증 골든셋(70건)과 대조해
// 충분히 유사하면 검증된 답변/출처/의견서 초안을 그대로 활용한다.
//
// 설계 원칙
//  - 정적 배포(GitHub Pages)에서 백엔드 없이 결정적으로 동작.
//  - 보수적 임계값: 확실히 유사할 때만 매칭(오답 방지). 애매하면 null → 기존 LLM 프록시로 폴백.
//  - 동기 호출부(렌더·이력복원)가 많아 데이터는 정적 import(파싱 1회)로 로드한다.

import { GOLDEN_SET, type GoldenEntry, type GoldenPrecedent } from "@/app/data/golden-set";
import type { EnhancedResponseData } from "@/app/data/dummy-responses";
import type { MultiTurnAnswer, MultiTurnSource } from "@/app/services/multi-turn-answer";

// ── 정규화 & 유사도 ───────────────────────────────────────────────
// 한글/영숫자만 남기고 공백·기호 제거 → 표기 흔들림에 강인.
const normalize = (s: string): string =>
  (s || "")
    .toLowerCase()
    .replace(/\([^)]*\)/g, " ") // 괄호 주석 제거(질문 제목 괄호 포함 → 본문 비교 시 노이즈 감소)
    .replace(/[^0-9a-z가-힣]/g, "");

const trigrams = (s: string): Set<string> => {
  const n = normalize(s);
  const set = new Set<string>();
  if (n.length < 3) {
    if (n) set.add(n);
    return set;
  }
  for (let i = 0; i <= n.length - 3; i++) set.add(n.slice(i, i + 3));
  return set;
};

// 포함계수(overlap coefficient): |A∩B| / min(|A|,|B|)
// 짧은 질의가 긴 골든 질문에 포함될 때 높게 나와 길이 비대칭에 강함.
const overlap = (a: Set<string>, b: Set<string>): number => {
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  for (const g of small) if (large.has(g)) inter++;
  return inter / small.size;
};

const MATCH_THRESHOLD = 0.5; // 포함계수 임계값(보수적)
const MIN_QUERY_LEN = 6; // 정규화 후 최소 길이 — 너무 짧은 질의는 매칭 안 함

interface MatchResult {
  entry: GoldenEntry;
  score: number;
}

/** 질문을 골든셋과 대조해 가장 유사한 항목을 찾는다(임계값 미만이면 null). 동기(사전 로드된 배열 대상). */
export function matchGolden(question: string, set: GoldenEntry[]): MatchResult | null {
  const nq = normalize(question);
  if (nq.length < MIN_QUERY_LEN) return null;
  const qg = trigrams(question);

  let best: MatchResult | null = null;
  for (const entry of set) {
    const titleN = normalize(entry.questionTitle);
    // 제목이 질의에 통째로 포함되면 강한 신호(짧은 데모 질문 대응)
    const titleContained = titleN.length >= 4 && (nq.includes(titleN) || titleN.includes(nq));
    const sTitle = overlap(qg, trigrams(entry.questionTitle));
    const sBody = overlap(qg, trigrams(entry.question));
    let score = Math.max(sTitle, sBody * 0.95);
    if (titleContained) score = Math.max(score, 0.75);
    if (!best || score > best.score) best = { entry, score };
  }
  if (best && best.score >= MATCH_THRESHOLD) return best;
  return null;
}

/** 편의 함수 — 사전 로드된 골든셋 대상 매칭. 매칭 없으면 null. */
export function findGoldenMatch(question: string): GoldenEntry | null {
  const r = matchGolden(question, GOLDEN_SET);
  return r ? r.entry : null;
}

// ── 골든셋 → 앱 데이터 변환 ────────────────────────────────────────
const fmtDate = (d: string): string => {
  const m = /^(\d{4})(\d{2})(\d{2})$/.exec(d || "");
  return m ? `${m[1]}.${Number(m[2])}.${Number(m[3])}.` : d || "";
};

const precedentChipTitle = (p: GoldenPrecedent): string =>
  p.date ? `대법원 ${fmtDate(p.date)} ${p.caseNo}` : p.caseNo;

/** 골든셋 항목 → 하단 출처 칩(법령 + 판례) */
export function goldenSources(entry: GoldenEntry): MultiTurnSource[] {
  const laws: MultiTurnSource[] = entry.laws.map((l) => ({ type: "법령", title: l }));
  const precs: MultiTurnSource[] = entry.precedents.map((p) => ({
    type: "판례",
    title: precedentChipTitle(p),
  }));
  return [...laws, ...precs];
}

/** 골든셋 항목 → 멀티턴(대화형) 답변: 검증된 답변 본문 + 출처 */
export function goldenToMultiTurnAnswer(entry: GoldenEntry): MultiTurnAnswer {
  return { body: stripMd(entry.answer), sources: goldenSources(entry) };
}

// 의견서 초안 마크다운을 화면 표기용으로 정리(볼드 **, 인용 > 제거).
const stripMd = (s: string): string =>
  (s || "")
    .split("\n")
    .map((l) => l.replace(/^\s*>\s?/, "").replace(/\*\*/g, "").replace(/\s+$/g, ""))
    .join("\n")
    .trim();

// 의견서 초안(### 1. 사실관계 / 2. 질의내용 / 3. 검토 내용 / 4. 결론…)을 섹션별로 분리.
interface OpinionSections {
  fact: string;
  query: string;
  review: string;
  conclusion: string;
}

export function parseOpinionSections(draft: string): OpinionSections {
  const out: OpinionSections = { fact: "", query: "", review: "", conclusion: "" };
  if (!draft) return out;
  // "### n. 제목" 기준으로 분할
  const parts = draft.split(/^\s*#{1,6}\s*\d*\.?\s*/m).map((p) => p.trim());
  const withHeads = draft.match(/^\s*#{1,6}\s*\d*\.?\s*([^\n]+)/gm) || [];
  // parts[0]은 헤딩 이전(대개 빈 문자열). 헤딩 개수만큼 뒤에서부터 매핑.
  const bodies = parts.slice(parts.length - withHeads.length);
  withHeads.forEach((h, i) => {
    const head = h.replace(/^\s*#{1,6}\s*\d*\.?\s*/, "").trim();
    const body = stripMd((bodies[i] || "").replace(/^[^\n]*\n?/, "")); // 첫 줄(제목) 제거 후 본문
    // "관련 법령/판례/참고" 섹션은 하단 출처 칩과 중복 → 스킵
    if (/관련\s*법령|관련\s*판례|참고/.test(head)) return;
    if (/사실관계/.test(head)) out.fact = body;
    else if (/질의/.test(head)) out.query = body;
    else if (/검토/.test(head)) out.review = body;
    else if (/결론|판단|의견/.test(head)) out.conclusion = body;
  });
  // 파싱 실패 시(헤딩 없음) 전체를 검토 내용으로.
  if (!out.fact && !out.query && !out.review && !out.conclusion) out.review = stripMd(draft);

  // 명시적 결론 섹션이 없으면, 검토 말미의 권고/결론 문단을 결론으로 승격(중복 방지 위해 검토에서 제거).
  if (!out.conclusion && out.review) {
    const paras = out.review.split(/\n\s*\n/);
    const last = paras[paras.length - 1] || "";
    if (paras.length > 1 && /(따라서|권고|권고드립니다|바랍니다|권장|하시기 바|판단됩니다)/.test(last)) {
      out.conclusion = last.trim();
      out.review = paras.slice(0, -1).join("\n\n").trim();
    }
  }
  // 결론 앞 소제목("라. 결론" 등) 중복 제거
  out.conclusion = out.conclusion.replace(/^\s*[가-힣]\.\s*결론\s*\n?/, "").trim();
  return out;
}

/** 골든셋 항목 → EnhancedResponseData (최초 상세 답변 + 의견서 공통 소스) */
export function goldenToEnhancedData(entry: GoldenEntry): EnhancedResponseData {
  const s = parseOpinionSections(entry.opinionDraft);
  const sources = [
    ...entry.laws.map((l) => ({ type: "법령" as const, title: l, url: "", content: l })),
    ...entry.precedents.map((p) => ({
      type: "판례" as const,
      title: precedentChipTitle(p),
      url: "",
      content: p.title || precedentChipTitle(p),
    })),
  ];
  return {
    factAnalysis: s.fact || entry.answer.trim(),
    queryRedefinition: s.query || entry.questionTitle,
    reviewContent: s.review || entry.answer.trim(),
    conclusion: s.conclusion || "",
    sources,
  };
}

// 의견서(DocumentView) 섹션 형태
export interface GoldenDocSection {
  title: string;
  content: string[];
}

const toLines = (body: string): string[] =>
  (body || "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** 골든셋 항목 → 의견서(DocumentView) sections. 노무사 검증 초안(답변포맷변경)을 섹션별로 렌더. */
export function goldenToDocSections(entry: GoldenEntry): GoldenDocSection[] {
  const s = parseOpinionSections(entry.opinionDraft);
  const secs: GoldenDocSection[] = [];
  if (s.fact) secs.push({ title: "1. 사실관계", content: toLines(s.fact) });
  if (s.query) secs.push({ title: "2. 질의내용", content: toLines(s.query) });
  if (s.review) secs.push({ title: "3. 검토 내용", content: toLines(s.review) });
  if (s.conclusion) secs.push({ title: "4. 결론", content: toLines(s.conclusion) });
  // 관련 법령·판례 (하단 출처와 별개로 의견서 본문에도 명시)
  const refs: string[] = [
    ...entry.laws,
    ...entry.precedents.map((p) => (p.title ? `${precedentChipTitle(p)} (${p.title})` : precedentChipTitle(p))),
  ];
  if (refs.length) secs.push({ title: `${secs.length + 1}. 관련 법령 및 판례`, content: refs });
  // 파싱 실패 시 초안 전문을 단일 섹션으로.
  if (secs.length === 0) secs.push({ title: "검토 의견", content: toLines(entry.opinionDraft) });
  return secs;
}

/** 의견서 상단 참고 법령/판례 목록(문자열) — DocumentView data.laws 대체용 */
export function goldenLawStrings(entry: GoldenEntry): { laws: string[]; precedents: string[] } {
  return {
    laws: entry.laws.map((l) => `「${l.split(" ")[0]}」 ${l.split(" ").slice(1).join(" ")}`.trim()),
    precedents: entry.precedents.map((p) =>
      p.title ? `${precedentChipTitle(p)} (${p.title})` : precedentChipTitle(p)
    ),
  };
}
