import { useState } from "react";
import { Sparkles, X } from "lucide-react";

// 단일턴 → 멀티턴 전환 안내 (1회성 인라인 배너).
// 서버/BO 불필요 — localStorage 플래그로 최초 1회만 노출, 닫으면 다시 표시하지 않음.
// 첫 답변이 생성된 시점(show=true)에 채팅 상단에 노출.
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
    <div className="mb-5 flex items-start gap-3 rounded-2xl bg-[#EBF1FF] border border-primary/20 px-4 py-3.5 shadow-sm">
      <span className="flex-shrink-0 mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary/10">
        <Sparkles className="h-4 w-4 text-primary" />
      </span>
      <div className="flex-1 min-w-0" style={{ wordBreak: "keep-all" }}>
        <p className="text-sm font-semibold text-foreground">
          이제 답변에 <span className="text-primary">이어서 질문</span>할 수 있어요
        </p>
        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
          앞선 대화를 기억해 더 정확하게 답해드려요. 새로운 주제는 상단 ‘메인으로 돌아가기’로 새 대화를 시작해 주세요.
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
  );
}
