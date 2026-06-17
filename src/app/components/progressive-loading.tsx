import { useEffect, useState, useRef } from "react";
import { Check } from "lucide-react";
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

  const STEPS = [
    "질문 분석 완료",
    `법령 ${law}건, 해석례 ${interp}건 데이터 탐색 완료`,
    "최종 답변을 정리하고 있어요.",
    "내용 정리",
  ];
  // 활성 단계(현재 진행 중): step이 2에 도달하면 '최종 답변 정리'가 활성
  const activeIndex = Math.min(step, 2);

  // 팝업 열릴 때 일시 중지
  useEffect(() => {
    setIsPaused(showStopDialog);
  }, [showStopDialog]);

  useEffect(() => {
    if (isPaused) return;
    // 답변 지연(약 2.5~3.5초) 안에 '최종 답변 정리' 활성 상태까지 진행
    const t1 = window.setTimeout(() => setStep(1), 700);
    const t2 = window.setTimeout(() => setStep(2), 1800);
    const t3 = window.setTimeout(() => {
      if (!preparedRef.current && onAnswerPreparationStart) {
        onAnswerPreparationStart();
        preparedRef.current = true;
      }
    }, 2200);
    timersRef.current = [t1, t2, t3];
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

      {/* 단계별 타임라인 */}
      <div className="flex flex-col gap-0">
        {STEPS.map((label, idx) => {
          const isDone = idx < activeIndex;
          const isActive = idx === activeIndex;
          const isLast = idx === STEPS.length - 1;
          const completedOrActive = isDone || isActive;
          // 텍스트(법령/해석례 건수)는 탐색 단계(1)가 완료(또는 그 이후)일 때만 표시
          const labelToShow =
            idx === 1 && step < 1
              ? "법령 데이터 탐색 중..."
              : isPaused && isActive
              ? "답변 생성 일시 중지됨"
              : label;

          return (
            <div key={idx} className="flex items-start gap-3">
              {/* 도트 + 연결선 */}
              <div className="flex flex-col items-center self-stretch">
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                    completedOrActive ? "bg-primary" : "bg-muted-foreground/30"
                  }`}
                >
                  {completedOrActive && <Check className="w-3 h-3 text-white" />}
                </div>
                {!isLast && (
                  <div
                    className="flex-1 my-1"
                    style={{
                      minHeight: 18,
                      borderLeft: "2px dotted",
                      borderColor: isDone ? "rgba(99,102,241,0.45)" : "rgba(120,120,140,0.3)",
                    }}
                  />
                )}
              </div>

              {/* 라벨 */}
              <p
                className={`text-[15px] leading-5 pb-5 ${
                  isActive
                    ? "font-semibold text-primary"
                    : isDone
                    ? "font-medium text-foreground"
                    : "text-muted-foreground/60"
                }`}
              >
                {labelToShow}
              </p>
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
            className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold shadow-xl transition-all hover:opacity-80 active:scale-95"
            style={{ background: "#1C1C1E", color: "#FFFFFF" }}
          >
            <span className="w-2 h-2 rounded-sm bg-white inline-block" />
            답변 중단하기
          </button>
        </div>
      )}
    </div>
  );
}
