import { useState } from "react";
import { Lightbulb, Copy } from "lucide-react";
import characterImg from "@/assets/dobi-chat.png";

interface AnswerHeaderProps {
  /** 검토 제목 (예: "퇴직금 중간정산 요청에 대한 법적 검토") */
  title?: string;
  /** 출처(법령/해석례/판례) 개수 — 우측 상단 "출처 N" */
  sourceCount?: number;
  /** 제목 옆 복사 버튼 */
  onCopyTitle?: () => void;
}

// 답변 공용 상단 헤더 — 마스코트 + "조사 완료" 카드(출처 N·시각) + 검토 제목.
// 상세·간단·멀티턴 답변에서 동일하게 사용(디자인 정합).
export function AnswerHeader({ title, sourceCount, onCopyTitle }: AnswerHeaderProps) {
  const [analyzedAt] = useState<string>(() =>
    new Date().toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  );

  return (
    <div>
      {/* 마스코트 — 카드 상단에 살짝 겹침 */}
      <div className="w-14 h-14 rounded-full overflow-hidden ml-1 relative z-10 mb-[-14px]">
        <img src={characterImg} alt="도우미" className="w-full h-full object-cover" />
      </div>

      {/* 조사 완료 카드 */}
      <div className="bg-card border border-border rounded-2xl shadow-sm px-5 pt-6 pb-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 text-sm font-bold text-foreground">
            <Lightbulb className="w-4 h-4 text-primary" />
            조사 완료
          </span>
          {typeof sourceCount === "number" && sourceCount > 0 && (
            <span className="text-sm text-muted-foreground">출처 {sourceCount}</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 pl-6">{analyzedAt}</p>
      </div>

      {/* 검토 제목 */}
      {title && (
        <div className="flex items-start justify-between gap-3 mt-4">
          <h3 className="text-base font-bold text-foreground leading-snug" style={{ wordBreak: "keep-all" }}>
            {title}
          </h3>
          {onCopyTitle && (
            <button
              onClick={onCopyTitle}
              aria-label="답변 복사"
              className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
