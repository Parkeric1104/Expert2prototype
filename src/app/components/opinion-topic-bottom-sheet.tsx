import { useState } from "react";
import { X, FileText, ChevronRight, Pencil } from "lucide-react";

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
}

export function OpinionTopicBottomSheet({
  isOpen,
  onClose,
  topics,
  onSelect,
}: OpinionTopicBottomSheetProps) {
  const [customMode, setCustomMode] = useState(false);
  const [customText, setCustomText] = useState("");

  if (!isOpen) return null;

  const submitCustom = () => {
    const t = customText.trim();
    if (!t) return;
    onSelect({ title: t.length > 20 ? t.slice(0, 20) + "…" : t, desc: t, basis: t });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />

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
              어떤 주제로 의견서를 작성할까요?
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-5 pl-7" style={{ wordBreak: "keep-all" }}>
            이번 상담에 여러 주제가 포함되어 있어요. 의견서로 정리할 주제를 선택해 주세요.
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

            {/* 기타 (직접 입력) */}
            {!customMode ? (
              <button
                onClick={() => setCustomMode(true)}
                className="w-full flex items-center gap-3 text-left px-4 py-3.5 rounded-2xl bg-card border border-dashed border-border hover:border-primary/40 transition-colors"
              >
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center">
                  <Pencil className="w-3.5 h-3.5" />
                </span>
                <span className="text-sm font-medium text-foreground">기타 (직접 입력)</span>
              </button>
            ) : (
              <div className="rounded-2xl bg-card border border-primary/40 p-3">
                <textarea
                  autoFocus
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      submitCustom();
                    }
                  }}
                  rows={2}
                  placeholder="의견서로 작성할 주제를 입력해 주세요."
                  className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    onClick={() => { setCustomMode(false); setCustomText(""); }}
                    className="px-3 py-1.5 rounded-full text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={submitCustom}
                    disabled={!customText.trim()}
                    className="px-4 py-1.5 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-40"
                  >
                    이 주제로 작성
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
