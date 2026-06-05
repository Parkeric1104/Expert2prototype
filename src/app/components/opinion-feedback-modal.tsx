import { useState } from "react";
import { Check, ChevronLeft, ThumbsUp, ThumbsDown, HelpCircle } from "lucide-react";

const MAX_COMMENT = 200;

type FeedbackStep = "initial" | "detail";
type FeedbackType = "positive" | "negative";

const POSITIVE_CHIPS = [
  "정확한 법령 정보를 찾아줬어요",
  "우리 회사 상황에 딱 맞는 답변이었어요",
  "이해하기 쉽게 잘 설명해줬어요",
  "빠르고 효율적으로 답변해줬어요",
];

const NEGATIVE_CHIPS = [
  "법령·판례 출처가 다름",
  "최신 개정 내용이 아님",
  "우리 회사 상황과 맞지 않음",
  "답변 문장이 어색함",
];

interface OpinionFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export function OpinionFeedbackModal({
  isOpen,
  onClose,
  onComplete,
}: OpinionFeedbackModalProps) {
  const [step, setStep] = useState<FeedbackStep>("initial");
  const [feedbackType, setFeedbackType] = useState<FeedbackType | null>(null);
  const [selectedChips, setSelectedChips] = useState<string[]>([]);
  const [comment, setComment] = useState("");

  if (!isOpen) return null;

  const chips = feedbackType === "positive" ? POSITIVE_CHIPS : NEGATIVE_CHIPS;

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedbackType(type);
    setSelectedChips([]);
    setStep("detail");
  };

  const toggleChip = (chip: string) => {
    setSelectedChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip]
    );
  };

  const handleCommentChange = (v: string) => {
    if (v.length <= MAX_COMMENT) setComment(v);
  };

  const resetAndGo = (cb: () => void) => {
    setStep("initial");
    setFeedbackType(null);
    setSelectedChips([]);
    setComment("");
    cb();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl w-full overflow-y-auto"
        style={{
          maxWidth: "480px",
          maxHeight: "calc(100dvh - 48px)",
          boxShadow: "0 10px 40px rgba(0,0,0,0.12)",
          overscrollBehavior: "contain",
        }}
      >
        {step === "initial" ? (
          <InitialStep
            onSelect={handleTypeSelect}
            onSkip={() => resetAndGo(onComplete)}
          />
        ) : (
          <DetailStep
            feedbackType={feedbackType!}
            chips={chips}
            selectedChips={selectedChips}
            comment={comment}
            onToggleChip={toggleChip}
            onCommentChange={handleCommentChange}
            onBack={() => {
              setStep("initial");
              setFeedbackType(null);
              setSelectedChips([]);
              setComment("");
            }}
            onConfirm={() => resetAndGo(onComplete)}
          />
        )}
      </div>
    </div>
  );
}

