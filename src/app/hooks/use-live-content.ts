import { useEffect, useState } from "react";

/**
 * BO 콘텐츠(공지·팝업·버전) 변경을 새로고침 없이 반영.
 * - storage 이벤트: 다른 탭(예: ?bo 콘솔)에서 localStorage 변경 시 즉시 감지
 * - focus / visibilitychange: 탭 복귀 시 재검증(누락 방지)
 *
 * 이 훅을 App에서 호출하면 상태 갱신으로 App+하위가 리렌더 → getter를 새로 읽어
 * 공지 목록/상세·사이드패널 레드닷·버전 표기가 자동 최신화된다.
 * (같은 탭에서 ?bo↔서비스 이동은 앱 전체 재마운트라 별도 처리 불필요)
 */
const BO_KEYS = ["bo_notices", "bo_popups", "bo_version"];

export function useContentTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    const onStorage = (e: StorageEvent) => {
      if (!e.key || BO_KEYS.includes(e.key)) bump();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") bump();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", bump);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", bump);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);
  return tick;
}
