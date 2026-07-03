import { useState, useEffect, useRef } from "react";
import { Scale, FileText, Gavel, Sparkles } from "lucide-react";
import characterImg from "@/assets/ba68b3d133c0b0eab30536be7e6ef8ec6cdf174e.png";

interface Source {
  type: "법령" | "해석례" | "판례";
  title: string;
  url?: string;
  description?: string;
  content?: string;
}

interface AIOpinionSummary {
  integratedConclusion: string;
  proConclusion: string;
  conConclusion: string;
}

interface InlineDetailedAnswerProps {
  conclusion: string;
  factAnalysis: string;
  queryContent: string;
  reviewContent: string;
  sources: Source[];
  aiOpinion?: AIOpinionSummary | string;
  /** 새 답변이면 타이핑 스트리밍, 기존 답변이면 즉시 표시 */
  stream?: boolean;
  onStreamingChange?: (active: boolean) => void;
  /** 출처(법령/해석례/판례) 클릭 → 출처·탐색기록 패널 오픈 */
  onSourceClick?: (title: string) => void;
  /** AI 상세의견 반영 여부 (반영 시 AI 의견 요약 노출) */
  reflected?: boolean;
  /** AI 상세의견 토론 패널 열기 */
  onOpenDebate?: () => void;
  /** 답변별 의견서 작성 — 해당 상세답변을 기준으로 의견서 작성 (정책 리뷰 2026-07-03) */
  onWriteOpinion?: () => void;
}

// 법령 제목에서 조항 배지/법령명 분리 (예: "근로기준법 제17조 (근로조건의 명시)" → 제17조 / 근로기준법)
function parseLawChip(title: string): { badge: string; name: string } {
  const m = title.match(/^([가-힣·\s]+?)\s*(제\d+조(?:의\d+)?)/);
  if (m) return { badge: m[2], name: m[1].trim() };
  return { badge: "법령", name: title };
}

function caseDisplayTitle(s: Source): string {
  if (s.type === "해석례" && !s.title.startsWith("#")) {
    return `#${s.title.split(" ")[0].split("(")[0].trim()}`;
  }
  return s.title;
}

function sourceSubtitle(s: Source): string {
  const c = s.content || "";
  const m =
    c.match(/【질의요지】\s*([^\n【]+)/) ||
    c.match(/【판시사항】\s*([^\n【]+)/) ||
    c.match(/【제목】\s*([^\n【]+)/);
  if (m) return m[1].trim();
  return c.replace(/\n+/g, " ").trim().slice(0, 60);
}

