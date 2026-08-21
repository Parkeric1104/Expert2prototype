import { useState } from "react";
import { Sparkles, X } from "lucide-react";

// 단일턴 → 멀티턴 전환 안내 (1회성 플로팅 팝업).
// 채팅 레이어 위로 뜨는 고정 카드(딤 없음·비차단) — 입력창 바로 위 하단 중앙에 노출.
// 서버/BO 불필요 — localStorage 플래그로 최초 1회만, 닫으면 다시 표시하지 않음.
// 첫 답변이 생성된 시점(show=true)에 노출.
const SEEN_KEY = "multiturn_intro_seen";

export function MultiTurnIntroBanner({ show }: { show: boolean }) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SEEN_KEY) === "1";
  });

  if (!show || dismissed) return null;

  const close = () => {
    try {
      localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* 저장 실패해도 세션 내 숨김은 동작 */
    }
    setDismissed(true);
  };

  return (
    // 고정 플로팅: 입력창 위(하단 중앙). 딤 없이 채팅 위에 떠 있어 진행을 막지 않음.
    <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-[520px] px-0 pointer-events-none">
      <div className="pointer-events-auto flex items-start gap-3 rounded-2xl bg-card border border-primary/20 px-4 py-3.5 shadow-xl">
        <span className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-4 w-4 text-primary" />
        </span>
        <div className="flex-1 min-w-0" style={{ wordBreak: "keep-all" }}>
          <p className="text-sm font-semibold text-foreground">
            이제 답변에 <span className="text-primary">이어서 질문</span>할 수 있어요!
          </p>
          <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
            이전 대화를 기억해 더 정확하게 답해드려요. 궁금한 점을 이어서 물어보세요.
          </p>
        </div>
        <button
          onClick={close}
          aria-label="안내 닫기"
          className="flex-shrink-0 -mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-primary/10 hover:text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
