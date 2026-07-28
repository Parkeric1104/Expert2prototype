import { useState } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";

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
    ? "지금까지의 대화에서 도출된 핵심 쟁점입니다. 의견서로 정리할 주제를 선택해 주세요."
    : "지금까지의 대화에서 도출된 핵심 쟁점입니다. 정리할 주제를 선택해 주세요.";

  return (
    // 딤(스크림) 없음 — 위쪽 대화가 그대로 보이고 스크롤 가능. 좌우·하단 여백 두고 플로팅(전체 라운드)
    <div className="fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-3xl bg-background rounded-3xl shadow-2xl px-8 pt-6 pb-8 animate-in slide-in-from-bottom duration-300">
        {/* 우측 컨트롤(접/펼침 + 닫기) — 가운데 드래그 바 제거 */}
        <div className="flex items-center justify-end gap-1 mb-3">
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

        {/* 제목 — 접힘 상태에서도 무엇인지 보이도록 항상 노출 (디자인 정합: 아이콘 없음) */}
        <h2 className="text-lg font-bold text-foreground mb-1" style={{ wordBreak: "keep-all" }}>
          {title}
        </h2>

        {/* 본문(설명 + 주제) — 접으면 숨김 */}
        {!collapsed && (
          <>
            <p className="text-sm text-muted-foreground mb-5" style={{ wordBreak: "keep-all" }}>
              {desc}
            </p>

            {/* 디자인 정합: 옅은 카드(테두리) · 제목(카테고리) + 설명(질문) · 번호배지/화살표 없음 */}
            <div className="space-y-2.5 max-h-[52vh] overflow-y-auto pb-1 -mr-2 pr-2">
              {topics.map((t, idx) => (
                <button
                  key={idx}
                  onClick={() => onSelect(t)}
                  className="w-full text-left px-5 py-4 rounded-2xl bg-muted/60 border border-border/50 hover:border-primary/40 hover:bg-muted transition-colors"
                >
                  <span className="block text-[15px] font-bold text-foreground">{t.title}</span>
                  <span className="block text-[13px] text-muted-foreground mt-1" style={{ wordBreak: "keep-all" }}>
                    {t.desc}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
