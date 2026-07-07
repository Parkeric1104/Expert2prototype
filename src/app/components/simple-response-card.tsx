import { Scale, Copy, CornerDownRight } from "lucide-react";
import { toast } from "sonner";

type SourceType = "법령" | "해석례" | "사규" | "판례";

interface SimpleAnswer {
  title: string;
  bullets: Array<{ text: string; sub?: string }>;
  note?: string;
}

interface SimpleResponseCardProps {
  question: string;
  answer: {
    items: Array<{
      text: string;
      laws: string[];
    }>;
  };
  relatedLaws: Array<{
    id: string;
    name: string;
    type?: SourceType;
    content?: string;
  }>;
  onLawClick?: (lawName: string) => void;
  /** 구조화 본문 (제목 + 불릿 + 안내) — 없으면 결론 텍스트로 대체 */
  structured?: SimpleAnswer;
  /** 호환용 (간단 답변은 일괄 표시) */
  stream?: boolean;
  onStreamingChange?: (active: boolean) => void;
}

// 본문 내 법령 조항 표기를 클릭 가능한 링크로 변환 (예: 근로기준법 제17조)
const LAW_REF_REGEX = /([가-힣]+(?:\s시행령)?\s?제\d+조(?:의\d+)?(?:\s?제\d+항)?)/g;

function LinkifiedText({
  text,
  onLawClick,
}: {
  text: string;
  onLawClick?: (lawName: string) => void;
}) {
  // split에 캡처 그룹 사용 시 홀수 인덱스가 매칭된 법령 표기
  const parts = text.split(LAW_REF_REGEX);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <button
            key={i}
            onClick={() => onLawClick?.(part)}
            className="text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// 출처 제목에서 조항 배지/법령명 분리 (예: "근로기준법 제17조 (근로조건의 명시)" → 제17조 / 근로기준법)
function parseSourceChip(title: string, type?: SourceType): { badge: string; name: string } {
  const m = title.match(/^([가-힣·\s]+?)\s*(제\d+조(?:의\d+)?)/);
  if (m) return { badge: m[2], name: m[1].trim() };
  if (type === "해석례") {
    const bare = title.startsWith("#") ? title : `#${title.split(" ")[0].split("(")[0].trim()}`;
    return { badge: "해석례", name: bare };
  }
  if (type === "판례") return { badge: "판례", name: title };
  return { badge: type ?? "법령", name: title };
}

export function SimpleResponseCard({
  question,
  answer,
  relatedLaws,
  onLawClick,
  structured,
}: SimpleResponseCardProps) {
  // 구조화 본문이 없으면 결론 텍스트를 단일 불릿으로 변환
  const body: SimpleAnswer = structured ?? {
    title: question.replace(/\?+$/, "").trim(),
    bullets: [{ text: answer.items.map((i) => i.text).join(" ") }],
  };

  // 사규는 출처에 미노출
  const visibleSources = relatedLaws.filter((l) => l.type !== "사규");

  const handleCopyBody = () => {
    const text = [
      body.title,
      ...body.bullets.flatMap((b) => [`• ${b.text}`, ...(b.sub ? [`  ↳ ${b.sub}`] : [])]),
    ].join("\n");
    navigator.clipboard?.writeText(text);
    toast.success("답변이 복사되었습니다.");
  };

  const handleCopySources = () => {
    navigator.clipboard?.writeText(visibleSources.map((s) => s.id).join("\n"));
    toast.success("근거 법령이 복사되었습니다.");
  };

  return (
    <div className="flex justify-start mb-6">
      {/* 다른 답변 유형(상세·멀티턴)과 동일한 흰색 카드 컨테이너로 통일 */}
      <div className="w-full max-w-[760px] bg-card rounded-2xl shadow-sm border border-border/60 px-6 py-5 flex flex-col">
        {/* ── 제목 + 복사 ── */}
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-bold text-foreground leading-snug" style={{ wordBreak: "keep-all" }}>
            {body.title}
          </h2>
          <button
            onClick={handleCopyBody}
            aria-label="답변 복사"
            className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        {/* ── 불릿 본문 ── */}
        <ul className="mt-4 space-y-4">
          {body.bullets.map((b, i) => (
            <li key={i} className="space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="mt-[9px] w-1 h-1 rounded-full bg-foreground flex-shrink-0" />
                <p
                  className="text-[15px] leading-relaxed text-foreground"
                  style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
                >
                  <LinkifiedText text={b.text} onLawClick={onLawClick} />
                </p>
              </div>
              {b.sub && (
                <div className="flex items-start gap-2 pl-6">
                  <CornerDownRight className="w-3.5 h-3.5 mt-1 text-muted-foreground flex-shrink-0" />
                  <p
                    className="text-[14px] leading-relaxed text-foreground/80"
                    style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
                  >
                    <LinkifiedText text={b.sub} onLawClick={onLawClick} />
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* ── 안내 인용구 ── */}
        {body.note && (
          <div className="mt-6 border-l-[3px] border-indigo-400 pl-4 py-1.5">
            <p className="text-sm text-foreground/80" style={{ wordBreak: "keep-all" }}>
              {body.note}
            </p>
          </div>
        )}

        {/* ── 근거 법령 ── */}
        {visibleSources.length > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-foreground" />
                <h3 className="text-base font-bold text-foreground">근거 법령</h3>
              </div>
              <button
                onClick={handleCopySources}
                aria-label="근거 법령 복사"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-2.5">
              {visibleSources.map((src, idx) => {
                const { badge, name } = parseSourceChip(src.id, src.type);
                return (
                  <button
                    key={idx}
                    onClick={() => onLawClick?.(src.name)}
                    className="flex items-center gap-2.5 pl-1.5 pr-4 py-1.5 rounded-xl bg-card border border-border/60 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <span className="px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-primary text-xs font-bold whitespace-nowrap">
                      {badge}
                    </span>
                    <span className="text-sm text-foreground whitespace-nowrap">{name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
