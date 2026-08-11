import { useState } from "react";
import { X, ChevronLeft } from "lucide-react";
import { getNotices, markAllNoticesRead, type Notice } from "@/app/data/service-content";

// 공지사항 패널 — 목록/상세. 콘텐츠는 service-content(추후 백오피스 대체).
export function NoticePanel({ onClose }: { onClose: () => void }) {
  const notices = getNotices();
  const [selected, setSelected] = useState<Notice | null>(null);

  // 패널 열면 전체 읽음 처리(뱃지 제거) — 드래프트 단순화
  markAllNoticesRead();

  const badge = (type: Notice["type"]) =>
    type === "릴리즈노트"
      ? "bg-primary/10 text-primary"
      : "bg-muted text-muted-foreground";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[520px] max-h-[85vh] overflow-hidden flex flex-col bg-card rounded-2xl shadow-xl border border-border" onClick={(e) => e.stopPropagation()}>
        {/* 헤더 */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-1.5">
            {selected && (
              <button onClick={() => setSelected(null)} className="w-7 h-7 -ml-1 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="목록으로">
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            <h2 className="text-base font-bold text-foreground">{selected ? "공지 상세" : "공지사항"}</h2>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground" aria-label="닫기">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="overflow-y-auto p-3">
          {!selected ? (
            <ul className="space-y-1">
              {notices.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setSelected(n)}
                    className="w-full text-left px-3 py-3 rounded-xl hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${badge(n.type)}`}>{n.type}</span>
                      {n.important && <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600">중요</span>}
                      <span className="ml-auto text-xs text-muted-foreground">{n.date}</span>
                    </div>
                    <p className="text-sm font-medium text-foreground" style={{ wordBreak: "keep-all" }}>{n.title}</p>
                  </button>
                </li>
              ))}
              {notices.length === 0 && <p className="px-3 py-8 text-center text-sm text-muted-foreground">등록된 공지가 없습니다.</p>}
            </ul>
          ) : (
            <article className="px-3 py-2">
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${badge(selected.type)}`}>{selected.type}</span>
                <span className="text-xs text-muted-foreground">{selected.date}</span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-3" style={{ wordBreak: "keep-all" }}>{selected.title}</h3>
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line" style={{ wordBreak: "keep-all" }}>{selected.body}</p>
            </article>
          )}
        </div>
      </div>
    </div>
  );
}
