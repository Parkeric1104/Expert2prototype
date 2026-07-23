import { X, FileText, ChevronRight } from "lucide-react";

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
  if (!isOpen) return null;

  const isOpinion = mode === "opinion";
  const title = isOpinion ? "어떤 주제로 의견서를 작성할까요?" : "어떤 주제로 상세 답변을 받을까요?";
  const desc = isOpinion
    ? "이번 상담에 여러 주제가 포함되어 있어요. 의견서로 정리할 주제를 선택해 주세요."
    : "이번 상담에 여러 주제가 포함되어 있어요. 상세 답변을 받을 주제를 선택해 주세요.";

  return (
    <>
      {/* Scrim — 비차단(pointer-events-none): 위쪽 대화를 스크롤·열람할 수 있도록 클릭/스크롤을 통과시킴 */}
      <div className="fixed inset-0 bg-black/10 z-40 pointer-events-none" aria-hidden />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto w-full max-w-3xl px-6 pt-5 pb-7">
          {/* grabber + close */}
          <div className="relative flex items-center justify-center mb-4">
            <div className="w-10 h-1 rounded-full bg-border" />
            <button
              onClick={onClose}
              aria-label="닫기"
              className="absolute right-0 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-start gap-2.5 mb-1">
            <FileText className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
            <h2 className="text-lg font-bold text-foreground" style={{ wordBreak: "keep-all" }}>
              {title}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5 pl-7" style={{ wordBreak: "keep-all" }}>
            {desc}
          </p>

          {/* 주제 후보 */}
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
        </div>
      </div>
    </>
  );
}
