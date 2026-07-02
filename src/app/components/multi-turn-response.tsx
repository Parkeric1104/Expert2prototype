import { useState, useEffect, useRef } from "react";
import { Square, ExternalLink } from "lucide-react";
import {
  generateMultiTurnAnswer,
  type MultiTurnAnswer,
  type MultiTurnAnswerRequest,
  type MultiTurnSource,
} from "@/app/services/multi-turn-answer";

interface MultiTurnResponseProps {
  /** 답변 생성 요청 (프로바이더: 기본 더미 / VITE 설정 시 LLM 프록시) */
  request: MultiTurnAnswerRequest;
  onLawClick?: (lawName: string) => void;
  stream?: boolean;
  onStreamingChange?: (active: boolean) => void;
  /** 답변 생성 실패 시 호출 — 부모가 이 턴을 채팅 횟수에서 제외(잔여 횟수 보존) */
  onError?: () => void;
}

// 해석례는 # 접두사로 표시
function displayTitle(s: MultiTurnSource): string {
  if (s.type === "해석례") {
    if (s.title.startsWith("#")) return s.title;
    const bare = s.title.split(" ")[0].split("(")[0].trim();
    return `#${bare}`;
  }
  return s.title;
}

export function MultiTurnResponse({
  request,
  onLawClick,
  stream = false,
  onStreamingChange,
  onError,
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
      <div className="max-w-[720px] flex flex-col gap-3">
        <div className="rounded-2xl px-6 py-5 bg-card border border-border shadow-sm">
          {/* 대화형 본문 (서식 없음) */}
          <p className="text-[15px] leading-relaxed text-foreground font-normal whitespace-pre-line">
            {displayed}
            {streaming && (
              <span className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-0.5 bg-primary animate-pulse" />
            )}
          </p>

          {streaming && (
            <button
              onClick={handleStop}
              className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Square className="w-3 h-3 fill-current" />
              답변 중단하기
            </button>
          )}

          {/* 하단 출처 (사규 제외) */}
          {!streaming && visibleSources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border space-y-1">
              {visibleSources.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => onLawClick?.(s.title)}
                  className="flex items-center gap-1.5 text-[13px] text-primary hover:underline hover:text-primary/80 transition-colors text-left"
                >
                  <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-70" />
                  {displayTitle(s)}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
