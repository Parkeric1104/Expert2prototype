import { useState } from "react";
import { AlertTriangle, XCircle, ShieldAlert, Sparkles, Send, AlertCircle, HelpCircle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";

interface InvalidQuestionCardProps {
  reason: "meaningless" | "out-of-scope" | "inappropriate" | "unethical";
  originalQuestion: string;
  suggestedQuestions?: string[];
  onSelectQuestion?: (question: string) => void;
}

export function InvalidQuestionCard({ reason, originalQuestion, suggestedQuestions, onSelectQuestion }: InvalidQuestionCardProps) {
  const [revisedQuestion, setRevisedQuestion] = useState(originalQuestion);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const getContent = () => {
    switch (reason) {
      case "meaningless":
        return {
          title: "질문을 이해할 수 없습니다",
          description: "입력하신 내용이 명확한 질문 형태가 아닙니다. 구체적인 노동법 관련 질문을 입력해주세요.",
          placeholder: "예: 연차 사용 시 회사가 사유를 물어봐도 되나요?\n예: 퇴직금 중간정산이 가능한 경우가 어떻게 되나요?",
        };
      
      case "out-of-scope":
        return {
          title: "노무/인사 영역 외 질문입니다",
          description: "이 서비스는 한국 노동법 및 인사 관련 질문에만 답변할 수 있습니다. 노동법 관련 질문을 입력해주세요.",
          placeholder: "예: 최저임금 미만으로 급여를 받고 있는데 어떻게 해야 하나요?\n예: 근로계약서를 작성하지 않은 경우 법적으로 문제가 되나요?",
        };
      
      case "inappropriate":
      case "unethical":
        return {
          title: "답변할 수 없는 질문입니다",
          description: "노동법과 관련 없는 내용이거나, 윤리적으로 부적절한 질문입니다. 노동법 관련 질문을 입력해주세요.",
          placeholder: "예: 임금 체불 시 대응 방법이 궁금합니다\n예: 직장 내 괴롭힘을 당했을 때 어떻게 해야 하나요?",
        };
    }
  };

  const { title, description, placeholder } = getContent();

  const handleSubmit = () => {
    if (!revisedQuestion.trim() || !onSelectQuestion) return;

    setIsSubmitting(true);
    
    // Simulate processing
    setTimeout(() => {
      onSelectQuestion(revisedQuestion);
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  const handleSuggestedQuestionClick = (question: string) => {
    if (isSubmitted) return;
    setRevisedQuestion(question);
  };

  const getBgColor = () => {
    switch (reason) {
      case "meaningless":
        return "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800";
      case "out-of-scope":
        return "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800";
      case "inappropriate":
      case "unethical":
        return "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800";
    }
  };

  const getIconColor = () => {
    switch (reason) {
      case "meaningless":
        return "text-yellow-600 dark:text-yellow-400";
      case "out-of-scope":
        return "text-amber-600 dark:text-amber-400";
      case "inappropriate":
      case "unethical":
        return "text-red-600 dark:text-red-400";
    }
  };

  const Icon = reason === "meaningless" ? XCircle : reason === "out-of-scope" ? AlertTriangle : ShieldAlert;

  return (
    <div className={`my-6 border-2 rounded-xl p-6 ${getBgColor()}`}>
      <div className="flex items-start gap-3 mb-4">
        <Icon className={`w-6 h-6 flex-shrink-0 mt-0.5 ${getIconColor()}`} />
        <div className="flex-1">
          <h3 className="font-bold text-lg text-foreground mb-1" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{title}</h3>
          <p className="text-sm text-muted-foreground" style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}>{description}</p>
        </div>
      </div>

      <div className="space-y-3">
        {/* 질문 영역 - 수정 가능 */}
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground" style={{ wordBreak: 'keep-all' }}>질문</p>
          <Textarea
            value={revisedQuestion}
            onChange={(e) => setRevisedQuestion(e.target.value)}
            placeholder={placeholder}
            className="min-h-[100px] resize-none"
            style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
            disabled={isSubmitting || isSubmitted}
          />
        </div>

        {/* 추천 질문들 */}
        {suggestedQuestions && suggestedQuestions.length > 0 && !isSubmitted && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground" style={{ wordBreak: 'keep-all' }}>또는 이런 질문은 어떠세요?</p>
            </div>
            <div className="space-y-2.5">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestedQuestionClick(question)}
                  className="w-full text-left px-4 py-3.5 bg-white dark:bg-gray-900 hover:bg-primary/5 dark:hover:bg-primary/10 border-2 border-primary/20 hover:border-primary/40 rounded-xl transition-all group shadow-sm hover:shadow-md"
                  style={{ wordBreak: 'keep-all', overflowWrap: 'break-word' }}
                >
                  <p className="text-sm text-foreground group-hover:text-primary transition-colors font-medium leading-relaxed">
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        <Button
          onClick={handleSubmit}
          disabled={!revisedQuestion.trim() || isSubmitting || isSubmitted || !onSelectQuestion}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              처리중...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              계속 질문하기
            </>
          )}
        </Button>
      </div>
    </div>
  );
}