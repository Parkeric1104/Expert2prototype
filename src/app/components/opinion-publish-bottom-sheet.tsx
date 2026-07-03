import { X, FileText } from "lucide-react";

export interface PublishTopic {
  title: string;
  desc?: string;
  /** 의견서 본문 생성 기준 질문(해당 상세답변의 질의). 없으면 세션 누적 질의 사용 */
  basis?: string;
}

interface OpinionPublishBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  topic: PublishTopic | null;
  /** 발행(의견서 작성) 확정 */
  onPublish: (topic: PublishTopic) => void;
}

/**
 * 최종 발행 바텀시트 — 의견서 작성 확정 단계 (정책 리뷰 2026-07-03)
 * 의견서 작성 버튼 선택 시 슬라이드업되며, 작성 주제를 함께 노출한다.
 */
export function OpinionPublishBottomSheet({
  isOpen,
  onClose,
  topic,
  onPublish,
}: OpinionPublishBottomSheetProps) {
  if (!isOpen || !topic) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl animate-in slide-in-from-bottom duration-300">
        <div className="mx-auto w-full max-w-3xl px-6 pt-5 pb-7">
          <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />

          <div className="flex items-start justify-between gap-3 mb-1">
            <h2 className="text-lg font-bold text-foreground flex items-center gap-2" style={{ wordBreak: "keep-all" }}>
              <FileText className="w-5 h-5 text-primary" />
              의견서를 발행할까요?
            </h2>
            <button
              onClick={onClose}
              aria-label="닫기"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mb-4" style={{ wordBreak: "keep-all" }}>
            아래 주제의 상세 답변을 바탕으로 AI 노무의견서를 작성합니다.
          </p>

          {/* 작성 주제 */}
          <div className="bg-card border border-border/60 rounded-2xl px-5 py-4 shadow-sm mb-5">
            <p className="text-xs text-muted-foreground mb-1">작성 주제</p>
            <p className="text-sm font-semibold text-foreground" style={{ wordBreak: "keep-all" }}>
              {topic.title}
            </p>
            {topic.desc && (
              <p className="mt-1 text-xs text-muted-foreground" style={{ wordBreak: "keep-all" }}>
                {topic.desc}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
            >
              취소
            </button>
            <button
              onClick={() => onPublish(topic)}
              className="flex items-center gap-1.5 rounded-full pl-4 pr-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95 shadow-sm"
              style={{ background: "#3182F6" }}
            >
              <FileText className="w-4 h-4" />
              의견서 발행
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
