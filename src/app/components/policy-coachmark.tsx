import { useState, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface CoachmarkStep {
  id: string;
  title: string;
  description: string;
  targetSelector: string;
  position: "top" | "bottom" | "left" | "right";
}

interface PolicyCoachmarkProps {
  onComplete: () => void;
  onSkip: () => void;
}

const COACHMARK_STEPS: CoachmarkStep[] = [
  {
    id: "step-1",
    title: "정책 문서 등록하기",
    description: "새로운 사내 정책 문서를 등록하려면 우측 상단의 '등록하기' 버튼을 클릭하세요. PDF, DOCX, HWP 파일을 업로드할 수 있습니다.",
    targetSelector: "[data-coachmark='register-button']",
    position: "bottom",
  },
  {
    id: "step-2",
    title: "문서 검색",
    description: "등록된 정책 문서를 빠르게 찾으려면 검색창을 사용하세요. 파일명이나 카테고리로 검색할 수 있습니다.",
    targetSelector: "[data-coachmark='search-input']",
    position: "bottom",
  },
  {
    id: "step-3",
    title: "카테고리 필터",
    description: "특정 카테고리의 문서만 보려면 필터를 사용하세요. 취업규칙, 단체협약, 인사규정 등 카테고리별로 필터링할 수 있습니다.",
    targetSelector: "[data-coachmark='filter-select']",
    position: "bottom",
  },
  {
    id: "step-4",
    title: "정책 문서 목록",
    description: "등록된 모든 정책 문서가 이곳에 표시됩니다. 각 문서의 이름, 카테고리, 등록 상태를 한눈에 확인할 수 있습니다.",
    targetSelector: "[data-coachmark='policy-list']",
    position: "top",
  },
  {
    id: "step-5",
    title: "문서 상태 확인",
    description: "각 문서는 '대기중', '등록완료', '오류' 상태로 표시됩니다. 대기중인 문서는 분석이 진행 중이며, 완료되면 '등록완료'로 변경됩니다.",
    targetSelector: "[data-coachmark='status-badge']",
    position: "left",
  },
  {
    id: "step-6",
    title: "문서 다운로드",
    description: "다운로드 버튼을 클릭하면 원본 문서를 다운로드할 수 있습니다.",
    targetSelector: "[data-coachmark='download-button']",
    position: "left",
  },
  {
    id: "step-7",
    title: "카테고리 수정",
    description: "수정 버튼을 클릭하여 문서의 카테고리를 변경할 수 있습니다.",
    targetSelector: "[data-coachmark='edit-button']",
    position: "left",
  },
  {
    id: "step-8",
    title: "문서 삭제",
    description: "더 이상 필요하지 않은 문서는 삭제 버튼을 통해 제거할 수 있습니다. 삭제된 문서는 복구할 수 없으니 주의하세요.",
    targetSelector: "[data-coachmark='delete-button']",
    position: "left",
  },
  {
    id: "step-9",
    title: "변경 이력 확인",
    description: "히스토리 버튼을 클릭하면 해당 문서의 모든 버전과 변경 이력을 확인할 수 있습니다. 각 버전별 등록일, 등록자, 상태를 볼 수 있습니다.",
    targetSelector: "[data-coachmark='history-button']",
    position: "left",
  },
];

export function PolicyCoachmark({ onComplete, onSkip }: PolicyCoachmarkProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStepData = COACHMARK_STEPS[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === COACHMARK_STEPS.length - 1;

  useEffect(() => {
    const findTarget = () => {
      const element = document.querySelector(currentStepData.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
        return true;
      }
      return false;
    };

    // 즉시 실행
    if (!findTarget()) {
      // 찾지 못하면 0.5초 후 재시도
      const timer = setTimeout(() => {
        if (!findTarget()) {
          // 여전히 찾지 못하면 1초 후 다음 단계로
          const skipTimer = setTimeout(() => {
            if (!isLastStep) {
              setCurrentStep(currentStep + 1);
            }
          }, 1000);
          return () => clearTimeout(skipTimer);
        }
      }, 500);
      return () => clearTimeout(timer);
    }

    // 스크롤 및 리사이즈 이벤트 처리
    const updatePosition = () => {
      const element = document.querySelector(currentStepData.targetSelector);
      if (element) {
        const rect = element.getBoundingClientRect();
        setTargetRect(rect);
      }
    };

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [currentStep, currentStepData.targetSelector, isLastStep]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 타겟을 찾지 못해도 중앙에 툴팁 표시
  if (!targetRect) {
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70">
        <div className="bg-card border-2 border-primary rounded-xl shadow-2xl p-6 w-[380px]">
          {/* Progress dots */}
          <div className="flex items-center gap-1 mb-4">
            {COACHMARK_STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index === currentStep
                    ? "bg-primary"
                    : index < currentStep
                    ? "bg-primary/50"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>

          {/* Close button */}
          <button
            onClick={onSkip}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content */}
          <div className="space-y-3 mb-6">
            <div>
              <div className="text-xs font-bold text-primary mb-1">
                {currentStep + 1} / {COACHMARK_STEPS.length}
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {currentStepData.title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {currentStepData.description}
            </p>
            <p className="text-xs text-red-500">
              (대상 요소를 찾는 중입니다: {currentStepData.targetSelector})
            </p>
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onSkip}
              className="text-xs"
            >
              건너뛰기
            </Button>

            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  className="gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  이전
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleNext}
                className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {isLastStep ? "완료" : "다음"}
                {!isLastStep && <ChevronRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 툴팁 위치 계산
  const calculateTooltipStyle = () => {
    const tooltipWidth = 380;
    const tooltipHeight = 200;
    const padding = 20;
    const arrowSize = 12;

    let top = 0;
    let left = 0;

    switch (currentStepData.position) {
      case "top":
        top = targetRect.top - tooltipHeight - padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "bottom":
        top = targetRect.bottom + padding;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case "left":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - padding;
        break;
      case "right":
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + padding;
        break;
    }

    // 화면 경계 체크
    if (left < padding) left = padding;
    if (left + tooltipWidth > window.innerWidth - padding) {
      left = window.innerWidth - tooltipWidth - padding;
    }
    if (top < padding) top = padding;
    if (top + tooltipHeight > window.innerHeight - padding) {
      top = window.innerHeight - tooltipHeight - padding;
    }

    return { top, left };
  };

  const tooltipStyle = calculateTooltipStyle();

  return (
    <>
      {/* Dark overlay with spotlight */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          background: "rgba(0, 0, 0, 0.7)",
          pointerEvents: "none",
        }}
      >
        <svg width="100%" height="100%" style={{ pointerEvents: "none" }}>
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="8"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight border */}
      <div
        className="fixed z-[9999] pointer-events-none border-4 border-primary rounded-lg shadow-lg"
        style={{
          top: targetRect.top - 8,
          left: targetRect.left - 8,
          width: targetRect.width + 16,
          height: targetRect.height + 16,
          animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        }}
      />

      {/* Tooltip */}
      <div
        className="fixed z-[10000] bg-card border-2 border-primary rounded-xl shadow-2xl p-6 w-[380px]"
        style={{
          top: tooltipStyle.top,
          left: tooltipStyle.left,
        }}
      >
        {/* Progress dots */}
        <div className="flex items-center gap-1 mb-4">
          {COACHMARK_STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 flex-1 rounded-full transition-all ${
                index === currentStep
                  ? "bg-primary"
                  : index < currentStep
                  ? "bg-primary/50"
                  : "bg-muted"
              }`}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Content */}
        <div className="space-y-3 mb-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-primary mb-1">
                {currentStep + 1} / {COACHMARK_STEPS.length}
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {currentStepData.title}
              </h3>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStepData.description}
          </p>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={onSkip}
            className="text-xs"
          >
            건너뛰기
          </Button>

          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                이전
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {isLastStep ? "완료" : "다음"}
              {!isLastStep && <ChevronRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
