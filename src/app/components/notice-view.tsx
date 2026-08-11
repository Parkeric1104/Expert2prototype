import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getNotices, markAllNoticesRead, type Notice } from "@/app/data/service-content";

// 공지사항 페이지(전체화면). 사이드패널 하단 '공지사항' → 페이지 전환으로 진입.
export function NoticeView() {
  const notices = getNotices();
  const [selected, setSelected] = useState<Notice | null>(null);

  // 페이지 진입 시 전체 읽음 처리(뱃지 제거)
  markAllNoticesRead();

  const badge = (type: Notice["type"]) =>
    type === "릴리즈노트" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";

  return (
    <div className="flex-1 min-h-0 overflow-y-auto">
      <div className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4 py-8">
        {!selected ? (
          <>
            <h1 className="text-xl font-bold text-foreground mb-5">공지사항</h1>
            <ul className="space-y-2">
              {notices.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => setSelected(n)}
                    className="w-full text-left px-4 py-3.5 rounded-xl border border-border bg-card hover:bg-muted/50 hover:shadow-sm transition-all"
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
              {notices.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">등록된 공지가 없습니다.</p>}
            </ul>
          </>
        ) : (
          <article>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${badge(selected.type)}`}>{selected.type}</span>
              {selected.important && <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600">중요</span>}
              <span className="text-xs text-muted-foreground">{selected.date}</span>
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-4" style={{ wordBreak: "keep-all" }}>{selected.title}</h2>
            <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line" style={{ wordBreak: "keep-all" }}>{selected.body}</p>

            {/* 하단: 목록으로 */}
            <div className="mt-8 pt-5 border-t border-border">
              <button
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                목록으로
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
