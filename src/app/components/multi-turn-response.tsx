import { useState, useEffect, useRef } from "react";
import { Scale } from "lucide-react";
import { AnswerHeader } from "@/app/components/answer-header";
import { SourceChip } from "@/app/components/source-chip";
import {
  generateMultiTurnAnswer,
  type MultiTurnAnswer,
  type MultiTurnAnswerRequest,
} from "@/app/services/multi-turn-answer";

interface MultiTurnResponseProps {
  /** 답변 생성 요청 (프로바이더: 기본 더미 / VITE 설정 시 LLM 프록시) */
  request: MultiTurnAnswerRequest;
  onLawClick?: (lawName: string) => void;
  stream?: boolean;
  onStreamingChange?: (active: boolean) => void;
  /** 답변 생성 실패 시 호출 — 부모가 이 턴을 채팅 횟수에서 제외(잔여 횟수 보존) */
  onError?: () => void;
  /** 상단 검토 제목 */
  title?: string;
}

export function MultiTurnResponse({
  request,
  onLawClick,
  stream = false,
  onStreamingChange,
  onError,
  title,
}: MultiTurnResponseProps) {
  const [answer, setAnswer] = useState<MultiTurnAnswer | null>(null);
  const [displayed, setDisplayed] = useState("");
  const [streaming, setStreaming] = useState(true);
  const intervalRef = useRef<number | null>(null);

  // 1) 답변 로드 — 프로바이더(더미/LLM)는 서비스에서 결정. 형태는 동일(MultiTurnAnswer).
  useEffect(() => {
    let cancelled = false;
    setStreaming(true);
    generateMultiTurnAnswer(request)
      .then((a) => { if (!cancelled) setAnswer(a); })
      .catch(() => {
        if (cancelled) return;
        setAnswer({ body: "일시적인 오류로 답변을 불러오지 못했습니다. 다시 질문해 주세요.", sources: [] });
        onError?.(); // 이 턴은 채팅 횟수에서 제외 → 잔여 횟수로 계속 진행 가능
      });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) 답변이 로드되면 본문 스트리밍 (더미는 즉시 resolve → 기존 UX 동일)
  useEffect(() => {
    if (!answer) return;
    const body = answer.body;
    if (!stream) {
      setDisplayed(body);
      setStreaming(false);
      return;
    }
    setDisplayed("");
    let i = 0;
    const step = Math.max(3, Math.ceil(body.length / 30));
    intervalRef.current = window.setInterval(() => {
      i = Math.min(body.length, i + step);
      setDisplayed(body.slice(0, i));
      if (i >= body.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setStreaming(false);
      }
    }, 16);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [answer]);

  // 스트리밍 상태를 부모에 동기화
  useEffect(() => {
    onStreamingChange?.(streaming);
    if (streaming) return () => onStreamingChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (answer) setDisplayed(answer.body);
    setStreaming(false);
  };

  // 사규는 출처에 미노출 (인용은 본문에서)
  const visibleSources = (answer?.sources ?? []).filter((s) => s.type !== "사규");

  return (
    <div className="flex justify-start mb-6">
      {/* 상세·간단답변과 동일: 공용 상단 헤더(마스코트 + 조사 완료 카드 + 제목) */}
      <div className="w-full max-w-[760px]">
        <AnswerHeader title={title} sourceCount={visibleSources.length} />

        <div className="mt-5">
          {/* 대화형 본문 (서식 없음) — 한국어 줄바꿈 keep-all 필수 (디자인 가이드 §2) */}
          <p className="text-[15px] leading-relaxed text-foreground font-normal whitespace-pre-line" style={{ wordBreak: "keep-all" }}>
            {displayed}
            {streaming && (
              <span className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-0.5 bg-primary animate-pulse" />
            )}
          </p>

          {streaming && (
            <div className="fixed bottom-28 left-0 right-0 z-30 flex justify-center pointer-events-none">
              <button
                onClick={handleStop}
                className="pointer-events-auto flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border border-border text-sm font-semibold text-foreground shadow-xl hover:bg-muted transition-all active:scale-95"
              >
                <span className="w-2.5 h-2.5 rounded-[3px] bg-red-500 inline-block" />
                답변 중단하기
              </button>
            </div>
          )}

          {/* 하단 근거 법령 (사규 제외) — 상세·간단답변과 동일한 칩 형태 */}
          {!streaming && visibleSources.length > 0 && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-1.5 mb-3">
                <Scale className="w-4 h-4 text-foreground" />
                <h3 className="text-base font-bold text-foreground">근거 법령</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {visibleSources.map((s, idx) => (
                  <SourceChip key={idx} title={s.title} type={s.type} onClick={() => onLawClick?.(s.title)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
