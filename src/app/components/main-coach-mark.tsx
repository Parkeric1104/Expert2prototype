import { useEffect } from "react";
import { X } from "lucide-react";

// 메인 화면 코치마크 (MAIN_COACH_MARK / CM-001)
// ⚠️ 개발만 완료 · 아직 앱에 연결(적용)하지 않음 — 활성화 시 App/홈에서 <MainCoachMark/>를 렌더하고
//    아래 targetId(coach-input / coach-filter / coach-prompt)를 홈 요소에 부여하면 됨.
// 노출 정책: 계정별 최초 1회 (localStorage)

const STORAGE_KEY = "main-coach-mark-v1";

export interface MainCoachHint {
  targetId: string;
  text: string;
}

// 디자인(CM-001) 3개 포인터
export const MAIN_COACH_HINTS: MainCoachHint[] = [
  { targetId: "coach-input", text: "세법 또는 노무와 관련한 질문을 할 수 있어요" },
  { targetId: "coach-filter", text: "특정 법령 안에서 정보를 검색하도록 선택할 수 있어요" },
  { targetId: "coach-prompt", text: "추천 질문을 선택해 질문할 수 있어요" },
];

// 최초 1회 노출 여부 헬퍼 (활성화 시 사용)
export const shouldShowMainCoachMark = (): boolean => {
  try {
    return typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) !== "1";
  } catch {
    return false;
  }
};

interface MainCoachMarkProps {
  show: boolean;
  onClose: () => void;
}

export function MainCoachMark({ show, onClose }: MainCoachMarkProps) {
  useEffect(() => {
    if (!show) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const handleClose = () => {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* noop */
    }
    onClose();
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/60" onClick={handleClose}>
      {/* 상단 타이틀 + 닫기 */}
      <div className="absolute top-6 left-0 right-0 flex flex-col items-center px-6" onClick={(e) => e.stopPropagation()}>
        <p className="text-white text-lg font-bold text-center" style={{ wordBreak: "keep-all" }}>
          세법부터 노무까지, 새로워진 <span className="text-primary">세법/노무도우미</span>를 사용해보세요!
        </p>
      </div>
      <button
        onClick={handleClose}
        aria-label="닫기"
        className="absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center text-white/90 hover:bg-white/10 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* 3개 힌트 (활성화 시 targetId 기준 위치로 앵커링) */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 px-8 pointer-events-none">
        {MAIN_COACH_HINTS.map((h) => (
          <p key={h.targetId} className="text-white text-sm text-center" style={{ wordBreak: "keep-all" }}>
            {h.text}
          </p>
        ))}
      </div>
    </div>
  );
}
