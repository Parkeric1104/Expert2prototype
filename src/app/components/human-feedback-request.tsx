import { useState } from "react";
import { AlertCircle, XCircle, Shield, HelpCircle, Sparkles } from "lucide-react";

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

  const getReasonMessage = () => {
    switch (reason) {
      case "invalid":
        return {
          title: "질문을 이해할 수 없습니다",
          description: "입력하신 내용이 명확하지 않습니다. 구체적인 질문을 입력해주세요.",
        };
      case "insufficient":
        return {
          title: "질문을 한번 더 확인해주세요",
          description: "",
        };
      case "inappropriate":
        return {
          title: "답변할 수 없는 질문입니다",
          description: "이 질문은 법적·윤리적 책임 문제로 인해 답변이 제한됩니다.",
        };
    }
  };

  // 사실 관계 분석 생성 (insufficient일 경우에만)
  const generateFactAnalysis = (): { summary: string; missingPoints: string[] } | null => {
    if (reason !== "insufficient") return null;

    // 원본 질문 기반으로 사실 관계 요약 생성
    const summary = `귀하께서는 ${originalQuestion.length > 50 ? originalQuestion.substring(0, 50) + '...' : originalQuestion}에 대해 문의하셨습니다. 문의하신 상황에서 다음과 같은 사항이 추가로 확인이 필요합니다.`;

    // 추가 확인 필요 사항 자동 생성
    const missingPoints: string[] = [];

    const lowerQuestion = originalQuestion.toLowerCase();

    // 질문 내용에 따라 확인 사항 생성
    if (lowerQuestion.includes("퇴직금") || lowerQuestion.includes("중간정산")) {
      missingPoints.push("재직 기간은 얼마나 되시나요? (정확한 입사일과 퇴사일 또는 중간정산 시점)");
      missingPoints.push("회사의 상시근로자 수는 몇 명인가요?");
      missingPoints.push("중간정산 사유가 무엇인가요? (주택구입, 전세금, 부채상환 등)");
    } else if (lowerQuestion.includes("연차") || lowerQuestion.includes("휴가")) {
      missingPoints.push("근속 기간은 얼마나 되시나요?");
      missingPoints.push("정규직인가요, 아니면 계약직/파견직 등 다른 고용 형태인가요?");
      missingPoints.push("회사의 취업규칙이나 단체협약에 연차 관련 규정이 있나요?");
    } else if (lowerQuestion.includes("임금") || lowerQuestion.includes("급여") || lowerQuestion.includes("체불")) {
      missingPoints.push("임금 지급일은 언제이며, 미지급 기간은 얼마나 되나요?");
      missingPoints.push("근로계약서에 명시된 임금은 얼마인가요?");
      missingPoints.push("회사의 상시근로자 수는 몇 명인가요?");
    } else if (lowerQuestion.includes("해고") || lowerQuestion.includes("징계")) {
      missingPoints.push("해고 또는 징계 사유로 통보받은 내용이 무엇인가요?");
      missingPoints.push("해고 예고 통지를 받으셨나요? 받으셨다면 언제인가요?");
      missingPoints.push("취업규칙이나 단체협약에 징계 절차가 규정되어 있나요?");
    } else if (lowerQuestion.includes("산재") || lowerQuestion.includes("재해") || lowerQuestion.includes("사고")) {
      missingPoints.push("사고가 발생한 정확한 시간과 장소는 어디인가요?");
      missingPoints.push("사고 당시 업무와의 관련성이 명확한가요? (업무 지시, 출퇴근 중 등)");
      missingPoints.push("회사에 산재 신청을 하셨나요? 하셨다면 진행 상황은 어떻게 되나요?");
    } else {
      // 일반적인 확인 사항
      missingPoints.push("구체적인 상황과 배경을 설명해주세요.");
      missingPoints.push("관련된 날짜나 기간을 알려주세요.");
      missingPoints.push("회사의 규모(상시근로자 수)와 귀하의 고용 형태를 알려주세요.");
    }

    return { summary, missingPoints };
  };

  const factAnalysis = generateFactAnalysis();

  const { title, description } = getReasonMessage();

  const handleSuggestedQuestionClick = (question: string) => {
    if (isSubmitting) return;
    
    // 입력창에만 자동 입력 (제출은 사용자가 직접)
    if (onQuestionSelect) {
      onQuestionSelect(question);
    }
  };

  const getBgColor = () => {
    switch (reason) {
      case "invalid":
        return "bg-[#FFF8E1]";
      case "insufficient":
        return "bg-[#EFF6FF]";
      case "inappropriate":
        return "bg-[#FFE8F0]";
    }
  };

  const getBorderColor = () => {
    switch (reason) {
      case "invalid":
        return "border-[#FFE0A3]";
      case "insufficient":
        return "bg-[#BEDBFF]";
      case "inappropriate":
        return "border-[#FFD0E0]";
    }
  };

  const getIconColor = () => {
    switch (reason) {
      case "invalid":
        return "text-[#FF9800]";
      case "insufficient":
        return "text-[#155DFC]";
      case "inappropriate":
        return "text-[#E91E63]";
    }
  };

  const getIcon = () => {
    switch (reason) {
      case "invalid":
        return XCircle;
      case "insufficient":
        return HelpCircle;
      case "inappropriate":
        return Shield;
    }
  };

  const Icon = getIcon();

  return (
    <div className={`my-6 border-2 rounded-2xl p-6 ${getBgColor()} ${getBorderColor()}`}>
      <div className="flex items-start gap-3 mb-4">
        <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${getIconColor()}`} />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-[#1A1A1E] mb-1" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{title}</h3>
          {description && (
            <p className="text-sm text-[#666673]" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{description}</p>
          )}
        </div>
      </div>

      {/* 사실 관계 섹션 (insufficient일 경우에만 표시) */}
      {factAnalysis && (
        <div className="mb-4 p-4 bg-white/60 rounded-xl border border-[rgba(190,219,255,0.5)]">
          <h4 className="text-sm font-bold text-[#1A1A1E] mb-2.5" style={{ wordBreak: 'keep-all' }}>사실 관계</h4>
          <div className="space-y-3 text-sm text-[#666673]" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
            <p>{factAnalysis.summary}</p>
            <ul className="space-y-2 ml-0">
              {factAnalysis.missingPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#155DFC] mt-0.5 flex-shrink-0">•</span>
                  <span className="flex-1">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* 추천 질문들 */}
      {suggestedQuestions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#6366F1]" />
            <p className="text-sm font-semibold text-[#1A1A1E]" style={{ wordBreak: 'keep-all' }}>또는 이런 질문은 어떠세요?</p>
          </div>
          <div className="space-y-2.5">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestionClick(question)}
                disabled={isSubmitting}
                className="w-full text-left px-4 py-3.5 bg-white hover:bg-[#6366F1]/5 border border-[rgba(99,102,241,0.2)] hover:border-[rgba(99,102,241,0.4)] rounded-2xl transition-all group shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
              >
                <p className="text-sm text-[#1A1A1E] group-hover:text-[#6366F1] transition-colors font-medium leading-relaxed">
                  {question}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 입력한 질문으로 이어서 질문하기 버튼 - insufficient만 노출 */}
      {reason === "insufficient" && (
        <button
          onClick={() => {
            setIsSubmitting(true);
            onSubmitRevision(originalQuestion);
          }}
          disabled={isSubmitting}
          className="w-full mt-4 px-6 py-4 bg-[#6366F1] hover:bg-[#5558E3] text-white font-semibold rounded-2xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ wordBreak: 'keep-all' }}
        >
          입력한 질문으로 이어서 질문하기
        </button>
      )}
    </div>
  );
}