import { AlertTriangle } from "lucide-react";

interface TrialBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** 'ONE AI 문의' 클릭 시 이동할 URL */
  inquiryUrl?: string;
}

// 체험판 이용 불가 알럿 — 체험판에서 미제공 기능 선택 시 노출 (⚠ + 취소 / ONE AI 문의)
export function TrialBlockModal({
  isOpen,
  onClose,
  inquiryUrl = "https://www.douzone.com",
}: TrialBlockModalProps) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-2xl shadow-2xl w-full max-w-[360px] px-8 py-9 flex flex-col items-center text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-5">
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        </div>
        <p className="text-base font-bold text-foreground" style={{ wordBreak: "keep-all" }}>
          체험판에서는 사용하실 수 없습니다.
        </p>
        <div className="mt-7 flex items-center gap-2 w-full justify-center">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => window.open(inquiryUrl, "_blank", "noopener,noreferrer")}
            className="px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            ONE AI 문의
          </button>
        </div>
      </div>
    </div>
  );
}
