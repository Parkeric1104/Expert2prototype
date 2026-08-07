/**
 * 경량 이벤트 트래킹 (정책 등록 퍼널 계측) — GA 비종속.
 *
 * 이벤트를 다음 3곳에 동시에 남긴다:
 *  1) window.dataLayer  — GA/GTM이 있으면 자동 수집, 없어도 무해(그냥 배열에 쌓임)
 *  2) localStorage 카운터 — 새로고침에도 누적, 브라우저에서 바로 집계 가능
 *  3) console.debug     — 실시간 확인
 *
 * 운영 전환 시: track() 안에서 fetch로 사내 로그 서버/DB에 전송만 추가하면 됨(GA 불필요).
 *
 * 콘솔에서 집계 조회:  __funnel()   /  초기화:  __funnelReset()
 */

type TrackProps = Record<string, unknown>;

const LS_KEY = "policy_funnel_counts";

function readCounts(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "{}");
  } catch {
    return {};
  }
}

function writeCounts(counts: Record<string, number>) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(counts));
  } catch {
    /* storage 불가 환경 무시 */
  }
}

export function track(step: string, props: TrackProps = {}) {
  if (typeof window !== "undefined") {
    const w = window as unknown as { dataLayer?: unknown[] };
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push({ event: "policy_funnel", step, ...props });

    const counts = readCounts();
    const key = props.source ? `${step}:${props.source}` : step;
    counts[key] = (counts[key] || 0) + 1;
    writeCounts(counts);
  }
  console.debug("[funnel]", step, props);
}

/** 현재까지 누적된 퍼널 카운트 반환 */
export function getFunnelSummary(): Record<string, number> {
  return readCounts();
}

/** 퍼널 카운트 초기화 */
export function resetFunnel() {
  writeCounts({});
}

// 콘솔에서 바로 조회/초기화할 수 있도록 노출
if (typeof window !== "undefined") {
  const w = window as unknown as Record<string, unknown>;
  w.__funnel = getFunnelSummary;
  w.__funnelReset = resetFunnel;
}
