import { useState, useEffect, useRef } from "react";
import { Square, ExternalLink } from "lucide-react";

type SourceType = "법령" | "해석례" | "사규" | "판례";

interface MultiTurnSource {
  type: SourceType;
  title: string;
  url?: string;
}

interface MultiTurnResponseProps {
  /** 대화형 본문 (줄글) */
  body: string;
  /** 하단 출처 — 사규는 노출하지 않음 */
  sources: MultiTurnSource[];
  onLawClick?: (lawName: string) => void;
  stream?: boolean;
  onStreamingChange?: (active: boolean) => void;
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
  body,
  sources,
  onLawClick,
  stream = false,
  onStreamingChange,
}: MultiTurnResponseProps) {
  // 사규는 출처에 미노출 (인용은 본문에서)
  const visibleSources = sources.filter((s) => s.type !== "사규");

  const [displayed, setDisplayed] = useState(stream ? "" : body);
  const [streaming, setStreaming] = useState(stream);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream) {
      setDisplayed(body);
      setStreaming(false);
      return;
    }
    setStreaming(true);
    setDisplayed("");
    let i = 0;
    intervalRef.current = window.setInterval(() => {
      i = Math.min(body.length, i + 2);
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
  }, []);

  // 스트리밍 상태를 부모에 동기화 — 인터벌 이펙트와 분리
  useEffect(() => {
    onStreamingChange?.(streaming);
    if (streaming) return () => onStreamingChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [streaming]);

  const handleStop = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setStreaming(false);
  };

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
