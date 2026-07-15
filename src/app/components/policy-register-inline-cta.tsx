import { useEffect, type ReactNode } from "react";
import { FilePlus2, X } from "lucide-react";

// 미등록 순간 유도 배너 (파일럿)
// - 노출 위치: 메인화면 (이력 기반 트리거 — 사규 관련 노무 세션 발생 + 미등록)
// - 정확도 미확보 상태이므로 "정확 인용"이 아닌 "함께 검토(미래형)" 카피 사용
// - 계측 훅: shown / clicked / dismissed (분석 도구 연동 전 콘솔 자리표시)
const trackCta = (event: "shown" | "clicked" | "dismissed") =>
  console.info(`[policy-cta] ${event}`);

// 이력 기반 넛지 상태 키 (chat에서 set, home에서 read)
export const POLICY_NUDGE_PENDING_KEY = "policy-nudge-pending-v1"; // 사규 관련 노무 세션 발생
export const POLICY_NUDGE_DISMISS_KEY = "policy-nudge-dismissed-v1"; // '다시 안 보기' 영구 억제

interface PolicyRegisterInlineCTAProps {
  onRegister: () => void;
  onDismiss: () => void;
  title?: string;
  description?: ReactNode;
}

export function PolicyRegisterInlineCTA({
  onRegister,
  onDismiss,
  title = "최근 노무 상담을 하셨네요.",
  description = (
    <>
      회사 규정(사규)을 등록하면 다음 노무 질문부터 <span className="text-foreground font-medium">귀사 기준이 반영</span>돼요.
    </>
  ),
}: PolicyRegisterInlineCTAProps) {
  // 노출 시 1회 계측
  useEffect(() => {
    trackCta("shown");
  }, []);

  return (
    <div
      className="w-full rounded-2xl border border-primary/30 bg-primary/5 px-5 py-4 flex items-start gap-3"
      style={{ wordBreak: "keep-all" }}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <FilePlus2 className="w-4.5 h-4.5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>

        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => {
              trackCta("clicked");
              onRegister();
            }}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <FilePlus2 className="w-4 h-4" />
            회사 규정 등록하기
          </button>
          <button
            onClick={() => {
              trackCta("dismissed");
              onDismiss();
            }}
            className="rounded-full px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            다시 안 보기
          </button>
        </div>
      </div>

      <button
        onClick={() => {
          trackCta("dismissed");
          onDismiss();
        }}
        aria-label="닫기"
        className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
