import { useEffect, useState, useRef } from "react";
import { Check, Search } from "lucide-react";
import { StopResponseDialog } from "@/app/components/stop-response-dialog";
import characterImg from "@/assets/ba68b3d133c0b0eab30536be7e6ef8ec6cdf174e.png";

interface ProgressiveLoadingBubbleProps {
  relatedLaws?: string[];
  onStop?: () => void;
  onAnswerPreparationStart?: () => void;
  onNavigateToMain?: () => void;
}

// 관련 자료를 법령/해석례로 분류해 건수 산출
function splitCounts(items: string[]): { law: number; interp: number } {
  if (!items || items.length === 0) return { law: 4, interp: 2 };
  let law = 0;
  let interp = 0;
  for (const it of items) {
    if (/판결|판례|해석|노동부|#|결정|회시/.test(it)) interp += 1;
    else law += 1;
  }
  return { law: law || 1, interp };
}

export function ProgressiveLoadingBubble({
  relatedLaws,
  onStop,
  onAnswerPreparationStart,
  onNavigateToMain,
}: ProgressiveLoadingBubbleProps = {}) {
  // step: 0 분석 / 1 탐색 / 2 최종정리(활성) / 3 내용정리(대기)
  const [step, setStep] = useState(0);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timersRef = useRef<number[]>([]);
  const preparedRef = useRef(false);

  const { law, interp } = splitCounts(relatedLaws ?? []);
  const total = law + interp;

  // 탐색 세부 트레이스 — 관련 법령을 '검색 성공' 라인으로 (디자인 정합)
  const searchLines = (relatedLaws && relatedLaws.length > 0 ? relatedLaws : ["근로기준법 제60조", "근로기준법 제56조"]).map(
    (l) => `'${l}' 검색 성공`
  );

  // 단계: pending/active/done 3-상태 라벨 + 활성 단계 세부 트레이스 (디자인 문구 정합, 4단계)
  const STEPS = [
    {
      pending: "질문 분석",
      active: "질문을 더 정확하게 이해하는 중이에요",
      done: "질문 분석 완료",
      detail: ["DOUZONE law agent THINK", "First tool: always using 1hop", "특정 노드 정보 제공됨 : 10개", "ACT (시도1)"],
    },
    {
      pending: "법령 탐색",
      active: "법령 탐색 에이전트가 질문과 관련된 핵심 법령을 찾고 있어요.",
      done: "법령 탐색 완료",
      detail: searchLines,
    },
    {
      pending: "핵심 법령 정리",
      active: "핵심 법령을 정리하고 있어요.",
      done: `법령 데이터 ${law}건 정리 완료. 판례/규정 ${interp}건 탐색 완료`,
      detail: [],
    },
    {
      pending: "내용 정리",
      active: "최종 답변을 정리하고 있어요.",
      done: "내용 정리",
      detail: [],
    },
  ];
  // 활성 단계는 마지막 '내용 정리'(index 3, active 라벨='최종 답변을 정리하고 있어요.')까지 진행
  const activeIndex = Math.min(step, 3);

  // 팝업 열릴 때 일시 중지
  useEffect(() => {
    setIsPaused(showStopDialog);
  }, [showStopDialog]);

  useEffect(() => {
    if (isPaused) return;
    // 답변 지연 안에 '내용 정리(최종 답변 정리)' 활성까지 4단계 진행
    const t1 = window.setTimeout(() => setStep(1), 600);
    const t2 = window.setTimeout(() => setStep(2), 1200);
    const t3 = window.setTimeout(() => setStep(3), 1800);
    const t4 = window.setTimeout(() => {
      if (!preparedRef.current && onAnswerPreparationStart) {
        onAnswerPreparationStart();
        preparedRef.current = true;
      }
    }, 2400);
    timersRef.current = [t1, t2, t3, t4];
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [isPaused]);

  const handleStopConfirm = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    onStop?.();
  };

  return (
    <div className="flex flex-col items-start mb-6">
      {/* 마스코트 */}
      <div className="w-14 h-14 rounded-full overflow-hidden mb-4 ml-1">
        <img src={characterImg} alt="도우미" className="w-full h-full object-cover" />
      </div>

      {/* 단계별 타임라인 (활성 단계엔 세부 추론 트레이스 표시 — 디자인 정합) */}
      <div className="flex flex-col gap-0">
        {STEPS.map((s, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isLast = idx === STEPS.length - 1;
          const labelToShow = isPaused && isActive ? "답변 생성 일시 중지됨" : isDone ? s.done : isActive ? s.active : s.pending;
          const showDetail = isActive && !isPaused && s.detail.length > 0;

          return (
            <div key={idx} className="flex items-start gap-3">
              {/* 아이콘 + 연결선 */}
              <div className="flex flex-col items-center self-stretch">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    isDone ? "bg-primary" : isActive ? "bg-primary/15 text-primary" : "border border-muted-foreground/30 text-muted-foreground/40"
                  }`}
                >
                  {isDone ? <Check className="w-3 h-3 text-white" /> : isActive ? <Search className="w-3 h-3" /> : null}
                </div>
                {!isLast && (
                  <div
                    className="flex-1 my-1"
                    style={{
                      minHeight: 18,
                      borderLeft: "2px dotted",
                      borderColor: isDone ? "rgba(87,132,255,0.45)" : "rgba(120,120,140,0.3)",
                    }}
                  />
                )}
              </div>

              {/* 라벨 + 세부 트레이스 */}
              <div className={isLast && !showDetail ? "pb-1" : "pb-5"}>
                <p
                  className={`text-[15px] leading-5 ${
                    isActive ? "font-semibold text-primary" : isDone ? "font-medium text-foreground" : "text-muted-foreground/60"
                  }`}
                >
                  {labelToShow}
                </p>
                {showDetail && (
                  <div className="mt-1.5 space-y-1">
                    {s.detail.map((line, i) => (
                      <p key={i} className="text-[13px] leading-5 text-muted-foreground/80">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stop Response Dialog */}
      <StopResponseDialog
        isOpen={showStopDialog}
        onClose={() => setShowStopDialog(false)}
        onConfirm={handleStopConfirm}
        onNavigateToMain={onNavigateToMain}
      />

      {/* 답변 중단하기 - Fixed Floating Pill */}
      {onStop && (
        <div className="fixed bottom-28 left-0 right-0 z-30 flex justify-center pointer-events-none">
          <button
            onClick={() => setShowStopDialog(true)}
            className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm font-semibold text-foreground shadow-xl hover:bg-muted transition-all active:scale-95"
          >
            <span className="w-2.5 h-2.5 rounded-[3px] bg-red-500 inline-block" />
            답변 중단하기
          </button>
        </div>
      )}
    </div>
  );
}
