import { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";

const STORAGE_KEY = "policy-coach-mark-v1";

interface CoachStep {
  targetId: string;
  title: string;
  description: string;
  placement: "bottom" | "bottom-left" | "left" | "right";
}

const STEPS: CoachStep[] = [
  {
    targetId: "coach-register-btn",
    title: "문서 등록",
    description: "새로운 사내 정책 문서를 업로드하여 등록합니다.\nPDF, DOCX 파일을 지원합니다.",
    placement: "bottom-left",
  },
  {
    targetId: "coach-search-area",
    title: "검색 및 필터",
    description: "문서명 또는 카테고리로 빠르게 찾을 수 있습니다.\n카테고리 필터로 분류하여 조회하세요.",
    placement: "bottom",
  },
  {
    targetId: "coach-status-area",
    title: "문서 처리 상태",
    description: "등록완료 · 대기중 · 오류 세 가지 상태로\n각 문서의 처리 현황을 확인합니다.",
    placement: "bottom",
  },
  {
    targetId: "coach-analysis-btn",
    title: "AI 분석 결과 검토",
    description: "AI 분석이 완료된 문서를 검토하고 승인하면\n최신 정책이 서비스에 즉시 반영됩니다.",
    placement: "bottom",
  },
  {
    targetId: "coach-history-btn",
    title: "버전 히스토리",
    description: "문서의 모든 변경 이력을 버전별로\n확인할 수 있습니다.",
    placement: "bottom",
  },
];

interface PolicyCoachMarkProps {
  show: boolean;
  onClose: () => void;
}

export function PolicyCoachMark({ show, onClose }: PolicyCoachMarkProps) {
  const [step, setStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // show가 꺼지면 rect 초기화
  useEffect(() => {
    if (!show) {
      setTargetRect(null);
      setStep(0);
    }
  }, [show]);

  // step 또는 show 변경 시 타깃 요소 스크롤 + rect 캡처
  useEffect(() => {
    if (!show) return;

    const el = document.getElementById(STEPS[step].targetId);
    if (!el) {
      setTargetRect(null);
      return;
    }

    // 즉시 스크롤 (애니메이션 없이) → layout 확정 후 rect 캡처
    el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "center" });

    // setTimeout 50ms: instant scroll이라도 컨테이너 스크롤 flush 대기
    const timer = setTimeout(() => {
      setTargetRect(el.getBoundingClientRect());
    }, 50);

    // 창 크기 변경 시 rect 업데이트
    const onResize = () => setTargetRect(el.getBoundingClientRect());
    window.addEventListener("resize", onResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [show, step]);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setTargetRect(null); // 전환 중 깜박임 방지
      setStep((s) => s + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setTargetRect(null);
      setStep((s) => s - 1);
    }
  };

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    onClose();
  };

  if (!show || !targetRect) return null;

  const currentStep = STEPS[step];
  const PAD = 10;
  const TW = 288;
  const TM = 16;

  const spotTop = targetRect.top - PAD;
  const spotLeft = targetRect.left - PAD;
  const spotW = targetRect.width + PAD * 2;
  const spotH = targetRect.height + PAD * 2;

  const getTooltipPos = (): { top: number; left: number } => {
    const clampLeft = (l: number) =>
      Math.max(12, Math.min(window.innerWidth - TW - 12, l));
    const clampTop = (t: number) =>
      Math.max(12, Math.min(window.innerHeight - 240, t));

    switch (currentStep.placement) {
      case "bottom":
        return {
          top: clampTop(spotTop + spotH + TM),
          left: clampLeft(targetRect.left + targetRect.width / 2 - TW / 2),
        };
      case "bottom-left":
        return {
          top: clampTop(spotTop + spotH + TM),
          left: clampLeft(targetRect.right - TW),
        };
      case "left":
        return {
          top: Math.max(12, targetRect.top + targetRect.height / 2 - 100),
          left: Math.max(12, spotLeft - TW - TM),
        };
      case "right":
        return {
          top: Math.max(12, targetRect.top + targetRect.height / 2 - 100),
          left: Math.min(window.innerWidth - TW - 12, spotLeft + spotW + TM),
        };
      default:
        return {
          top: clampTop(spotTop + spotH + TM),
          left: clampLeft(targetRect.left),
        };
    }
  };

  const tooltipPos = getTooltipPos();

  return (
    <>
      {/* Click-away backdrop */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 50 }}
        onClick={handleClose}
      />

      {/* Spotlight */}
      <div
        style={{
          position: "fixed",
          top: spotTop,
          left: spotLeft,
          width: spotW,
          height: spotH,
          borderRadius: 10,
          boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.62)",
          zIndex: 51,
          pointerEvents: "none",
          outline: "2px solid rgba(255,255,255,0.22)",
          outlineOffset: 1,
        }}
      />

      {/* Tooltip card */}
      <div
        style={{
          position: "fixed",
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: TW,
          zIndex: 52,
        }}
        className="bg-card rounded-2xl shadow-2xl border border-border p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-muted-foreground font-medium tabular-nums">
            {step + 1} / {STEPS.length}
          </span>
          <button
            onClick={handleClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="font-bold text-foreground text-[15px] mb-1.5 leading-snug">
          {currentStep.title}
        </h3>

        <p className="text-sm text-muted-foreground leading-relaxed mb-5 whitespace-pre-line">
          {currentStep.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5 items-center">
            {STEPS.map((_, i) => (
              <div
                key={i}
                className="rounded-full transition-all duration-200"
                style={{
                  width: i === step ? 16 : 6,
                  height: 6,
                  backgroundColor:
                    i === step
                      ? "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.3)",
                }}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            {step > 0 && (
              <Button size="sm" variant="ghost" onClick={handlePrev} className="h-8 w-8 p-0">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <Button size="sm" onClick={handleNext} className="h-8 px-4 text-xs font-semibold">
              {step < STEPS.length - 1 ? (
                <span className="flex items-center gap-1">
                  다음 <ChevronRight className="w-3.5 h-3.5" />
                </span>
              ) : (
                "완료"
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

/** 페이지 진입 시 자동 표시 + 수동 재시작 훅 */
export function useCoachMark() {
  const [showCoach, setShowCoach] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      const t = setTimeout(() => setShowCoach(true), 500);
      return () => clearTimeout(t);
    }
  }, []);

  const startCoach = () => {
    localStorage.removeItem(STORAGE_KEY);
    setShowCoach(true);
  };

  const stopCoach = () => setShowCoach(false);

  return { showCoach, startCoach, stopCoach };
}
