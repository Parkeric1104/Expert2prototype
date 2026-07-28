import { useState } from "react";
import { Sparkles, Search, Lightbulb } from "lucide-react";
import characterImg from "@/assets/ba68b3d133c0b0eab30536be7e6ef8ec6cdf174e.png";

interface HumanFeedbackRequestProps {
  reason: "invalid" | "insufficient" | "inappropriate";
  originalQuestion: string;
  onSubmitRevision: (revisedQuestion: string) => void;
  suggestedQuestions?: string[];
  onQuestionSelect?: (question: string) => void; // 추천 질문 선택 시 입력창에 자동 입력
}

export function HumanFeedbackRequest({
  reason,
  originalQuestion,
  onSubmitRevision,
  suggestedQuestions = [],
  onQuestionSelect,
}: HumanFeedbackRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 사실 관계 분석 생성 (insufficient일 경우에만)
  const generateFactPoints = (): string[] | null => {
    if (reason !== "insufficient") return null;

    const lowerQuestion = originalQuestion.toLowerCase();

    if (lowerQuestion.includes("퇴직금") || lowerQuestion.includes("중간정산")) {
      return [
        "퇴직금 또는 중간정산에 관한 문의로 이해했습니다.",
        "정확한 입사일과 퇴사일(또는 중간정산 시점)이 언제인지 확인이 필요합니다.",
        "중간정산 사유(주택구입, 전세금, 부채상환 등)와 회사의 상시근로자 수도 알려주시면 더 정확한 답변을 드릴 수 있습니다.",
      ];
    } else if (lowerQuestion.includes("연차") || lowerQuestion.includes("휴가")) {
      return [
        "연차휴가 관련 문의로 이해했습니다.",
        "근속 기간 및 고용 형태(정규직·계약직·파견직 등)에 따라 적용되는 규정이 달라질 수 있습니다.",
        "사업장의 취업규칙이나 단체협약에 연차 관련 규정이 있는지 확인이 필요합니다.",
      ];
    } else if (lowerQuestion.includes("임금") || lowerQuestion.includes("급여") || lowerQuestion.includes("체불")) {
      return [
        "임금 또는 급여 관련 문의로 이해했습니다.",
        "임금 지급일과 미지급 기간, 그리고 근로계약서에 명시된 임금 수준을 확인이 필요합니다.",
        "회사의 상시근로자 수와 고용 형태도 함께 알려주시면 정확한 답변이 가능합니다.",
      ];
    } else if (lowerQuestion.includes("해고") || lowerQuestion.includes("징계")) {
      return [
        "해고 또는 징계 관련 문의로 이해했습니다.",
        "해고·징계 사유로 통보받은 내용과 예고 통지 여부 및 시점을 확인이 필요합니다.",
        "취업규칙이나 단체협약에 징계 절차가 규정되어 있는지도 중요한 사항입니다.",
      ];
    } else if (lowerQuestion.includes("산재") || lowerQuestion.includes("재해") || lowerQuestion.includes("사고")) {
      return [
        "산업재해(산재) 관련 문의로 이해했습니다.",
        "사고가 발생한 정확한 시간·장소와 업무와의 관련성 여부를 확인이 필요합니다.",
        "이미 산재 신청을 하셨다면 현재 진행 상황도 알려주시면 도움이 됩니다.",
      ];
    } else {
      return [
        "문의하신 내용을 검토하였습니다.",
        "구체적인 상황과 배경(관련된 날짜, 기간 등)에 대한 추가 정보가 필요합니다.",
        "회사의 규모(상시근로자 수)와 귀하의 고용 형태를 알려주시면 더 정확한 답변을 드릴 수 있습니다.",
      ];
    }
  };

  const getDescriptionText = () => {
    switch (reason) {
      case "invalid":
        return "입력하신 내용이 명확하지 않습니다. 구체적인 질문을 입력해주세요.";
      case "inappropriate":
        return "이 질문은 법적·윤리적 책임 문제로 인해 답변이 제한됩니다.";
      default:
        return "";
    }
  };

  // 검토 제목 (사실관계 상단에 노출) — 질문 키워드로 도출
  const generateTitle = (): string => {
    const q = originalQuestion.toLowerCase();
    if (q.includes("퇴직금") || q.includes("중간정산")) return "퇴직금 중간정산 요청에 대한 법적 검토";
    if (q.includes("연차") || q.includes("휴가")) return "연차휴가 적용에 대한 법적 검토";
    if (q.includes("임금") || q.includes("급여") || q.includes("체불")) return "임금 지급에 대한 법적 검토";
    if (q.includes("해고") || q.includes("징계")) return "해고·징계의 정당성에 대한 법적 검토";
    if (q.includes("산재") || q.includes("재해") || q.includes("사고")) return "업무상 재해 인정에 대한 법적 검토";
    return "질문 내용에 대한 법적 검토";
  };

  const factPoints = generateFactPoints();
  const descriptionText = getDescriptionText();
  const reviewTitle = generateTitle();
  // '질문 분석 완료' 시각 (마운트 시 1회 고정)
  const [analyzedAt] = useState<string>(() =>
    new Date().toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );

  const handleSuggestedQuestionClick = (question: string) => {
    if (isSubmitting) return;
    onQuestionSelect?.(question);
  };

  const handleEditQuestion = () => {
    // 원본 질문을 입력창에 넣어 수정할 수 있도록
    onQuestionSelect?.(originalQuestion);
  };

  const handleContinue = () => {
    setIsSubmitting(true);
    onSubmitRevision(originalQuestion);
  };

  return (
    <div className="my-6 space-y-4">
      {/* 1. 마스코트 + 인사 버블 (라이트 퍼플) */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-100 dark:ring-indigo-900/40 bg-indigo-50">
          <img src={characterImg} alt="노무도우미" className="w-full h-full object-cover" />
        </div>
        <div className="max-w-[680px] rounded-2xl rounded-tl-sm bg-blue-150 dark:bg-indigo-950/30 px-4 py-3">
          <p className="text-sm text-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
            노무도우미에 문의해주셔서 감사합니다.
            <br />
            질문하신 내용이 아래와 같다면 '계속 진행하기' 버튼을, 아니면 추천 질문에서 선택해 주세요.
          </p>
        </div>
      </div>

      {/* 2. 질문 분석 완료 카드 (아이콘 + 타임스탬프) */}
      {factPoints && (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-5 py-4">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <span className="text-sm font-bold text-foreground">질문 분석 완료</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1 pl-6">{analyzedAt}</p>
        </div>
      )}

      {/* 3. 제목 + 사실관계 (언박스, insufficient 전용) */}
      {factPoints && (
        <div>
          <h3 className="text-base font-bold text-foreground mb-4" style={{ wordBreak: "keep-all" }}>
            {reviewTitle}
          </h3>
          <div className="flex items-center gap-1.5 mb-2.5">
            <Search className="w-4 h-4 text-primary" />
            <span className="text-[15px] font-bold text-foreground">사실관계</span>
          </div>
          <ol
            className="space-y-2 text-sm text-muted-foreground pl-0.5"
            style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
          >
            {factPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <span className="font-semibold text-foreground/70 flex-shrink-0 tabular-nums">
                  {index + 1}.
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* 설명 텍스트 (invalid / inappropriate 전용) */}
      {!factPoints && descriptionText && (
        <p className="text-sm text-muted-foreground" style={{ wordBreak: "keep-all" }}>
          {descriptionText}
        </p>
      )}

      {/* 4. 하단 액션 바 (안내문 좌 · 버튼 우) */}
      <div className="border-t border-border pt-4 flex items-center justify-between gap-3 flex-wrap">
        {factPoints ? (
          <p className="text-sm text-muted-foreground" style={{ wordBreak: "keep-all" }}>
            위 내용으로 계속 진행할까요, 아니면 질문을 더 구체적으로 다듬을까요?
          </p>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            onClick={handleEditQuestion}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ wordBreak: "keep-all" }}
          >
            질문 수정
          </button>
          <button
            onClick={handleContinue}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ wordBreak: "keep-all" }}
          >
            계속 진행하기
          </button>
        </div>
      </div>

      {/* 추천 질문 */}
      {suggestedQuestions.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Search className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              추천 질문으로 질문을 보강해보세요.
            </p>
          </div>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestionClick(question)}
                disabled={isSubmitting}
                className="w-full text-left px-4 py-3.5 bg-blue-150 hover:opacity-90 rounded-xl transition-opacity text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
