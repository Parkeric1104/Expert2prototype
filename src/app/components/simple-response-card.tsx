import { Scale, BookOpen, FileText } from "lucide-react";

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
    content?: string; // 법령 내용 추가
  }>;
  onLawClick?: (lawName: string) => void;
}

export function SimpleResponseCard({ question, answer, relatedLaws, onLawClick }: SimpleResponseCardProps) {
  const handleLawClick = (lawName: string) => {
    if (onLawClick) {
      onLawClick(lawName);
    }
  };

  return (
    <div className="flex justify-start mb-6">
      <div className="max-w-[720px] flex flex-col gap-3">
        {/* 메인 답변 카드 */}
        <div className="rounded-2xl px-6 py-5 bg-card border border-border shadow-sm">
          {/* 메인 답변 */}
          <div className="mb-4">
            <p className="text-[15px] leading-relaxed text-foreground font-normal">
              {answer.items.map((item, index) => (
                <span key={index}>
                  {item.text}
                  {index < answer.items.length - 1 && " "}
                </span>
              ))}
            </p>
          </div>

          {/* 근거 법령 및 사규 */}
          {relatedLaws.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <span className="w-1 h-1 rounded-full bg-primary" />
                <h4 className="text-[13px] font-bold text-foreground">근거 법령 및 사규</h4>
              </div>

              <div className="space-y-3">
                {relatedLaws.map((law, index) => (
                  <div key={index} className="space-y-2">
                    {/* 법령명 */}
                    <button
                      onClick={() => handleLawClick(law.name)}
                      className="group inline-flex items-baseline gap-1.5 text-[14px] font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      <span>{law.id}</span>
                      <span className="group-hover:underline">&gt;</span>
                    </button>

                    {/* 법령 내용 인용 박스 */}
                    {law.content && (
                      <div className="pl-4 border-l-2 border-primary/30 bg-muted/30 py-2.5 px-4 rounded-r-lg">
                        <p className="text-[13px] leading-relaxed text-foreground/90 whitespace-pre-line">
                          {law.content}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}