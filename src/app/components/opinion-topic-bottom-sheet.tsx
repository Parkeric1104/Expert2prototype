import { useState } from "react";
import { X, FileText, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

export interface OpinionTopic {
  title: string;
  desc: string;
  basis: string;
}

interface OpinionTopicBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  topics: OpinionTopic[];
  onSelect: (topic: OpinionTopic) => void;
  /** 진입점에 따른 문구: 'detail'(상세 답변 받기) | 'opinion'(의견서 작성) */
  mode?: "detail" | "opinion";
}

export function OpinionTopicBottomSheet({
  isOpen,
  onClose,
  topics,
  onSelect,
  mode = "detail",
}: OpinionTopicBottomSheetProps) {
  // 접기(내리기)/펼치기(올리기) 상태
  const [collapsed, setCollapsed] = useState(false);

  if (!isOpen) return null;

  const isOpinion = mode === "opinion";
  const title = isOpinion ? "어떤 주제로 의견서를 작성할까요?" : "어떤 주제로 상세 답변을 받을까요?";
  const desc = isOpinion
    ? "이번 상담에 여러 주제가 포함되어 있어요. 의견서로 정리할 주제를 선택해 주세요."
    : "이번 상담에 여러 주제가 포함되어 있어요. 상세 답변을 받을 주제를 선택해 주세요.";

  return (
    // 딤(스크림) 없음 — 위쪽 대화가 그대로 보이고 스크롤 가능. 닫기는 X, 내리기/올리기는 토글 버튼
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto w-full max-w-3xl px-6 pt-4 pb-7">
        {/* grabber + 우측 컨트롤(접/펼침 + 닫기) */}
        <div className="relative flex items-center justify-center mb-3">
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "펼치기" : "접기"}
            className="w-10 h-1.5 rounded-full bg-border hover:bg-muted-foreground/40 transition-colors"
          />
          <div className="absolute right-0 flex items-center gap-1">
            <button
              onClick={() => setCollapsed((c) => !c)}
              aria-label={collapsed ? "펼치기" : "접기"}
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              {collapsed ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 제목 — 접힘 상태에서도 무엇인지 보이도록 항상 노출 */}
        <div className="flex items-start gap-2.5 mb-1">
          <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <h2 className="text-lg font-bold text-foreground" style={{ wordBreak: "keep-all" }}>
            {title}
          </h2>
        </div>

        {/* 본문(설명 + 주제) — 접으면 숨김 */}
        {!collapsed && (
          <>
            <p className="text-sm text-muted-foreground mb-5 pl-7" style={{ wordBreak: "keep-all" }}>
              {desc}
            </p>

            <div className="space-y-2.5">
              {topics.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(t)}
                  className="w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl bg-card border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-colors group"
                >
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-foreground">{t.title}</span>
                    <span className="block text-xs text-muted-foreground mt-0.5 truncate">{t.desc}</span>
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0" />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
