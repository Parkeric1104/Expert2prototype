import { Scale, BookOpen, Check } from "lucide-react";
import { toast } from "sonner";

interface SimpleResponseCardProps {
  question: string;
  answer: {
    items: Array<{
      text: string;
      laws: string[];
    }>;
  };
  relatedLaws: Array<{
    id: string;
    name: string;
  }>;
}

export function SimpleResponseCard({ question, answer, relatedLaws }: SimpleResponseCardProps) {
  const handleLawClick = (lawName: string) => {
    toast.info(`${lawName} 상세 정보를 확인합니다`);
    // TODO: Open law detail sidebar
  };

  return (
    <div className="flex justify-start mb-6">
      {/* 답변 컨테이너 */}
      <div className="max-w-[650px] flex flex-col gap-2">
        {/* 답변 버블 */}
        <div className="rounded-2xl px-5 py-3.5 bg-muted/50 text-foreground">
          {/* 분석 완료 메시지 */}
          <div className="mb-3 pb-3 border-b border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Check className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground font-medium">
                질문 분석이 완료되었습니다
              </p>
            </div>
          </div>

          {/* 답변 */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Scale className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-bold text-foreground">답변</h3>
            </div>
            
            {/* Answer Content */}
            <div className="space-y-3 mt-2">
              {answer.items.map((item, index) => (
                <div key={index} className="space-y-1.5">
                  <div className="flex items-start gap-2">
                    <span className="text-muted-foreground mt-0.5 text-sm">•</span>
                    <p className="flex-1 text-sm leading-relaxed text-foreground">
                      {item.text}
                    </p>
                  </div>
                  
                  {item.laws.length > 0 && (
                    <div className="ml-4 flex flex-wrap gap-1.5">
                      {item.laws.map((law, lawIndex) => (
                        <button
                          key={lawIndex}
                          onClick={() => handleLawClick(law)}
                          className="inline-flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                        >
                          <span>↳ {law}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Related Laws Section */}
          {relatedLaws.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2 mb-2.5">
                <BookOpen className="w-4 h-4 text-indigo-500" />
                <h4 className="text-sm font-bold text-foreground">근거 법령</h4>
              </div>

              <div className="space-y-2">
                {relatedLaws.map((law, index) => (
                  <button
                    key={index}
                    onClick={() => handleLawClick(law.name)}
                    className="w-full px-3 py-2 bg-background border border-border rounded-lg hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-all text-left"
                  >
                    <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-0.5">
                      {law.id}
                    </div>
                    <div className="text-sm text-foreground">
                      {law.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}