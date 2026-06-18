import { useState, useEffect, useRef } from "react";
import { X, FileText, BookOpen, Scale, Gavel, Sparkles, ChevronRight, ArrowLeft, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { SourcesContent } from "@/app/components/sources-and-history-panel";
import type { PanelSource } from "@/app/components/sources-and-history-panel";
import characterImg from "@/assets/ba68b3d133c0b0eab30536be7e6ef8ec6cdf174e.png";

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

// 법령 제목에서 조항 배지/법령명 분리 (예: "근로기준법 제17조 (근로조건의 명시)" → 제17조 / 근로기준법)
function parseLawChip(title: string): { badge: string; name: string } {
  const m = title.match(/^([가-힣·\s]+?)\s*(제\d+조(?:의\d+)?)/);
  if (m) return { badge: m[2], name: m[1].trim() };
  return { badge: "법령", name: title };
}

// 해석례는 # 접두사 표기
function caseDisplayTitle(s: Source): string {
  if (s.type === "해석례" && !s.title.startsWith("#")) {
    return `#${s.title.split(" ")[0].split("(")[0].trim()}`;
  }
  return s.title;
}

// 출처 본문에서 한 줄 미리보기 추출
function sourceSubtitle(s: Source): string {
  const c = s.content || "";
  const m =
    c.match(/【질의요지】\s*([^\n【]+)/) ||
    c.match(/【판시사항】\s*([^\n【]+)/) ||
    c.match(/【제목】\s*([^\n【]+)/);
  if (m) return m[1].trim();
  return c.replace(/\n+/g, " ").trim().slice(0, 60);
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
  const [viewMode, setViewMode] = useState<"answer" | "law" | "sources">("answer");
  const [selectedLaw, setSelectedLaw] = useState<Source | null>(null);
  const [selectedSourceTitle, setSelectedSourceTitle] = useState<string>("");
  
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
    // 출처 클릭 → 같은 패널 안에서 "sources" 뷰로 슬라이드 전환
    setSelectedSourceTitle(source.title);
    setViewMode("sources");
  };

  const handleBackToAnswer = () => {
    setViewMode("answer");
    setSelectedLaw(null);
    setSelectedSourceTitle("");
  };

  const handleClose = () => {
    setViewMode("answer");
    setSelectedLaw(null);
    setSelectedSourceTitle("");
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
                      console.log('[Sidebar] Stage 4: 결론 타이핑 시작');
                      setTypingStage(4);
                      typeText(conclusion, setDisplayedConclusion, () => {
                        const stage5Timer = setTimeout(() => {
                          console.log('[Sidebar] Stage 5: 출처 표시 + 3초 카운트다운');
                          setTypingStage(5);
                          setShowSources(true);
                          setAutoCloseCountdown(3);
                        }, 200);
                        timersRef.current.push(stage5Timer);
                      });
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
      <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-background border-l border-border shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* 세 개의 뷰를 겹쳐서 배치 */}
        <div className="relative flex-1">
          {/* Answer View */}
          <div
            className={`absolute inset-0 flex flex-col transition-transform duration-300 ${
              viewMode !== "answer" ? "-translate-x-full" : "translate-x-0"
            }`}
          >
            {/* Header (이미지형: 마스코트 + 조사 완료 + 출처 N) */}
            <div className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indigo-100 dark:ring-indigo-900/40">
                  <img src={characterImg} alt="도우미" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
                      <Scale className="w-3.5 h-3.5 text-primary" />
                      조사 완료
                    </span>
                    <span className="text-xs text-muted-foreground">출처 {sources.length}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">AI 노무사의 법률 검토 의견서</p>
                </div>
                <button
                  onClick={() => {
                    const text = [`1. 사실관계\n${factAnalysis}`, `2. 질의내용\n${queryContent}`, `3. 검토 내용\n${reviewContent}`, `4. 결론\n${conclusion}`].join("\n\n");
                    navigator.clipboard?.writeText(text);
                  }}
                  aria-label="답변 복사"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex-shrink-0"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className={`flex-shrink-0 ${autoCloseCountdown !== null ? 'bg-primary/10 hover:bg-primary/20' : ''}`}
                  title={autoCloseCountdown !== null ? `${autoCloseCountdown}초 후 자동으로 닫힙니다` : '닫기'}
                >
                  {autoCloseCountdown !== null ? (
                    <span className="text-sm font-semibold text-primary">{autoCloseCountdown}</span>
                  ) : (
                    <X className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {/* Content - Scrollable (문서형) */}
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="space-y-7">
                {/* 1. 사실관계 */}
                {typingStage >= 1 && (
                  <section className="animate-in fade-in duration-300">
                    <h3 className="text-[15px] font-bold text-primary mb-2">1. 사실관계</h3>
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-line pl-1">
                      {displayedFactAnalysis}
                      {typingStage === 1 && displayedFactAnalysis.length < factAnalysis.length && (
                        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  </section>
                )}

                {/* 2. 질의내용 */}
                {typingStage >= 2 && (
                  <section className="animate-in fade-in duration-300">
                    <h3 className="text-[15px] font-bold text-primary mb-2">2. 질의내용</h3>
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-line pl-1">
                      {displayedQueryContent}
                      {typingStage === 2 && displayedQueryContent.length < queryContent.length && (
                        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  </section>
                )}

                {/* 3. 검토 내용 */}
                {typingStage >= 3 && (
                  <section className="animate-in fade-in duration-300">
                    <h3 className="text-[15px] font-bold text-primary mb-2">3. 검토 내용</h3>
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-line pl-1">
                      {displayedReviewContent}
                      {typingStage === 3 && displayedReviewContent.length < reviewContent.length && (
                        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  </section>
                )}

                {/* 4. 결론 */}
                {typingStage >= 4 && (
                  <section className="animate-in fade-in duration-300">
                    <h3 className="text-[15px] font-bold text-primary mb-2">4. 결론</h3>
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-line pl-1">
                      {displayedConclusion}
                      {typingStage === 4 && displayedConclusion.length < conclusion.length && (
                        <span className="inline-block w-0.5 h-4 bg-primary animate-pulse ml-0.5 align-middle" />
                      )}
                    </div>
                  </section>
                )}

                {/* 관련 법령 및 예규 */}
                {showSources && lawSources.length > 0 && (
                  <section className="animate-in fade-in duration-300">
                    <h3 className="text-[15px] font-bold text-primary mb-2">관련 법령 및 예규</h3>
                    <ul className="space-y-1 pl-1">
                      {lawSources.map((s, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-foreground">
                          <span className="text-muted-foreground mt-0.5">•</span>
                          <span>{s.title}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {/* ── 하단 출처 섹션 ── */}
                {showSources && (
                  <div className="pt-2 space-y-6 border-t border-border animate-in fade-in duration-300">
                    {/* 근거 법령 (칩) */}
                    {lawSources.length > 0 && (
                      <section className="pt-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          <Scale className="w-4 h-4 text-foreground" />
                          <h3 className="text-base font-bold text-foreground">근거 법령</h3>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {lawSources.map((s, idx) => {
                            const { badge, name } = parseLawChip(s.title);
                            return (
                              <button
                                key={idx}
                                onClick={() => handleLawClick(s)}
                                className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg bg-card border border-border/60 shadow-sm hover:border-primary/40 transition-colors"
                              >
                                <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-primary text-xs font-bold whitespace-nowrap">{badge}</span>
                                <span className="text-sm text-foreground whitespace-nowrap">{name}</span>
                              </button>
                            );
                          })}
                        </div>
                      </section>
                    )}

                    {/* 판례 */}
                    {caseSources.length > 0 && (
                      <section>
                        <div className="flex items-center gap-1.5 mb-3">
                          <Gavel className="w-4 h-4 text-foreground" />
                          <h3 className="text-base font-bold text-foreground">판례</h3>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <div className="space-y-2">
                          {caseSources.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLawClick(s)}
                              className="block w-full text-left px-3.5 py-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-colors"
                            >
                              <p className="text-sm text-foreground" style={{ wordBreak: "keep-all" }}>
                                <span className="font-bold text-primary mr-1.5">{caseDisplayTitle(s)}</span>
                                <span className="text-muted-foreground">{sourceSubtitle(s)}</span>
                              </p>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* 해석례 */}
                    {interpretationSources.length > 0 && (
                      <section>
                        <div className="flex items-center gap-1.5 mb-2">
                          <FileText className="w-4 h-4 text-foreground" />
                          <h3 className="text-base font-bold text-foreground">해석례</h3>
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground mb-3">참고하실 수 있는 실제 해석례를 아래에 정리해두었어요.</p>
                        <div className="space-y-2">
                          {interpretationSources.map((s, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleLawClick(s)}
                              className="block w-full text-left px-3.5 py-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 transition-colors"
                            >
                              <p className="text-sm text-foreground" style={{ wordBreak: "keep-all" }}>
                                <span className="font-bold text-primary mr-1.5">{caseDisplayTitle(s)}</span>
                                <span className="text-muted-foreground">{sourceSubtitle(s)}</span>
                              </p>
                            </button>
                          ))}
                        </div>
                      </section>
                    )}
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
                        <h4 className="text-sm font-bold text-foreground">AI 상세의견 결과</h4>
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
              </div>
            </div>
          </div>

          {/* Sources & History View */}
          <div
            className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ${
              viewMode === "sources" ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 h-16 border-b border-border flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToAnswer}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="font-medium">상세 답변</span>
              </Button>
              <h3 className="text-sm font-bold text-foreground absolute left-1/2 -translate-x-1/2">
                출처 및 탐색기록
              </h3>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
            {/* SourcesContent 인라인 렌더 */}
            <SourcesContent
              sources={sources as PanelSource[]}
              initialSelectedTitle={selectedSourceTitle}
            />
          </div>

          {/* Law Detail View */}
          <div
            className={`absolute inset-0 flex flex-col bg-background transition-transform duration-300 ${
              viewMode === "law" ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* Law Header */}
            <div className={`p-6 border-b border-border ${lawStyles.bg}`}>
              <div className="flex items-start justify-between gap-4 mb-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBackToAnswer}
                  className="flex items-center gap-2 hover:bg-white/50 dark:hover:bg-gray-900/50"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="font-medium">뒤로 가기</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {selectedLaw && (
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full ${lawStyles.iconBg} flex items-center justify-center flex-shrink-0`}>
                    {selectedLaw.type === "법령" && <Scale className="w-5 h-5 text-white" />}
                    {selectedLaw.type === "해석례" && <FileText className="w-5 h-5 text-white" />}
                    {selectedLaw.type === "판례" && <Gavel className="w-5 h-5 text-white" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${lawStyles.textColor} px-2 py-0.5 bg-white/50 dark:bg-gray-900/50 rounded`}>
                        {selectedLaw.type}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-foreground leading-tight">
                      {selectedLaw.title}
                    </h2>
                    {selectedLaw.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedLaw.description}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Law Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {selectedLaw?.content ? (
                <div className="bg-white dark:bg-card border border-border rounded-lg p-6">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                      {selectedLaw.content}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-card border border-border rounded-lg p-6">
                  <div className="text-center text-muted-foreground">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">법령 원문을 불러오는 중...</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}