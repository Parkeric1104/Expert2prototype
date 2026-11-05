import { useState } from "react";
import { Search, HelpCircle } from "lucide-react";
import characterImg from "@/assets/dobi-chat.png";

interface HumanFeedbackRequestProps {
  reason: "invalid" | "insufficient" | "inappropriate";
  originalQuestion: string;
  onSubmitRevision: (revisedQuestion: string) => void;
  suggestedQuestions?: string[];
  onQuestionSelect?: (question: string) => void; // 추천 질문 선택 시 입력창에 자동 입력(교체)
  onAddContext?: () => void; // '맥락 추가하기' — 입력창을 비우고 추가 정보만 받음(원 질문 보존)
}

export function HumanFeedbackRequest({
  reason,
  originalQuestion,
  onSubmitRevision,
  suggestedQuestions = [],
  onQuestionSelect,
  onAddContext,
}: HumanFeedbackRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 되묻기 포인트 생성 (insufficient일 경우에만)
  // [0] = 이해한 내용(요약), [1..] = 추가로 알려주면 좋은 것(되묻기)
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

  const factPoints = generateFactPoints();
  const descriptionText = getDescriptionText();
  // 이해 요약(첫 포인트)과 되묻기 항목(나머지)을 분리
  const understood = factPoints?.[0];
  const asks = factPoints ? factPoints.slice(1) : [];

  const handleSuggestedQuestionClick = (question: string) => {
    if (isSubmitting) return;
    onQuestionSelect?.(question);
  };

  const handleRetype = () => {
    // invalid/inappropriate: 원본 질문을 입력창에 넣어 다시 작성
    onQuestionSelect?.(originalQuestion);
  };

  const handleContinue = () => {
    setIsSubmitting(true);
    onSubmitRevision(originalQuestion);
  };

  return (
    <div className="my-6 space-y-3">
      {/* 어시스턴트 '되묻기' 버블 — 최종 답변이 아니라 '추가 질문'으로 읽히도록 대화체 구성 */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-100 dark:ring-indigo-900/40 bg-indigo-50">
          <img src={characterImg} alt="노무도우미" className="w-full h-full object-cover" />
        </div>

        <div
          className="max-w-[680px] rounded-2xl rounded-tl-sm bg-blue-150 dark:bg-indigo-950/30 px-5 py-4 space-y-3.5"
          style={{ wordBreak: "keep-all" }}
        >
          {/* 리드: 아직 답변이 아님을 분명히 */}
          <div className="flex items-start gap-2">
            <HelpCircle className="w-[18px] h-[18px] text-primary flex-shrink-0 mt-[1px]" />
            <p className="text-sm font-bold text-foreground leading-relaxed">
              더 정확한 답변을 위해, 답변 전에 몇 가지만 확인할게요.
            </p>
          </div>

          {factPoints ? (
            <>
              {/* 이해한 내용 요약 */}
              {understood && (
                <p className="text-sm text-foreground/90 leading-relaxed">
                  <span className="font-semibold">이렇게 이해했어요</span> — {understood}
                </p>
              )}

              {/* 되묻기: 알려주면 좋은 것 */}
              {asks.length > 0 && (
                <div className="rounded-xl bg-card/70 px-3.5 py-3">
                  <p className="text-[13px] font-bold text-foreground mb-2">
                    아래를 알려주시면 더 정확히 답변드릴 수 있어요
                  </p>
                  <ul className="space-y-1.5">
                    {asks.map((point, index) => (
                      <li key={index} className="flex items-start gap-2 text-[13px] text-foreground/85 leading-relaxed">
                        <span className="mt-[7px] w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 선택 안내 */}
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                이대로 답변을 받으시거나, 위 정보를 더해 주시면 더 정확히 답변드려요.
              </p>
            </>
          ) : (
            descriptionText && (
              <p className="text-sm text-foreground/90 leading-relaxed">{descriptionText}</p>
            )
          )}
        </div>
      </div>

      {/* 액션 — 되묻기에 대한 응답 (버블과 좌측 정렬) */}
      <div className="flex items-center gap-2 pl-[52px] flex-wrap">
        {factPoints ? (
          <>
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ wordBreak: "keep-all" }}
            >
              이대로 답변 받기
            </button>
            <button
              onClick={() => onAddContext?.()}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg border border-primary/50 text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ wordBreak: "keep-all" }}
            >
              맥락 추가하기
            </button>
          </>
        ) : (
          <button
            onClick={handleRetype}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ wordBreak: "keep-all" }}
          >
            질문 다시 입력하기
          </button>
        )}
      </div>

      {/* 추천 질문 */}
      {suggestedQuestions.length > 0 && (
        <div className="pl-[52px] pt-1">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Search className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              또는 추천 질문으로 더 구체적으로 물어보세요.
            </p>
          </div>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestionClick(question)}
                disabled={isSubmitting}
                className="w-full text-left px-4 py-3 bg-card border border-border hover:border-primary/40 hover:bg-muted/40 rounded-xl transition-colors text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
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