export function InlineDetailedAnswer({
  conclusion,
  factAnalysis,
  queryContent,
  reviewContent,
  sources,
  aiOpinion,
  stream = false,
  onStreamingChange,
  onSourceClick,
  reflected = false,
  onOpenDebate,
  onWriteOpinion,
}: InlineDetailedAnswerProps) {
  const [typingStage, setTypingStage] = useState(stream ? 0 : 5);
  const [displayedFactAnalysis, setDisplayedFactAnalysis] = useState(stream ? "" : factAnalysis);
  const [displayedQueryContent, setDisplayedQueryContent] = useState(stream ? "" : queryContent);
  const [displayedReviewContent, setDisplayedReviewContent] = useState(stream ? "" : reviewContent);
  const [displayedConclusion, setDisplayedConclusion] = useState(stream ? "" : conclusion);
  const [showSources, setShowSources] = useState(!stream);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const typeText = (
    fullText: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    onComplete?: () => void
  ) => {
    let index = 0;
    const speed = 8;
    const timer = setInterval(() => {
      if (index < fullText.length) {
        setter(fullText.substring(0, index + 1));
        index++;
      } else {
        clearInterval(timer);
        onComplete?.();
      }
    }, speed);
    timersRef.current.push(timer as unknown as ReturnType<typeof setTimeout>);
    return timer;
  };

  // 마운트 시 1회 스트리밍 (stream=true). 기존 답변은 즉시 표시 상태로 초기화됨.
  useEffect(() => {
    if (!stream) return;
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    const t1 = setTimeout(() => {
      setTypingStage(1);
      typeText(factAnalysis, setDisplayedFactAnalysis, () => {
        const t2 = setTimeout(() => {
          setTypingStage(2);
          typeText(queryContent, setDisplayedQueryContent, () => {
            const t3 = setTimeout(() => {
              setTypingStage(3);
              typeText(reviewContent, setDisplayedReviewContent, () => {
                const t4 = setTimeout(() => {
                  setTypingStage(4);
                  typeText(conclusion, setDisplayedConclusion, () => {
                    const t5 = setTimeout(() => {
                      setTypingStage(5);
                      setShowSources(true);
                    }, 200);
                    timersRef.current.push(t5);
                  });
                }, 200);
                timersRef.current.push(t4);
              });
            }, 200);
            timersRef.current.push(t3);
          });
        }, 200);
        timersRef.current.push(t2);
      });
    }, 300);
    timersRef.current.push(t1);

    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
    // 마운트 시 1회만 실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 스트리밍 활성 여부를 부모에 보고 (입력창 비활성화 제어)
  const streamingActive = stream && !showSources;
  useEffect(() => {
    onStreamingChange?.(streamingActive);
  }, [streamingActive, onStreamingChange]);

  const lawSources = sources.filter((s) => s.type === "법령");
  const interpretationSources = sources.filter((s) => s.type === "해석례");
  const caseSources = sources.filter((s) => s.type === "판례");

  return (
    <div className="flex justify-start mb-6">
      <div className="w-full max-w-[760px] bg-card rounded-2xl shadow-sm border border-border/60 px-6 py-5">
        {/* 헤더: 마스코트 + 조사 완료 */}
        <div className="flex items-center gap-3 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-indigo-100 dark:ring-indigo-900/40">
            <img src={characterImg} alt="도우미" className="w-full h-full object-cover" />
          </div>
          <span className="inline-flex items-center gap-1 text-sm font-bold text-foreground">
            <Scale className="w-3.5 h-3.5 text-primary" />
            조사 완료
          </span>
        </div>

        {/* 문서형 본문 */}
        <div className="pt-5 space-y-7">
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
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {lawSources.map((s, idx) => {
                      const { badge, name } = parseLawChip(s.title);
                      return (
                        <button
                          key={idx}
                          onClick={() => onSourceClick?.(s.title)}
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

              {/* 해석례 */}
              {interpretationSources.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-2">
                    <FileText className="w-4 h-4 text-foreground" />
                    <h3 className="text-base font-bold text-foreground">해석례</h3>
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">참고하실 수 있는 실제 해석례를 아래에 정리해두었어요.</p>
                  <div className="space-y-2">
                    {interpretationSources.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSourceClick?.(s.title)}
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

              {/* 판례 */}
              {caseSources.length > 0 && (
                <section>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Gavel className="w-4 h-4 text-foreground" />
                    <h3 className="text-base font-bold text-foreground">판례</h3>
                  </div>
                  <div className="space-y-2">
                    {caseSources.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => onSourceClick?.(s.title)}
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

          {/* AI 상세의견 진입 (반영 전) */}
          {aiOpinion && showSources && !reflected && (
            <section className="animate-in fade-in duration-300">
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-foreground">AI 상세의견</h3>
                    <p className="text-sm text-muted-foreground mt-1 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                      두 가지 유형의 AI가 핵심 쟁점을 다각도로 심층 토론하여 결과를 도출합니다. 토론 내용을 확인하고 최종 답변 및 의견서에 반영해 보세요.
                    </p>
                    {/* CTA 한 줄 배치: AI 상세의견 보기 · 의견서 작성 */}
                    <div className="mt-3 flex items-center flex-wrap gap-2">
                      <button
                        onClick={() => onOpenDebate?.()}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        AI 상세의견 보기
                      </button>
                      {onWriteOpinion && (
                        <button
                          onClick={onWriteOpinion}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
                          style={{ background: "#3182F6" }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          의견서 작성
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* AI 의견 요약 (반영 후) */}
          {aiOpinion && showSources && reflected && (
            <section className="animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-foreground" />
                  <h3 className="text-base font-bold text-foreground">AI 의견 요약</h3>
                </div>
                <button
                  onClick={() => onOpenDebate?.()}
                  className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
                >
                  AI 상세의견 다시 보기
                </button>
              </div>

              {typeof aiOpinion === "string" ? (
                <div className="bg-card border border-border/60 rounded-xl p-4">
                  <p className="text-sm leading-relaxed text-foreground">{aiOpinion}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* AI 엄격한 법률학자 */}
                  <div className="flex items-start gap-4 bg-card border border-border/60 rounded-xl p-4">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-200 dark:ring-blue-800">
                        <img src={characterImg} alt="AI 엄격한 법률학자" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 text-center leading-tight">AI 엄격한<br/>법률학자</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground flex-1 pt-0.5">
                      {aiOpinion.proConclusion}
                    </p>
                  </div>

                  {/* AI 실무형 분석가 */}
                  <div className="flex items-start gap-4 bg-card border border-border/60 rounded-xl p-4">
                    <div className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
                      <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-purple-200 dark:ring-purple-800">
                        <img src={characterImg} alt="AI 실무형 분석가" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[10px] font-semibold text-purple-600 dark:text-purple-400 text-center leading-tight">AI 실무형<br/>분석가</span>
                    </div>
                    <p className="text-sm leading-relaxed text-foreground flex-1 pt-0.5">
                      {aiOpinion.conConclusion}
                    </p>
                  </div>
                </div>
              )}

              {/* 하단 고지 */}
              <p className="mt-4 text-[11px] text-muted-foreground text-center leading-relaxed">
                AI 의견은 참고용이며 부정확한 정보가 포함될 수 있습니다. 중요한 결정은 전문가 상담을 권장드립니다.
              </p>
            </section>
          )}

          {/* 답변별 의견서 작성 — AI 상세의견 카드가 없을 때(미제공·반영 완료)만 별도 행으로 노출 */}
          {showSources && onWriteOpinion && (!aiOpinion || reflected) && (
            <div className="mt-5 pt-4 border-t border-border flex justify-end">
              <button
                onClick={onWriteOpinion}
                className="flex items-center gap-1.5 rounded-full pl-4 pr-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
                style={{ background: "#3182F6" }}
              >
                <FileText className="w-4 h-4" />
                의견서 작성
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
