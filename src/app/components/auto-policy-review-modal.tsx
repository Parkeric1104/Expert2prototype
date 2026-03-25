import { useState, useEffect, useRef } from "react";
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

// ---------------------------------------------------------------------------
// AutoPolicyReviewNotification
// 동작 정책:
//  1. 페이지 진입 시 미처리 분석완료 문서가 있으면 항상 팝업 노출
//  2. 팝업 열린 상태에서 신규 문서 완료 → 목록 갱신(팝업 유지)
//  3. 팝업 닫힌 상태에서 신규 문서 완료 → 팝업 재노출
//  4. 확인하기 클릭 → 팝업 닫힘 (pendingPolicies 유지 → 재진입 시 다시 노출)
// ---------------------------------------------------------------------------
interface AutoPolicyReviewNotificationProps {
  isAdmin: boolean;
  onReview?: () => void;
}

// 신규 추가 항목 하이라이트 지속 시간(ms)
const HIGHLIGHT_DURATION = 2500;

export function AutoPolicyReviewNotification({
  isAdmin,
  onReview,
}: AutoPolicyReviewNotificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingPolicies, setPendingPolicies] = useState<string[]>([]);
  // 신규 추가된 항목만 하이라이트
  const [newlyAdded, setNewlyAdded] = useState<Set<string>>(new Set());
  const highlightTimers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  // ── 1. 페이지 진입 시: 미처리 문서 있으면 팝업 오픈 ──────────────────────
  useEffect(() => {
    if (!isAdmin) return;

    // 실제 개발 시 API 응답으로 대체
    const testPolicies = [
      "2024 더존비즈온 취업규칙 개정안.pdf",
      "급여규정_2024_v1.pdf",
      "복리후생규정_개정안.hwp",
    ];

    if (testPolicies.length > 0) {
      setPendingPolicies(testPolicies);
      setIsOpen(true);
    }
  }, [isAdmin]);

  // ── 2 & 3. 신규 문서 완료 이벤트 수신 ────────────────────────────────────
  // 실제 개발 시 WebSocket / SSE / 폴링 이벤트로 addNewPolicy 호출
  // 프로토타입: 전역 커스텀 이벤트로 트리거
  useEffect(() => {
    if (!isAdmin) return;

    const handleNewPolicy = (e: CustomEvent<{ name: string }>) => {
      const name = e.detail.name;

      setPendingPolicies((prev) => {
        // 이미 목록에 있으면 무시
        if (prev.includes(name)) return prev;
        return [...prev, name];
      });

      // 하이라이트 추가
      setNewlyAdded((prev) => new Set(prev).add(name));

      // HIGHLIGHT_DURATION 후 하이라이트 제거
      if (highlightTimers.current.has(name)) {
        clearTimeout(highlightTimers.current.get(name)!);
      }
      highlightTimers.current.set(
        name,
        setTimeout(() => {
          setNewlyAdded((prev) => {
            const next = new Set(prev);
            next.delete(name);
            return next;
          });
          highlightTimers.current.delete(name);
        }, HIGHLIGHT_DURATION)
      );

      // 팝업이 닫혀 있으면 재노출
      setIsOpen(true);
    };

    window.addEventListener("policy-analysis-complete", handleNewPolicy as EventListener);
    return () => {
      window.removeEventListener("policy-analysis-complete", handleNewPolicy as EventListener);
    };
  }, [isAdmin]);

  // 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      highlightTimers.current.forEach((t) => clearTimeout(t));
    };
  }, []);

  // ── X 버튼: 팝업만 닫기 (onReview 호출 없음) ───────────────────────────
  const handleClose = () => {
    setIsOpen(false);
    setNewlyAdded(new Set());
    // pendingPolicies는 유지 → 재진입 또는 신규 문서 시 팝업 재노출
  };

  // ── 확인하기: 팝업 닫기 + 검토 화면 이동 ────────────────────────────────
  const handleConfirm = () => {
    setIsOpen(false);
    setNewlyAdded(new Set());
    if (onReview) onReview();
  };

  if (!isAdmin || pendingPolicies.length === 0) return null;

  const hasScroll = pendingPolicies.length > 3;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
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
          <p className="text-sm text-muted-foreground leading-relaxed">
            업로드하신 문서의 분석이 완료되었습니다.{"\n"}
            최종 확인을 완료해야 사내 정책으로 등록됩니다.
          </p>
        </div>

        {/* 분석 완료 문서 목록 */}
        <div
          className={`mb-6 space-y-2 ${hasScroll ? "max-h-[204px] overflow-y-auto pr-1" : ""}`}
          style={
            hasScroll
              ? { scrollbarWidth: "thin", scrollbarColor: "rgba(102,102,115,0.3) transparent" }
              : undefined
          }
        >
          {pendingPolicies.map((policy) => {
            const isNew = newlyAdded.has(policy);
            return (
              <div
                key={policy}
                title={policy}
                className={[
                  "flex items-center gap-3 rounded-lg px-4 py-3 border transition-colors duration-300",
                  isNew
                    ? "bg-primary/10 border-primary/40"
                    : "bg-muted/50 border-border",
                ].join(" ")}
              >
                <div
                  className={[
                    "w-2 h-2 rounded-full flex-shrink-0",
                    isNew ? "bg-primary animate-pulse" : "bg-primary",
                  ].join(" ")}
                />
                <span className="text-sm font-medium text-foreground truncate">
                  {policy}
                </span>
              </div>
            );
          })}
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

// ---------------------------------------------------------------------------
// 헬퍼: 실제 개발에서 신규 분석 완료 이벤트를 발행하는 함수
// 서버 이벤트(WebSocket/SSE) 수신 후 이 함수 호출
// ---------------------------------------------------------------------------
export function dispatchPolicyAnalysisComplete(policyName: string) {
  window.dispatchEvent(
    new CustomEvent("policy-analysis-complete", { detail: { name: policyName } })
  );
}
