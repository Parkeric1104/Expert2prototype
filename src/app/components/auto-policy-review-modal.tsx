import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

interface AutoPolicyReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  policyName?: string;
}

export function AutoPolicyReviewModal({ 
  isOpen, 
  onClose,
  policyName = "사내 정책 문서"
}: AutoPolicyReviewModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[520px] p-8 flex flex-col bg-card border-border"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>정책 등록 완료</DialogTitle>
          <DialogDescription>
            사내 정책 문서 등록이 완료되었습니다.
          </DialogDescription>
        </DialogHeader>

        {/* 상단 아이콘 + 제목 */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            사내 정책 등록이 완료되었습니다
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            노무도우미에서 새로 등록된 문서의 내용을 참조하여 노무도우미 답변을 제공합니다.
          </p>
        </div>

        {/* 확인 버튼 */}
        <Button
          onClick={onClose}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          확인
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// 메인 화면과 정책 관리 화면에서 사용할 자동 표시 모달
interface AutoPolicyReviewNotificationProps {
  isAdmin: boolean;
  onReview?: () => void;
}

const SEEN_POLICIES_KEY = "seenPolicies";

export function AutoPolicyReviewNotification({
  isAdmin,
  onReview
}: AutoPolicyReviewNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPolicies, setPendingPolicies] = useState<string[]>([]);

  // 진입 시 & 문서 추가 시: 미확인 문서가 있으면 팝업 노출
  useEffect(() => {
    if (!isAdmin) return;

    // 테스트용 대기 정책 목록 (실제 개발 시 API로 대체)
    const testPolicies = [
      "2024 더존비즈온 취업규칙 개정안.pdf",
      "급여규정_2024_v1.pdf",
      "복리후생규정_개정안.hwp",
      "인사관리규정_2024.pdf",
    ];

    // 이미 확인한 목록과 비교 → 새 문서가 있을 때만 팝업 노출
    const seenPolicies: string[] = JSON.parse(localStorage.getItem(SEEN_POLICIES_KEY) || "[]");
    const hasNewPolicies = testPolicies.some((p) => !seenPolicies.includes(p));

    if (hasNewPolicies) {
      setPendingPolicies(testPolicies);
      setIsOpen(true);
    }
  }, [isAdmin]);

  const handleConfirm = () => {
    // 현재 목록 전체를 "확인 완료"로 저장
    localStorage.setItem(SEEN_POLICIES_KEY, JSON.stringify(pendingPolicies));
    setIsOpen(false);
    if (onReview) {
      onReview();
    }
  };

  if (!isAdmin || pendingPolicies.length === 0) {
    return null;
  }

  const hasScroll = pendingPolicies.length > 3;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[520px] p-8 flex flex-col bg-card border-border"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>정책 분석 완료</DialogTitle>
          <DialogDescription>
            정책 문서 분석이 완료되어 검토가 필요합니다.
          </DialogDescription>
        </DialogHeader>

        {/* 상단 아이콘 + 제목 */}
        <div className="flex flex-col items-center text-center space-y-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            정책 분석이 완료되었습니다
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md">
            업로드하신 문서의 분석이 완료되었습니다. 최종 확인을 완료해야 사내 정책으로 등록됩니다.
          </p>
        </div>

        {/* 분석 완료 문서 목록 */}
        <div
          className={`mb-6 space-y-2 ${hasScroll ? "max-h-[204px] overflow-y-auto pr-2" : ""}`}
          style={hasScroll ? { scrollbarWidth: "thin", scrollbarColor: "rgba(102,102,115,0.3) transparent" } : undefined}
        >
          {pendingPolicies.map((policy, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 bg-muted/50 border border-border rounded-lg px-4 py-3"
            >
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
              <span className="text-sm font-medium text-foreground truncate">
                {policy}
              </span>
            </div>
          ))}
        </div>

        {/* 확인하기 버튼 */}
        <Button
          onClick={handleConfirm}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          확인하기
        </Button>
      </DialogContent>
    </Dialog>
  );
}

// 신규 문서 추가 시 팝업 재노출을 트리거하는 헬퍼 함수
// 실제 개발에서는 API 응답 후 호출 → seenPolicies에 없는 문서가 생기면 팝업 재노출
export function markPolicyAsNew(policyName: string) {
  const seen: string[] = JSON.parse(localStorage.getItem(SEEN_POLICIES_KEY) || "[]");
  const filtered = seen.filter((p) => p !== policyName);
  localStorage.setItem(SEEN_POLICIES_KEY, JSON.stringify(filtered));
}