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

const SNOOZE_KEY = "snoozePolicyReview";
const COMPLETED_POLICIES_KEY = "completedPolicies";

export function AutoPolicyReviewNotification({ 
  isAdmin, 
  onReview 
}: AutoPolicyReviewNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPolicies, setPendingPolicies] = useState<string[]>([]);

  // 메인 화면 진입 시 스누즈 만료 여부 체크
  useEffect(() => {
    if (!isAdmin) return;

    const snoozeUntil = localStorage.getItem(SNOOZE_KEY);
    const completedPolicies = JSON.parse(localStorage.getItem(COMPLETED_POLICIES_KEY) || "[]");
    const now = Date.now();

    // 완료된 정책이 있고, 스누즈 기간이 지났으면 모달 표시
    if (completedPolicies.length > 0 && (!snoozeUntil || now > parseInt(snoozeUntil, 10))) {
      setPendingPolicies(completedPolicies);
      setIsOpen(true);
    }
  }, [isAdmin]);

  const handleSnooze = () => {
    localStorage.setItem(SNOOZE_KEY, (Date.now() + 60 * 60 * 1000).toString());
    setIsOpen(false);
  };

  const handleReview = () => {
    setIsOpen(false);
    // 검토 완료 처리
    localStorage.removeItem(COMPLETED_POLICIES_KEY);
    if (onReview) {
      onReview();
    }
  };

  if (!isAdmin || pendingPolicies.length === 0) {
    return null;
  }

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
            업로드하신 문서의 분석이 완료되었습니다. 검토를 완료해야 사내 정책으로 등록됩니다.
          </p>
        </div>

        {/* 대기 중인 정책 목록 */}
        {pendingPolicies.length > 0 && (
          <div className="mb-6 space-y-2">
            {pendingPolicies.slice(0, 3).map((policy, idx) => (
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
            {pendingPolicies.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                외 {pendingPolicies.length - 3}건
              </p>
            )}
          </div>
        )}

        {/* 버튼 */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleSnooze}
            className="flex-1"
          >
            1시간 후 다시 알림
          </Button>
          <Button
            onClick={handleReview}
            className="flex-1"
          >
            검토하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 완료된 정책을 로컬 스토리지에 추가하는 헬퍼 함수
export function addCompletedPolicy(policyName: string) {
  const completedPolicies = JSON.parse(localStorage.getItem(COMPLETED_POLICIES_KEY) || "[]");
  if (!completedPolicies.includes(policyName)) {
    completedPolicies.push(policyName);
    localStorage.setItem(COMPLETED_POLICIES_KEY, JSON.stringify(completedPolicies));
  }
}