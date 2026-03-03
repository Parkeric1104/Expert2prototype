import { useEffect, useState, useRef } from "react";
import { Loader2, Check, Bot, StopCircle, Search, Scale } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { StopResponseDialog } from "@/app/components/stop-response-dialog";

interface LoadingStage {
  id: number;
  text: string;
  completed: boolean;
}

interface ProgressiveLoadingBubbleProps {
  relatedLaws?: string[];
  onStop?: () => void;
}

export function ProgressiveLoadingBubble({ relatedLaws, onStop }: ProgressiveLoadingBubbleProps = {}) {
  const [currentStage, setCurrentStage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showLawBox, setShowLawBox] = useState(false);
  const [foundLaws, setFoundLaws] = useState<string[]>([]);
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [isPaused, setIsPaused] = useState(false); // 일시 중지 상태
  
  // useRef로 타이머 ID 관리
  const timersRef = useRef<NodeJS.Timeout[]>([]);
  const pausedStateRef = useRef<{
    currentStage: number;
    progress: number;
    foundLaws: string[];
    pausedAt: number;
  } | null>(null);

  const stages: LoadingStage[] = [
    { id: 0, text: "질문의 핵심 쟁점 추출 중...", completed: false },
    { id: 1, text: "관련 법령 및 조항 스캔 중...", completed: false },
    { id: 2, text: "판례 데이터베이스 검색 중...", completed: false },
    { id: 3, text: "법률 검토 의견 작성 중...", completed: false },
  ];

  // 추천 질문에서 전달된 법령이 있으면 사용, 없으면 기본값 사용
  const lawExamples = relatedLaws && relatedLaws.length > 0 ? relatedLaws : [
    "산업재해보상보험법 제37조",
    "근로기준법 제54조",
    "대법원 2017두74719 판결",
  ];

  // Helper to get law names from IDs
  const getLawNames = (lawIds: string[]): string[] => {
    const lawMap: Record<string, string> = {
      "labor-standards": "근로기준법",
      "equal-employment": "남녀고용평등법",
      "industrial-safety": "산업안전보건법",
      "serious-accident": "중대재해처벌법",
      "labor-union": "노동조합법",
      "minimum-wage": "최저임금법",
      "dispatched-workers": "파견근로자 보호법",
      "fixed-term": "기간제 및 단시간근로자 보호법",
      "employment-insurance": "고용보험법",
      "industrial-accident-insurance": "산업재해보상보험법",
      "elderly-employment": "고령자고용촉진법",
      "disabled-employment": "장애인고용촉진법",
      "foreign-workers": "외국인근로자 고용법",
      "vocational-training": "근로자직업능력개발법",
      "labor-welfare": "근로복지기본법",
    };
    return lawIds.map(id => lawMap[id] || id);
  };
  
  // 중단 핸들러
  const handleStopConfirm = () => {
    setIsStopped(true);
    // 모든 타이머 클리어
    timersRef.current.forEach(timer => clearTimeout(timer));
    timersRef.current = [];
    onStop?.();
  };

  // 팝업 열릴 때 일시 중지
  useEffect(() => {
    if (showStopDialog && !isPaused) {
      setIsPaused(true);
      // 현재 상태 저장
      pausedStateRef.current = {
        currentStage,
        progress,
        foundLaws: [...foundLaws],
        pausedAt: Date.now()
      };
      // 모든 타이머 클리어
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    } else if (!showStopDialog && isPaused) {
      setIsPaused(false);
      pausedStateRef.current = null;
    }
  }, [showStopDialog]);

  useEffect(() => {
    // 이미 중단되었으면 타이머 시작 안 함
    if (isStopped) return;

    // 15초 동안 단계별 진행 (프로토타입 시연용)
    const timer1 = setTimeout(() => {
      setCurrentStage(1);
      setProgress(1);
    }, 2000); // 2초 - Step 1 완료 (질문 분석)

    const timer2 = setTimeout(() => {
      setProgress(2);
      setFoundLaws([lawExamples[0]]);
    }, 4000); // 4초 - 첫 번째 법령

    const timer3 = setTimeout(() => {
      setProgress(3);
      setFoundLaws([lawExamples[0], lawExamples[1]]);
    }, 6000); // 6초 - 두 번째 법령

    const timer4 = setTimeout(() => {
      setProgress(4);
      setFoundLaws([lawExamples[0], lawExamples[1], lawExamples[2]]);
    }, 8000); // 8초 - 세 번째 법령

    const timer5 = setTimeout(() => {
      setProgress(5);
      setFoundLaws(lawExamples.slice(0, 4));
    }, 10000); // 10초 - 네 번째 법령

    const timer6 = setTimeout(() => {
      setProgress(6);
      setFoundLaws(lawExamples.slice(0, 5));
    }, 11000); // 11초 - 다섯 번째 법령

    const timer7 = setTimeout(() => {
      setCurrentStage(2);
      setProgress(7);
      setFoundLaws(lawExamples); // 모든 법령 표시
    }, 12000); // 12초 - Step 2 완료

    const timer8 = setTimeout(() => {
      setProgress(8);
      setCurrentStage(3);
    }, 13500); // 13.5초 - Step 3 시작

    const timer9 = setTimeout(() => {
      setProgress(9);
    }, 15000); // 15초 - 완료

    // 타이머 ID 저장
    timersRef.current = [timer1, timer2, timer3, timer4, timer5, timer6, timer7, timer8, timer9];

    return () => {
      // cleanup: 모든 타이머 클리어
      timersRef.current.forEach(timer => clearTimeout(timer));
      timersRef.current = [];
    };
  }, []); // 빈 배열: 마운트 시 한 번만 실행

  const totalStages = 7;
  const progressPercent = (progress / totalStages) * 100;

  return (
    <div className="flex justify-start mb-6">
      {/* 답변 컨테이너 */}
      <div className="max-w-[650px] flex flex-col gap-2">
        {/* Loading Card - 단계별 프로세스 */}
        <div className="bg-card rounded-2xl shadow-lg border border-border p-5">
          {/* 단계별 진행 상황 */}
          <div className="space-y-3">
            {/* Step 1: 질문 분석 완료 */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                <Check className="w-3 h-3 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">질문 분석 완료</p>
              </div>
            </div>

            {/* Step 2: 법령 데이터 탐색 중 / 완료 */}
            <div className="flex items-start gap-3">
              {foundLaws.length === 0 ? (
                // 탐색 중일 때
                <>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mt-0.5">
                    <Loader2 className={`w-3 h-3 text-primary ${isPaused ? '' : 'animate-spin'}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">
                      {isPaused ? '법령 데이터 탐색 일시 중지됨' : '법령 데이터 탐색 중...'}
                    </p>
                  </div>
                </>
              ) : (
                // 1건 이상 찾았을 때
                <>
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center mt-0.5">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <p className="text-sm font-medium text-foreground">
                      법령 {foundLaws.length}건 데이터 탐색 완료
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {foundLaws.map((law, index) => (
                        <Badge 
                          key={index}
                          variant="secondary"
                          className="text-xs bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20"
                        >
                          {law}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Step 3: 최종 답변 정리 중 (현재 진행) */}
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-5 h-5 rounded-full border-2 border-primary flex items-center justify-center mt-0.5">
                <Loader2 className={`w-3 h-3 text-primary ${isPaused ? '' : 'animate-spin'}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">
                  {isPaused ? '답변 생성 일시 중지됨' : '최종 답변을 정리하고 있어요.'}
                </p>
              </div>
            </div>
          </div>

          {/* Stop Button */}
          {onStop && (
            <div className="mt-5 pt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStopDialog(true)}
                className="w-full gap-2 text-muted-foreground hover:text-destructive hover:border-destructive"
              >
                <StopCircle className="w-4 h-4" />
                답변 중단하기
              </Button>
            </div>
          )}
        </div>

        {/* Stop Response Dialog */}
        <StopResponseDialog
          isOpen={showStopDialog}
          onClose={() => setShowStopDialog(false)}
          onConfirm={handleStopConfirm}
        />
      </div>
    </div>
  );
}