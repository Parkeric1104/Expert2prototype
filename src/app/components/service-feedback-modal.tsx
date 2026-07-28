import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, Check, ChevronRight } from "lucide-react";
import { toast } from "sonner";

type Step = "rating" | "positive" | "negative";

interface ServiceFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 서비스 평가 항목 (직접 입력 없음)
const POSITIVE_ITEMS = [
  "근거 정보가 정확해요",
  "내가 처한 상황과 조건에 꼭 맞는 답변이었어요",
  "복잡한 법령이나 규정을 이해하기 쉽게 알려줬어요",
  "의사결정과 판단을 내리는 데 큰 도움이 됐어요",
  "공식 출처가 제공되어 신뢰할 수 있어요",
];

const NEGATIVE_ITEMS = [
  "답변의 근거가 되는 공식 출처가 없거나 부정확해요",
  "최신 개정 및 업데이트된 내용이 반영되지 않았어요",
  "파일업로드 제한이나 조건이 불편해요",
  "답변 내용이 모호하거나 중간에 끊겨서 이해하기 어려워요",
];

export function ServiceFeedbackModal({ isOpen, onClose }: ServiceFeedbackModalProps) {
  const [step, setStep] = useState<Step>("rating");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // 열릴 때마다 초기화
  useEffect(() => {
    if (isOpen) {
      setStep("rating");
      setSelected(new Set());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleItem = (item: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(item)) next.delete(item);
      else next.add(item);
      return next;
    });
  };

  const handleComplete = () => {
    toast.success("소중한 평가 감사합니다. 더 나은 서비스로 보답하겠습니다!");
    onClose();
  };

  const goDetail = (target: "positive" | "negative") => {
    setSelected(new Set());
    setStep(target);
  };

  // ── 상세 평가 (좋아요/아쉬워요 공통 레이아웃) — 디자인 정합: 체크박스 좌측 + 경량 행 ──
  const renderDetail = (title: string, items: string[], completeLabel: string) => (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-8">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1.5">중복 선택이 가능합니다.</p>
      </div>

      <div className="flex-1 px-8 pt-5 pb-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isOn = selected.has(item);
          return (
            <button
              key={item}
              onClick={() => toggleItem(item)}
              className="w-full flex items-center gap-3 px-2 py-3 rounded-lg text-left hover:bg-muted/40 transition-colors"
              style={{ wordBreak: "keep-all" }}
            >
              <span
                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                  isOn ? "bg-primary border-primary" : "bg-card border-border"
                }`}
              >
                {isOn && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </span>
              <span className={`text-sm ${isOn ? "text-primary font-medium" : "text-foreground"}`}>
                {item}
              </span>
            </button>
          );
        })}
      </div>

      {/* 하단 2버튼: 이전 / (완료·반영) */}
      <div className="px-8 pb-8 pt-2 flex gap-3">
        <button
          onClick={() => setStep("rating")}
          className="flex-1 py-3.5 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 transition-colors"
        >
          이전
        </button>
        <button
          onClick={handleComplete}
          disabled={selected.size === 0}
          className="flex-[2] py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {completeLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-[480px] flex flex-col overflow-hidden">

        {/* ── 1단계: 만족도 선택 (디자인 정합: 상단 아이콘 없음, 가로 리스트 2행 + 셰브론) ── */}
        {step === "rating" && (
          <div className="flex flex-col px-8 py-8 flex-1">
            <h2 className="text-xl font-bold text-foreground">서비스가 도움이 되셨나요?</h2>
            <p className="text-sm text-muted-foreground mt-1.5" style={{ wordBreak: "keep-all" }}>
              소중한 의견이 더 나은 서비스를 만드는 데 도움이 됩니다.
            </p>

            <div className="flex flex-col gap-3 mt-8">
              {/* 좋아요 */}
              <button
                onClick={() => goDetail("positive")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                  <ThumbsUp className="w-5 h-5 text-emerald-500" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs text-muted-foreground">좋아요!</span>
                  <span className="block text-sm font-bold text-foreground mt-0.5" style={{ wordBreak: "keep-all" }}>
                    문제해결에 도움이 됐어요
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              </button>

              {/* 아쉬워요 */}
              <button
                onClick={() => goDetail("negative")}
                className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl border border-border bg-card hover:border-primary/40 transition-colors text-left"
              >
                <span className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <ThumbsDown className="w-5 h-5 text-amber-500" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-xs text-muted-foreground">아쉬워요.</span>
                  <span className="block text-sm font-bold text-foreground mt-0.5" style={{ wordBreak: "keep-all" }}>
                    궁금증이 해결되지 않았어요
                  </span>
                </span>
                <ChevronRight className="w-5 h-5 text-muted-foreground/50 flex-shrink-0" />
              </button>
            </div>

            <button
              onClick={onClose}
              className="mx-auto mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              건너뛰기
            </button>
          </div>
        )}

        {/* ── 2단계: 좋아요 상세 ── */}
        {step === "positive" && renderDetail("어떤 점이 도움이 됐나요?", POSITIVE_ITEMS, "평가 완료하기")}

        {/* ── 3단계: 아쉬워요 상세 ── */}
        {step === "negative" && renderDetail("어떤 점이 아쉬우셨나요?", NEGATIVE_ITEMS, "평가 반영하기")}
      </div>
    </div>
  );
}
