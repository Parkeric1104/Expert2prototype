import { useState, useEffect } from "react";
import { Bot, Brain, Sparkles, CheckCircle2 } from "lucide-react";
import { Scale } from "lucide-react";

interface Debate {
  round: number;
  conservative: string;
  progressive: string;
}

interface DualPersonaDebateProps {
  question: string;
  initialConclusion: string;
  onDebateComplete?: (summary: string, debateHistory: Array<{ persona: "conservative" | "progressive"; message: string }>) => void;
}

export function DualPersonaDebate({
  question,
  initialConclusion,
  onDebateComplete,
}: DualPersonaDebateProps) {
  const [currentRound, setCurrentRound] = useState(0);
  const [currentDebate, setCurrentDebate] = useState<"conservative" | "progressive" | "conclusion">("conservative");
  const [isDebating, setIsDebating] = useState(true);
  const [debates, setDebates] = useState<Debate[]>([]);
  const [conclusion, setConclusion] = useState("");

  // Generate AI debate on mount
  useEffect(() => {
    // Simulate AI debate generation
    const generateDebate = () => {
      const mockDebates: Debate[] = [
        {
          round: 1,
          conservative: "근로기준법상 업무와 재해 사이의 상당인과관계가 명확히 입증되어야 합니다. 단순히 업무 중 발생했다는 사실만으로는 업무상 재해로 인정하기 어렵습다.",
          progressive: "근로자 보호의 원칙상 업무와 재해 사이의 인과관계가 인정되는 경우 폭넓게 업무상 재해로 보아야 합니다. 업무 기인성이 인정되면 업무상 재해로 판단하는 것이 타당합니다."
        },
        {
          round: 2,
          conservative: "판례에 따르면 업무상 재해 인정에는 엄격한 기준이 적용됩니다. 근로자의 기왕증이나 개인적 소인이 주된 원인인 경우 업무상 재해로 보기 어렵습니다.",
          progressive: "업무가 기왕증을 악화시키거나 발병을 앞당긴 경우에도 업무상 재해로 인정됩니다. 근로자에게 유리하게 해석하는 것이 법의 취지에 부합합니다."
        },
        {
          round: 3,
          conservative: "업무상 재해의 남용을 방지하기 위해 객관적이고 의학적인 증거가 필요합니다. 추정이나 가능성만으로는 인정하기 어렵습니다.",
          progressive: "근로복지공단의 실무례와 대법원 판례를 종합하면, 업무와 재해 사이의 상당인과관계가 인정되는 경우 적극적으로 업무상 재해로 인정해야 합니다."
        }
      ];

      const mockConclusion = "양측의 의견을 종합하면, 업무와 재해 사이의 상당인과관계 입증이 핵심입니다. 구체적 사실관계에 따라 ① 업무의 성질과 강도, ② 재해 발생 경위, ③ 의학적 소견 등을 종합적으로 검토하여 판단해야 합니다. 근로자 보호의 원칙을 고려하되, 객관적 증거에 기반한 신중한 판단이 필요합니다.";

      setDebates(mockDebates);
      setConclusion(mockConclusion);

      // Build debate history for parent
      const debateHistory: Array<{ persona: "conservative" | "progressive"; message: string }> = [];
      mockDebates.forEach(debate => {
        debateHistory.push({ persona: "conservative", message: debate.conservative });
        debateHistory.push({ persona: "progressive", message: debate.progressive });
      });

      return { mockDebates, mockConclusion, debateHistory };
    };

    const result = generateDebate();
    
    // Notify parent when debate is complete
    const completeTimer = setTimeout(() => {
      if (onDebateComplete) {
        onDebateComplete(result.mockConclusion, result.debateHistory);
      }
    }, 6000); // After all rounds complete

    return () => clearTimeout(completeTimer);
  }, [question, initialConclusion]);

  // Animation effect for debates
  useEffect(() => {
    if (debates.length === 0) return;

    if (currentRound >= debates.length) {
      // All debates shown, show conclusion
      if (currentDebate !== "conclusion") {
        const timer = setTimeout(() => {
          setCurrentDebate("conclusion");
          setIsDebating(false);
        }, 800);
        return () => clearTimeout(timer);
      }
      return;
    }

    // Show conservative first, then progressive
    if (currentDebate === "conservative") {
      const timer = setTimeout(() => {
        setCurrentDebate("progressive");
      }, 1500);
      return () => clearTimeout(timer);
    } else if (currentDebate === "progressive") {
      const timer = setTimeout(() => {
        setCurrentRound((prev) => prev + 1);
        setCurrentDebate("conservative");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [currentRound, currentDebate, debates.length]);

  // Get all visible debates up to current round
  const visibleDebates = debates.slice(0, currentRound + 1);

  // Show loading state if debates not ready
  if (!debates || debates.length === 0) {
    return (
      <div className="flex justify-start mb-6">
        <div className="max-w-[650px] flex flex-col gap-2">
          <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2 py-3">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              <span className="text-xs text-muted-foreground ml-2">AI 심층 분석 준비 중...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start mb-6">
      {/* 답변 컨테이너 */}
      <div className="max-w-[650px] flex flex-col gap-2">
        {/* 토론 버블 */}
        <div className="rounded-2xl px-5 py-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-2 border-purple-200 dark:border-purple-800">
          {/* 헤더 */}
          <div className="mb-4 pb-3 border-b border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-foreground">AI 심층 분석 진행 중</h3>
                <p className="text-xs text-muted-foreground">
                  보수적 AI 노무사 vs 허용적 AI 노무사
                </p>
              </div>
              {!isDebating && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
          </div>

          {/* 토론 메시지 */}
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {visibleDebates.map((debate) => (
              <div key={`debate-${debate.round}`}>
                <div
                  className="animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <span
                      className={`text-xs font-bold text-blue-700 dark:text-blue-400`}
                    >
                      보수적 AI 노무사
                    </span>
                  </div>
                  <div
                    className={`ml-6 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800`}
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      {debate.conservative}
                    </p>
                  </div>
                </div>
                <div
                  className="animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex items-start gap-2 mb-1">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <span
                      className={`text-xs font-bold text-purple-700 dark:text-purple-400`}
                    >
                      허용적 AI 노무사
                    </span>
                  </div>
                  <div
                    className={`ml-6 p-3 rounded-lg bg-purple-100 dark:bg-purple-950/40 border border-purple-300 dark:border-purple-700`}
                  >
                    <p className="text-sm text-foreground leading-relaxed">
                      {debate.progressive}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Conclusion */}
            {currentDebate === "conclusion" && (
              <div
                key="conclusion"
                className="animate-in slide-in-from-bottom-2 duration-300"
              >
                <div className="flex items-start gap-2 mb-1">
                  <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400 flex-shrink-0 mt-0.5" />
                  <span
                    className={`text-xs font-bold text-gray-700 dark:text-gray-400`}
                  >
                    AI 결론
                  </span>
                </div>
                <div
                  className={`ml-6 p-3 rounded-lg bg-gray-50 dark:bg-gray-950/30 border border-gray-200 dark:border-gray-800`}
                >
                  <p className="text-sm text-foreground leading-relaxed">
                    {conclusion}
                  </p>
                </div>
              </div>
            )}

            {/* Loading indicator */}
            {isDebating && visibleDebates.length < debates.length && (
              <div className="flex items-center gap-2 py-3 ml-6">
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                <span className="text-xs text-muted-foreground ml-2">토론 진행 중...</span>
              </div>
            )}
          </div>

          {/* Status */}
          {!isDebating && (
            <div className="mt-4 pt-3 border-t border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                <CheckCircle2 className="w-4 h-4" />
                <span className="font-medium">토론 완료 - AI 의견이 답변에 반영됩니다</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}