/* ──────────────── Step 1: 초기 선택 ──────────────── */
function InitialStep({
  onSelect,
  onSkip,
}: {
  onSelect: (type: "positive" | "negative") => void;
  onSkip: () => void;
}) {
  return (
    <div style={{ padding: "36px 32px 32px" }}>
      {/* Icon */}
      <div className="flex flex-col items-center text-center mb-8">
        <div
          className="flex items-center justify-center rounded-full mb-5"
          style={{ width: "64px", height: "64px", backgroundColor: "#FFF3CD" }}
        >
          <HelpCircle style={{ width: "28px", height: "28px", color: "#F59E0B" }} />
        </div>
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111111", marginBottom: "6px" }}>
          답변이 도움이 되셨나요?
        </h2>
        <p style={{ fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
          소중한 의견이 더 나은 서비스를 만드는 데 도움이 됩니다.
        </p>
      </div>

      {/* Choice cards */}
      <div className="flex gap-3 mb-6">
        <ChoiceCard
          icon={<ThumbsUp style={{ width: "22px", height: "22px", color: "#10B981" }} />}
          iconBg="#ECFDF5"
          label="문제해결에"
          labelBold="도움이 됐어요"
          hoverBorder="#10B981"
          hoverBg="#F0FDF4"
          onClick={() => onSelect("positive")}
        />
        <ChoiceCard
          icon={<ThumbsDown style={{ width: "22px", height: "22px", color: "#F59E0B" }} />}
          iconBg="#FFF7ED"
          label="궁금증이"
          labelBold="해결되지 않았어요"
          hoverBorder="#F59E0B"
          hoverBg="#FFFBEB"
          onClick={() => onSelect("negative")}
        />
      </div>

      {/* Skip → 메인으로 */}
      <button
        onClick={onSkip}
        className="w-full transition-colors"
        style={{
          padding: "11px",
          borderRadius: "8px",
          backgroundColor: "#F3F4F6",
          color: "#6B7280",
          fontSize: "13px",
          fontWeight: 500,
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#E5E7EB"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F3F4F6"; }}
      >
        건너뛰기
      </button>
    </div>
  );
}

function ChoiceCard({
  icon,
  iconBg,
  label,
  labelBold,
  hoverBorder,
  hoverBg,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  labelBold: string;
  hoverBorder: string;
  hoverBg: string;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      className="flex-1 flex flex-col items-center gap-3"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: "20px 12px",
        borderRadius: "12px",
        border: `1.5px solid ${hovered ? hoverBorder : "#E5E7EB"}`,
        backgroundColor: hovered ? hoverBg : "#FFFFFF",
        cursor: "pointer",
        transition: "border-color 0.15s, background-color 0.15s",
      }}
    >
      <div
        className="flex items-center justify-center rounded-full"
        style={{ width: "44px", height: "44px", backgroundColor: iconBg }}
      >
        {icon}
      </div>
      <div className="text-center">
        <p style={{ fontSize: "12px", color: "#9CA3AF", marginBottom: "2px" }}>{label}</p>
        <p style={{ fontSize: "13px", fontWeight: 600, color: "#111827" }}>{labelBold}</p>
      </div>
    </button>
  );
}

/* ──────────────── Step 2: 상세 사유 선택 ──────────────── */
function DetailStep({
  feedbackType,
  chips,
  selectedChips,
  comment,
  onToggleChip,
  onCommentChange,
  onBack,
  onConfirm,
}: {
  feedbackType: FeedbackType;
  chips: string[];
  selectedChips: string[];
  comment: string;
  onToggleChip: (chip: string) => void;
  onCommentChange: (v: string) => void;
  onBack: () => void;
  onConfirm: () => void;
}) {
  const isPositive = feedbackType === "positive";

  const badgeStyle = isPositive
    ? { bg: "#ECFDF5", text: "#059669", border: "#A7F3D0" }
    : { bg: "#FFF7ED", text: "#D97706", border: "#FDE68A" };

  return (
    <div style={{ padding: "28px 32px 32px" }}>
      {/* Back + badge */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex" }}
        >
          <ChevronLeft style={{ width: "16px", height: "16px", color: "#9CA3AF" }} />
        </button>
        <span
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full"
          style={{
            backgroundColor: badgeStyle.bg,
            border: `1px solid ${badgeStyle.border}`,
            fontSize: "12px",
            fontWeight: 600,
            color: badgeStyle.text,
          }}
        >
          {isPositive
            ? <ThumbsUp style={{ width: "11px", height: "11px" }} />
            : <ThumbsDown style={{ width: "11px", height: "11px" }} />}
          {isPositive ? "도움이 됐어요" : "아쉬워요"}
        </span>
      </div>

      {/* Title */}
      <div className="mb-5">
        <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#111111", marginBottom: "4px" }}>
          {isPositive ? "어떤 점이 도움이 됐나요?" : "어떤 점이 아쉬우셨나요?"}
        </h3>
        <p style={{ fontSize: "13px", color: "#9CA3AF" }}>중복 선택이 가능합니다.</p>
      </div>

      {/* Chips — 모든 타입 공통으로 브랜드 퍼플 활성 */}
      <div className="flex flex-col gap-2 mb-5">
        {chips.map((chip) => {
          const active = selectedChips.includes(chip);
          return (
            <button
              key={chip}
              onClick={() => onToggleChip(chip)}
              className="flex items-center justify-between text-left"
              style={{
                padding: "11px 14px",
                borderRadius: "8px",
                border: active ? "1px solid #4F46E5" : "1px solid #E5E7EB",
                backgroundColor: active ? "#EEF2FF" : "#FAFAFA",
                cursor: "pointer",
                transition: "border-color 0.12s, background-color 0.12s",
              }}
            >
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: 500,
                  color: active ? "#4F46E5" : "#374151",
                }}
              >
                {chip}
              </span>
              <div
                className="flex items-center justify-center flex-shrink-0"
                style={{
                  width: "18px",
                  height: "18px",
                  borderRadius: "4px",
                  border: active ? "none" : "1.5px solid #D1D5DB",
                  backgroundColor: active ? "#4F46E5" : "transparent",
                  transition: "all 0.12s ease",
                }}
              >
                {active && (
                  <Check
                    strokeWidth={3}
                    style={{ width: "11px", height: "11px", color: "#FFFFFF" }}
                  />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Textarea + 글자 수 카운터 */}
      <div className="mb-6" style={{ position: "relative" }}>
        <textarea
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          maxLength={MAX_COMMENT}
          placeholder="추가로 전하고 싶은 말씀이 있으시면 남겨주세요. (선택)"
          className="w-full resize-none focus:outline-none"
          style={{
            height: "96px",
            padding: "11px 14px 28px",
            fontSize: "13px",
            color: "#111111",
            backgroundColor: "#F9FAFB",
            border: "1px solid #E5E7EB",
            borderRadius: "8px",
            lineHeight: 1.6,
            transition: "border-color 0.15s, box-shadow 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#4F46E5";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(79,70,229,0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E5E7EB";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
        {/* 글자 수 카운터 */}
        <span
          style={{
            position: "absolute",
            bottom: "10px",
            right: "14px",
            fontSize: "11px",
            color: comment.length >= MAX_COMMENT ? "#EF4444" : "#9CA3AF",
            pointerEvents: "none",
          }}
        >
          {comment.length}/{MAX_COMMENT}
        </span>
      </div>

      {/* 평가 완료하기 → 메인으로 */}
      <button
        onClick={onConfirm}
        className="w-full"
        style={{
          padding: "13px",
          borderRadius: "8px",
          backgroundColor: "#4F46E5",
          color: "#FFFFFF",
          fontWeight: 700,
          fontSize: "14px",
          border: "none",
          cursor: "pointer",
          transition: "opacity 0.15s",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
      >
        평가 완료하기
      </button>
    </div>
  );
}
