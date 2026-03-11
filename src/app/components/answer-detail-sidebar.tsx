import { useState, useEffect, useRef } from "react";
import { X, FileText, BookOpen, Scale, Gavel, Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/app/components/ui/button";

interface Source {
  type: "법령" | "해석례" | "판례";
  title: string;
  url?: string;
  description?: string;
  content?: string;
}

interface AIOpinionSummary {
  integratedConclusion: string; // 통합 결론
  proConclusion: string; // 찬성 측 결론
  conConclusion: string; // 반대 측 결론
}

interface AnswerDetailSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  conclusion: string;
  factAnalysis: string;
  queryContent: string;
  reviewContent: string;
  sources: Source[];
  aiOpinion?: AIOpinionSummary | string; // 기존 string 타입도 지원
  questionSummary?: string; // 질문 요약 추가
  isInitialAnswer?: boolean; // 최초 답변 생성 여부 (타이핑 효과 + 자동 닫기 적용)
}

export function AnswerDetailSidebar({
  isOpen,
  onClose,
  conclusion,
  factAnalysis,
  queryContent,
  reviewContent,
  sources,
  aiOpinion,
  questionSummary,
  isInitialAnswer = false,
}: AnswerDetailSidebarProps) {
  const [viewMode, setViewMode] = useState<"answer" | "law">("answer");
  const [selectedLaw, setSelectedLaw] = useState<Source | null>(null);
  
  // 타이핑 효과를 위한 상태
  const [typingStage, setTypingStage] = useState(0); // 0: 준비, 1: 사실관계, 2: 질의내용, 3: 검토내용, 4: 근거법령, 5: 결론
  const [displayedFactAnalysis, setDisplayedFactAnalysis] = useState("");
  const [displayedQueryContent, setDisplayedQueryContent] = useState("");
  const [displayedReviewContent, setDisplayedReviewContent] = useState("");
  const [displayedConclusion, setDisplayedConclusion] = useState("");
  const [showSources, setShowSources] = useState(false);
  
  // 자동 닫기 카운트다운 상태
  const [autoCloseCountdown, setAutoCloseCountdown] = useState<number | null>(null);
  
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  // Handler functions - defined before useEffect hooks to avoid hoisting issues
  const handleLawClick = (source: Source) => {
    setSelectedLaw(source);
    setViewMode("law");
  };

  const handleBackToAnswer = () => {
    setViewMode("answer");
    setSelectedLaw(null);
  };

  const handleClose = () => {
    setViewMode("answer");
    setSelectedLaw(null);
    onClose();
  };

  // 타이핑 효과 함수
  const typeText = (
    fullText: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    onComplete?: () => void
  ) => {
    let index = 0;
    const speed = 8; // 타이핑 속도 (ms)

    const timer = setInterval(() => {
      if (index < fullText.length) {
        setter(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);

    timersRef.current.push(timer as unknown as NodeJS.Timeout);
    return timer;
  };

  // 사이드바가 열릴 때 타이핑 애니메이션 시작 (최초 답변인 경우만)
  useEffect(() => {
    if (isOpen) {
      // 이전 타이머 클리어
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];

      if (isInitialAnswer) {
        // 최초 답변 생성 시: 타이핑 효과 적용
        console.log('[Sidebar] 최초 답변 생성 - 타이핑 효과 시작');
        
        // 초기화
        setTypingStage(0);
        setDisplayedFactAnalysis("");
        setDisplayedQueryContent("");
        setDisplayedReviewContent("");
        setDisplayedConclusion("");
        setShowSources(false);
        setAutoCloseCountdown(null);

        // 단계별 타이핑 시작
        const stage1Timer = setTimeout(() => {
          console.log('[Sidebar] Stage 1: 사실관계 타이핑 시작');
          setTypingStage(1);
          typeText(factAnalysis, setDisplayedFactAnalysis, () => {
            const stage2Timer = setTimeout(() => {
              console.log('[Sidebar] Stage 2: 질의내용 타이핑 시작');
              setTypingStage(2);
              typeText(queryContent, setDisplayedQueryContent, () => {
                const stage3Timer = setTimeout(() => {
                  console.log('[Sidebar] Stage 3: 검토내용 타이핑 시작');
                  setTypingStage(3);
                  typeText(reviewContent, setDisplayedReviewContent, () => {
                    const stage4Timer = setTimeout(() => {
                      console.log('[Sidebar] Stage 4: 근거법령 표시');
                      setTypingStage(4);
                      setShowSources(true);
                      const stage5Timer = setTimeout(() => {
                        console.log('[Sidebar] Stage 5: 결론 타이핑 시작');
                        setTypingStage(5);
                        typeText(conclusion, setDisplayedConclusion, () => {
                          console.log('[Sidebar] 타이핑 완료 - 3초 카운트다운 시작');
                          // 타이핑 완료 후 자동으로 3초 카운트다운 시작
                          setAutoCloseCountdown(3);
                        });
                      }, 300);
                      timersRef.current.push(stage5Timer);
                    }, 200);
                    timersRef.current.push(stage4Timer);
                  });
                }, 200);
                timersRef.current.push(stage3Timer);
              });
            }, 200);
            timersRef.current.push(stage2Timer);
          });
        }, 300);
        
        timersRef.current.push(stage1Timer);
      } else {
        // 상세 답변 보기: 즉시 표시
        console.log('[Sidebar] 상세 답변 보기 - 즉시 표시');
        setTypingStage(5);
        setDisplayedFactAnalysis(factAnalysis);
        setDisplayedQueryContent(queryContent);
        setDisplayedReviewContent(reviewContent);
        setDisplayedConclusion(conclusion);
        setShowSources(true);
        setAutoCloseCountdown(null); // 자동 닫기 없음
      }

      return () => {
        // 클린업: 모든 타이머 클리어
        timersRef.current.forEach(timer => clearTimeout(timer));
        timersRef.current = [];
      };
    }
  }, [isOpen, factAnalysis, queryContent, reviewContent, conclusion, isInitialAnswer]);

  // 자동 닫기 카운트다운 로직
  useEffect(() => {
    if (autoCloseCountdown === null) {
      return;
    }

    // 카운트다운이 0이 되면 자동으로 닫기
    if (autoCloseCountdown === 0) {
      handleClose();
      return;
    }

    // 1초마다 카운트다운 감소
    const countdownTimer = setTimeout(() => {
      setAutoCloseCountdown((prev) => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => clearTimeout(countdownTimer);
  }, [autoCloseCountdown]);

  // autoCloseAfterDocumentSave prop 변경 감지하여 카운트다운 시작
  useEffect(() => {
    if (isInitialAnswer && typingStage === 5 && autoCloseCountdown === null) {
      console.log('[Sidebar] 의견서 저장 완료 감지 - 5초 카운트다운 시작');
      setAutoCloseCountdown(5);
    }
  }, [isInitialAnswer, typingStage, autoCloseCountdown]);

  if (!isOpen) return null;

  const lawSources = sources.filter(s => s.type === "법령");
  const interpretationSources = sources.filter(s => s.type === "해석례");
  const caseSources = sources.filter(s => s.type === "판례");

  const getLawTypeStyles = () => {
    if (!selectedLaw) return { bg: "", iconBg: "", textColor: "" };
    
    switch (selectedLaw.type) {
      case "법령":
        return {
          bg: "bg-indigo-50 dark:bg-indigo-950/20",
          iconBg: "bg-indigo-500",
          textColor: "text-indigo-600 dark:text-indigo-400",
        };
      case "해석례":
        return {
          bg: "bg-green-50 dark:bg-green-950/20",
          iconBg: "bg-green-500",
          textColor: "text-green-600 dark:text-green-400",
        };
      case "판례":
        return {
          bg: "bg-purple-50 dark:bg-purple-950/20",
          iconBg: "bg-purple-500",
          textColor: "text-purple-600 dark:text-purple-400",
        };
      default:
        return {
          bg: "bg-gray-50 dark:bg-gray-950/20",
          iconBg: "bg-gray-500",
          textColor: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const lawStyles = getLawTypeStyles();

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-6 border-b border-border bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center flex-shrink-0">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-foreground leading-tight">
                  상세 답변
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  AI 노무사의 법률 검토 의견서
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className={`flex-shrink-0 ${autoCloseCountdown !== null ? 'bg-primary/10 hover:bg-primary/20' : ''}`}
              title={autoCloseCountdown !== null ? `${autoCloseCountdown}초 후 자동으로 닫힙니다` : '닫기'}
            >
              {autoCloseCountdown !== null ? (
                <div className="flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">{autoCloseCountdown}</span>
                </div>
              ) : (
                <X className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {viewMode === "answer" ? (
            // Answer View
            <div className="space-y-6">
              {/* Fact Analysis */}
              {typingStage >= 1 && (
                <div className="bg-white dark:bg-card border border-border rounded-lg p-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground mb-2">사실관계</h4>
                      <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                        {displayedFactAnalysis}
                        {typingStage === 1 && displayedFactAnalysis.length < factAnalysis.length && (
                          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Query Content */}
              {typingStage >= 2 && (
                <div className="bg-white dark:bg-card border border-border rounded-lg p-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FileText className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground mb-2">질의내용</h4>
                      <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                        {displayedQueryContent}
                        {typingStage === 2 && displayedQueryContent.length < queryContent.length && (
                          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Review Content */}
              {typingStage >= 3 && (
                <div className="bg-white dark:bg-card border border-border rounded-lg p-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <BookOpen className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground mb-2">검토 내용</h4>
                      <div className="prose prose-sm max-w-none dark:prose-invert">
                        <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                          {displayedReviewContent}
                          {typingStage === 3 && displayedReviewContent.length < reviewContent.length && (
                            <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Sources */}
              {showSources && (
                <div className="bg-white dark:bg-card border border-border rounded-lg p-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scale className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground">근거 법령</h4>
                    </div>
                  </div>

                  <div className="space-y-4 pl-9">
                    {/* Laws */}
                    {lawSources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Scale className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h5 className="text-xs font-bold text-foreground">근거 법령</h5>
                          <span className="text-xs text-muted-foreground">({lawSources.length})</span>
                        </div>
                        <div className="space-y-2">
                          {lawSources.map((source, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLawClick(source)}
                              className="block w-full text-left p-3 bg-indigo-50 dark:bg-indigo-950/20 hover:bg-indigo-100 dark:hover:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 rounded-lg text-sm transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-foreground font-medium leading-relaxed flex-1">
                                  {source.title}
                                </span>
                                <ChevronRight className="w-4 h-4 text-indigo-400 group-hover:text-indigo-600 transition-colors" />
                              </div>
                              {source.description && (
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                  {source.description}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Interpretations */}
                    {interpretationSources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />
                          <h5 className="text-xs font-bold text-foreground">해석례</h5>
                          <span className="text-xs text-muted-foreground">({interpretationSources.length})</span>
                        </div>
                        <div className="space-y-2">
                          {interpretationSources.map((source, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLawClick(source)}
                              className="block w-full text-left p-3 bg-green-50 dark:bg-green-950/20 hover:bg-green-100 dark:hover:bg-green-950/40 border border-green-200 dark:border-green-800 rounded-lg text-sm transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-foreground font-medium leading-relaxed flex-1">
                                  {source.title}
                                </span>
                                <ChevronRight className="w-4 h-4 text-green-400 group-hover:text-green-600 transition-colors" />
                              </div>
                              {source.description && (
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                  {source.description}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Case Law */}
                    {caseSources.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Gavel className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                          <h5 className="text-xs font-bold text-foreground">판례</h5>
                          <span className="text-xs text-muted-foreground">({caseSources.length})</span>
                        </div>
                        <div className="space-y-2">
                          {caseSources.map((source, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLawClick(source)}
                              className="block w-full text-left p-3 bg-purple-50 dark:bg-purple-950/20 hover:bg-purple-100 dark:hover:bg-purple-950/40 border border-purple-200 dark:border-purple-800 rounded-lg text-sm transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-foreground font-medium leading-relaxed flex-1">
                                  {source.title}
                                </span>
                                <ChevronRight className="w-4 h-4 text-purple-400 group-hover:text-purple-600 transition-colors" />
                              </div>
                              {source.description && (
                                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                                  {source.description}
                                </p>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* AI Opinion */}
              {aiOpinion && (
                <div className="bg-white dark:bg-card border-2 border-purple-300 dark:border-purple-700 rounded-lg p-5">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-foreground">AI 심층분석 결과</h4>
                    </div>
                  </div>

                  {typeof aiOpinion === "string" ? (
                    // String type - Legacy support
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-line pl-9">
                      {aiOpinion}
                    </div>
                  ) : (
                    // Object type - 두 AI 노무사의 의견 표시
                    <div className="space-y-4 pl-9">
                      {/* Pro & Con Conclusions */}
                      <div className="grid grid-cols-1 gap-4">
                        {/* Conservative AI */}
                        <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 rounded-lg">
                          <h5 className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-2 flex items-center gap-2">
                            <span className="text-base">🛡️</span>
                            보수적 AI 노무사
                          </h5>
                          <p className="text-sm leading-relaxed text-foreground">
                            {aiOpinion.proConclusion}
                          </p>
                        </div>

                        {/* Progressive AI */}
                        <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border-l-4 border-purple-500 rounded-lg">
                          <h5 className="text-sm font-bold text-purple-600 dark:text-purple-400 mb-2 flex items-center gap-2">
                            <span className="text-base">✨</span>
                            허용적 AI 노무사
                          </h5>
                          <p className="text-sm leading-relaxed text-foreground">
                            {aiOpinion.conConclusion}
                          </p>
                        </div>
                      </div>

                      {/* Integrated Conclusion - 마지막에 표시 */}
                      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/30 dark:to-indigo-950/30 border-l-4 border-indigo-500 rounded-lg">
                        <h5 className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-2 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" />
                          종합 의견
                        </h5>
                        <p className="text-sm leading-relaxed text-foreground">
                          {aiOpinion.integratedConclusion}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Conclusion - 최하단으로 이동 */}
              {typingStage >= 5 && (
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-l-4 border-indigo-500 rounded-lg p-5 animate-in fade-in duration-300">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Scale className="w-3.5 h-3.5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-foreground mb-2">결론</h3>
                      <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                        {displayedConclusion}
                        {typingStage === 5 && displayedConclusion.length < conclusion.length && (
                          <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Law View
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToAnswer}
                  className="flex-shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground leading-tight">
                    {selectedLaw?.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {selectedLaw?.type}
                  </p>
                </div>
              </div>

              <div className="bg-white dark:bg-card border border-border rounded-lg p-5">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Scale className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-foreground mb-2">법령 내용</h4>
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {selectedLaw?.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/30">
          {/* 일반 닫기 버튼 */}
          <Button
            onClick={viewMode === "law" ? handleBackToAnswer : (autoCloseCountdown !== null ? () => setAutoCloseCountdown(null) : handleClose)}
            className="w-full"
            variant={viewMode === "law" ? "default" : "outline"}
          >
            {viewMode === "law" ? (
              <>
                <ArrowLeft className="w-4 h-4 mr-2" />
                뒤로가기
              </>
            ) : autoCloseCountdown !== null && autoCloseCountdown > 0 ? (
              `닫기 (${autoCloseCountdown})`
            ) : (
              "닫기"
            )}
          </Button>
        </div>
      </div>
    </>
  );
}