import { useState } from "react";
import { AlertCircle, Send, Sparkles } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";

interface QuestionFeedbackCardProps {
  originalQuestion: string;
  feedbackPoints: string[];
  onSubmitClarification: (clarification: string) => void;
  onProceedAnyway: () => void;
  suggestedQuestions?: string[];
  onSelectQuestion?: (question: string) => void;
}

export function QuestionFeedbackCard({
  originalQuestion,
  feedbackPoints,
  onSubmitClarification,
  onProceedAnyway,
  suggestedQuestions,
  onSelectQuestion,
}: QuestionFeedbackCardProps) {
  const [clarification, setClarification] = useState("");

  const handleSubmit = () => {
    if (clarification.trim()) {
      onSubmitClarification(clarification);
      setClarification("");
    }
  };

  return (
    <div className="my-6">
      <div className="bg-card border-2 border-amber-500/50 rounded-xl shadow-sm overflow-hidden">
        {/* 헤더 */}
        <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground">
                질문 분석 결과: 추가 정보가 필요합니다
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                더 정확한 답변을 위해 아래 사항을 확인해주세요.
              </p>
            </div>
          </div>
        </div>

        {/* 원본 질문 */}
        <div className="p-4 bg-muted/30 border-b border-border">
          <p className="text-xs font-semibold text-muted-foreground mb-2">
            원본 질문
          </p>
          <p className="text-sm text-foreground italic">
            "{originalQuestion}"
          </p>
        </div>

        {/* 피드백 포인트 */}
        <div className="p-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground mb-3">
            다음 사항에 대해 구체적으로 설명해주시면 더 정확한 답변을 드릴 수 있습니다:
          </p>
          <ul className="space-y-2">
            {feedbackPoints.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {idx + 1}
                </span>
                <span className="text-sm text-foreground">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 추천 질문 */}
        {suggestedQuestions && suggestedQuestions.length > 0 && onSelectQuestion && (
          <div className="p-4 bg-primary/5 border-b border-border">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold text-foreground">
                또는 이런 질문은 어떠세요?
              </p>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelectQuestion(question)}
                  className="w-full text-left px-3 py-2.5 bg-white dark:bg-gray-900 hover:bg-primary/5 dark:hover:bg-primary/10 border border-border rounded-lg transition-all group"
                >
                  <p
                    className="text-sm text-foreground group-hover:text-primary transition-colors"
                    style={{ wordBreak: 'keep-all' }}
                  >
                    {question}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 입력 영역 */}
        <div className="p-4 space-y-3">
          <Textarea
            value={clarification}
            onChange={(e) => setClarification(e.target.value)}
            placeholder="추가 정보를 입력해주세요..."
            className="min-h-[100px] resize-none"
          />
          <div className="flex items-center justify-between gap-3">
            <Button
              variant="outline"
              onClick={onProceedAnyway}
              className="text-muted-foreground"
            >
              현재 정보로 진행
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!clarification.trim()}
              className="gap-2"
            >
              <Send className="w-4 h-4" />
              추가 정보 제출
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}