import { useEffect } from "react";
import { FilePlus2, ChevronRight, X } from "lucide-react";

// 미등록 순간 유도 힌트 (파일럿)
// - 노출 위치: 메인화면 입력창 하단 인라인(한 줄) — 레이아웃을 밀지 않는 은은한 힌트
// - 이력 기반 트리거: 사규 관련 노무 세션 발생(pending) + 미등록 + 미억제
// - 정확도 미확보 상태이므로 "정확 인용"이 아닌 미래형 카피 사용
// - 계측 훅: shown / clicked / dismissed (분석 도구 연동 전 콘솔 자리표시)
const trackCta = (event: "shown" | "clicked" | "dismissed") =>
  console.info(`[policy-cta] ${event}`);

// 이력 기반 넛지 상태 키 (chat에서 set, home에서 read)
export const POLICY_NUDGE_PENDING_KEY = "policy-nudge-pending-v1"; // 사규 관련 노무 세션 발생
export const POLICY_NUDGE_DISMISS_KEY = "policy-nudge-dismissed-v1"; // '다시 안 보기' 영구 억제

interface PolicyRegisterInlineCTAProps {
  onRegister: () => void;
  onDismiss: () => void;
}

export function PolicyRegisterInlineCTA({ onRegister, onDismiss }: PolicyRegisterInlineCTAProps) {
  // 노출 시 1회 계측
  useEffect(() => {
    trackCta("shown");
  }, []);

  return (
    // 입력 카드에 통합된 하단 섹션(더블박스) — 상단 구분선으로 입력 영역과 분리, 하단 라운드 상속
    <div
      className="w-full border-t border-border/60 rounded-b-2xl bg-muted/50 px-4 py-2.5 flex items-center gap-2"
      style={{ wordBreak: "keep-all" }}
    >
      <button
        onClick={() => {
          trackCta("clicked");
          onRegister();
        }}
        className="flex-1 inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors text-left"
      >
        <FilePlus2 className="w-3 h-3 flex-shrink-0" />
        <span>회사 규정을 등록하면 귀사 기준으로 답변받아요</span>
        <ChevronRight className="w-3 h-3 flex-shrink-0" />
      </button>
      <button
        onClick={() => {
          trackCta("dismissed");
          onDismiss();
        }}
        aria-label="닫기"
        className="flex-shrink-0 w-5 h-5 rounded-md flex items-center justify-center text-muted-foreground/60 hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
}
