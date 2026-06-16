import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, HelpCircle, Check } from "lucide-react";
import { toast } from "sonner";

type Step = "rating" | "positive" | "negative";

interface ServiceFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 서비스 평가 항목 (직접 입력 없음)
const POSITIVE_ITEMS = [
  "정확한 법령 정보를 찾아줬어요",
  "우리 회사 상황에 딱 맞는 답변이었어요",
  "이해하기 쉽게 잘 설명해줬어요",
  "빠르고 효율적으로 답변해줬어요",
  "출처를 직접 확인할 수 있어 신뢰가 갔어요",
];

const NEGATIVE_ITEMS = [
  "법령·판례 출처가 달라요",
  "최신 개정 내용이 반영되지 않았어요",
  "우리 회사 상황과 맞지 않아요",
  "답변 문장이 어색해요",
  "답변 속도가 느려요",
  "사용 방법이 어려워요",
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

  // ── 상세 평가 (좋아요/아쉬워요 공통 레이아웃) ──
  const renderDetail = (title: string, items: string[]) => (
    <div className="flex flex-col h-full">
      <div className="px-8 pt-8">
        <h2 className="text-xl font-bold text-foreground">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1.5">중복 선택이 가능합니다.</p>
      </div>

      <div className="flex-1 px-8 pt-5 pb-4 space-y-2.5 overflow-y-auto">
        {items.map((item) => {
          const isOn = selected.has(item);
          return (
            <button
              key={item}
              onClick={() => toggleItem(item)}
              className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border text-left transition-colors ${
                isOn
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
              style={{ wordBreak: "keep-all" }}
            >
              <span className={`text-sm ${isOn ? "text-primary font-medium" : "text-foreground"}`}>
                {item}
              </span>
              <span
                className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${
                  isOn ? "bg-primary border-primary" : "bg-muted/60 border-border"
                }`}
              >
                {isOn && <Check className="w-3.5 h-3.5 text-primary-foreground" />}
              </span>
            </button>
          );
        })}
      </div>

      {/* 하단 2버튼: 이전 / 평가 완료하기 */}
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
          평가 완료하기
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-[480px] min-h-[520px] flex flex-col overflow-hidden">

        {/* ── 1단계: 만족도 선택 ── */}
        {step === "rating" && (
          <div className="flex flex-col items-center px-10 py-12 flex-1">
            <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
              <HelpCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-bold text-foreground">서비스가 도움이 되셨나요?</h2>
            <p className="text-sm text-muted-foreground mt-2 text-center" style={{ wordBreak: "keep-all" }}>
              소중한 의견이 더 나은 서비스를 만드는 데 도움이 됩니다.
            </p>

            <div className="grid grid-cols-2 gap-4 w-full mt-10">
              {/* 좋아요 */}
              <button
                onClick={() => goDetail("positive")}
                className="flex flex-col items-center gap-3 px-4 py-7 rounded-2xl border border-border bg-card hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
              >
                <span className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-emerald-500" />
                </span>
                <span className="text-center">
                  <span className="block text-xs text-muted-foreground">좋아요!</span>
                  <span className="block text-sm font-bold text-foreground mt-0.5" style={{ wordBreak: "keep-all" }}>
                    문제해결에 도움이 됐어요
                  </span>
                </span>
              </button>

              {/* 아쉬워요 */}
              <button
                onClick={() => goDetail("negative")}
                className="flex flex-col items-center gap-3 px-4 py-7 rounded-2xl border border-border bg-card hover:border-amber-300 hover:bg-amber-50/40 transition-colors"
              >
                <span className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center">
                  <ThumbsDown className="w-5 h-5 text-amber-500" />
                </span>
                <span className="text-center">
                  <span className="block text-xs text-muted-foreground">아쉬워요.</span>
                  <span className="block text-sm font-bold text-foreground mt-0.5" style={{ wordBreak: "keep-all" }}>
                    궁금증이 해결되지 않았어요
                  </span>
                </span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full mt-8 py-3.5 rounded-xl bg-muted text-muted-foreground text-sm font-medium hover:bg-muted/80 hover:text-foreground transition-colors"
            >
              건너뛰기
            </button>
          </div>
        )}

        {/* ── 2단계: 좋아요 상세 ── */}
        {step === "positive" && renderDetail("어떤 점이 도움이 됐나요?", POSITIVE_ITEMS)}

        {/* ── 3단계: 아쉬워요 상세 ── */}
        {step === "negative" && renderDetail("어떤 점이 아쉬우셨나요?", NEGATIVE_ITEMS)}
      </div>
    </div>
  );
}
