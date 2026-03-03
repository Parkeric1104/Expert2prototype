import { AlertTriangle, XCircle, ShieldAlert, Sparkles } from "lucide-react";

interface InvalidQuestionCardProps {
  reason: "meaningless" | "out-of-scope" | "inappropriate" | "unethical";
  originalQuestion: string;
  suggestedQuestions?: string[];
  onSelectQuestion?: (question: string) => void;
}

export function InvalidQuestionCard({ reason, originalQuestion, suggestedQuestions, onSelectQuestion }: InvalidQuestionCardProps) {
  const getContent = () => {
    switch (reason) {
      case "meaningless":
        return {
          icon: XCircle,
          iconColor: "text-orange-500 dark:text-orange-400",
          bgColor: "bg-orange-50 dark:bg-orange-950/30",
          borderColor: "border-orange-200 dark:border-orange-800",
          title: "질문을 이해할 수 없습니다",
          message: "입력하신 내용이 명확하지 않습니다. 구체적인 질문을 입력해주세요.",
          suggestions: [
            "완전한 문장으로 질문해주세요",
            "상황을 구체적으로 설명해주세요",
            "노무/인사 관련 질문인지 확인해주세요"
          ]
        };
      
      case "out-of-scope":
        return {
          icon: AlertTriangle,
          iconColor: "text-amber-500 dark:text-amber-400",
          bgColor: "bg-amber-50 dark:bg-amber-950/30",
          borderColor: "border-amber-200 dark:border-amber-800",
          title: "노무/인사 영역 외 질문입니다",
          message: "이 서비스는 한국 노동법 및 인사 관련 질문에만 답변할 수 있습니다.",
          suggestions: [
            "근로계약, 임금, 근로시간 관련 질문",
            "연차휴가, 퇴직금, 산재보험 관련 질문",
            "인사관리, 노사관계 관련 질문"
          ]
        };
      
      case "inappropriate":
        return {
          icon: ShieldAlert,
          iconColor: "text-red-500 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          title: "답변할 수 없는 질문입니다",
          message: "다음과 같은 질문에는 답변을 제공할 수 없습니다:",
          suggestions: [
            "위법한 운영 방법이나 불법 행위에 대한 문의",
            "특정인의 해고 정당성 판단 (개별 상담 필요)",
            "노동청/법원 제출용 공식 문서 작성 요청",
            "실제 법률 자문이 필요한 소송 관련 사안"
          ]
        };
      
      case "unethical":
        return {
          icon: ShieldAlert,
          iconColor: "text-red-500 dark:text-red-400",
          bgColor: "bg-red-50 dark:bg-red-950/30",
          borderColor: "border-red-200 dark:border-red-800",
          title: "윤리적으로 답변할 수 없습니다",
          message: "이 질문은 법적·윤리적 책임 문제로 인해 답변이 제한됩니다.",
          suggestions: [
            "개별 사안의 해고 정당성은 변호사/노무사와 상담하세요",
            "공식 법률 문서는 전문가의 검토가 필요합니다",
            "위법 운영 방법은 답변할 수 없습니다",
            "일반적인 법령 해석과 원칙에 대해서만 안내합니다"
          ]
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[650px] w-full">
        <div className={`rounded-2xl border-2 ${content.borderColor} ${content.bgColor} overflow-hidden`}>
          {/* 헤더 */}
          <div className="p-4 border-b border-current/20">
            <div className="flex items-start gap-3">
              <div className={`flex-shrink-0 w-8 h-8 rounded-full ${content.bgColor} border ${content.borderColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${content.iconColor}`} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-base text-foreground mb-1">
                  {content.title}
                </h3>
                <p className="text-sm text-muted-foreground" style={{ wordBreak: 'keep-all' }}>
                  {content.message}
                </p>
              </div>
            </div>
          </div>

          {/* 제안 사항 */}
          <div className="p-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2">
              {reason === "out-of-scope" ? "📌 답변 가능한 주제:" : "💡 안내사항:"}
            </p>
            <ul className="space-y-1.5">
              {content.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary mt-0.5">•</span>
                  <span style={{ wordBreak: 'keep-all' }}>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* 푸터 안내 */}
          {(reason === "inappropriate" || reason === "unethical") && (
            <div className="px-4 pb-4">
              <div className="bg-white/50 dark:bg-gray-900/50 rounded-lg px-3 py-2 border border-current/10">
                <p className="text-xs text-muted-foreground" style={{ wordBreak: 'keep-all' }}>
                  <strong>🔒 책임 제한:</strong> 본 서비스는 일반적인 법령 정보 제공을 목적으로 하며, 
                  개별 사안에 대한 법률 자문이나 공식 문서 작성을 대체할 수 없습니다. 
                  구체적인 법적 판단이 필요한 경우 반드시 전문가와 상담하시기 바랍니다.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 원본 질문 표시 */}
        {originalQuestion && (
          <div className="mt-2 px-2">
            <p className="text-xs text-muted-foreground">
              입력하신 질문: <span className="text-foreground font-medium">"{originalQuestion}"</span>
            </p>
          </div>
        )}

        {/* 추천 질문 표시 */}
        {suggestedQuestions && suggestedQuestions.length > 0 && onSelectQuestion && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3 px-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                이런 질문은 어떠세요?
              </p>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => onSelectQuestion(question)}
                  className="w-full text-left px-4 py-3 bg-white dark:bg-gray-900 hover:bg-primary/5 dark:hover:bg-primary/10 border border-border rounded-xl transition-all group"
                >
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors" style={{ wordBreak: 'keep-all' }}>
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}