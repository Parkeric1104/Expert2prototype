import { useState } from "react";
import { ChevronLeft, ArrowLeft } from "lucide-react";
import { getNotices, markAllNoticesRead, type Notice, type NoticeType } from "@/app/data/service-content";

// 공지사항 페이지(전체화면). 사이드패널 하단 '공지사항' → 페이지 전환으로 진입.
// 목록: 상단 '메인으로 돌아가기' 바 노출 / 상세: 상단 GNB 미노출(몰입형) + 하단 고정 '목록으로'.
export function NoticeView({ onBack }: { onBack: () => void }) {
  const notices = getNotices();
  const [selected, setSelected] = useState<Notice | null>(null);
  const [filter, setFilter] = useState<"전체" | NoticeType>("전체");
  const TABS: ("전체" | NoticeType)[] = ["전체", "공지", "릴리즈노트"];
  const filtered = filter === "전체" ? notices : notices.filter((n) => n.type === filter);

  // 페이지 진입 시 전체 읽음 처리(뱃지 제거)
  markAllNoticesRead();

  const badge = (type: Notice["type"]) =>
    type === "릴리즈노트" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";

  // ── 목록 ──────────────────────────────────────────────
  if (!selected) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        {/* 상단: 메인으로 돌아가기 */}
        <header className="flex-shrink-0 bg-card border-b border-border">
          <div className="h-14 flex items-center px-6">
            <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              메인으로 돌아가기
            </button>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4 py-8">
            <h1 className="text-xl font-bold text-foreground mb-4">공지사항</h1>
            {/* 카테고리 탭 — 콘텐츠 유형(전체/공지/릴리즈노트) */}
            <div className="flex items-center gap-1 mb-4">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                    filter === t ? "bg-muted font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <ul className="space-y-2">
              {filtered.map((n) => (
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
              {filtered.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">해당 유형의 공지가 없습니다.</p>}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // ── 상세: 상단 GNB 미노출 + 하단 고정 '목록으로' ─────────────
  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 본문(고정 영역, 내부 스크롤) */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <article className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4 py-8">
          <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border">
            <h2 className="flex-1 min-w-0 text-2xl font-bold text-foreground" style={{ wordBreak: "keep-all" }}>{selected.title}</h2>
            <div className="flex-shrink-0 text-right text-xs text-muted-foreground space-y-0.5 pt-1">
              <div>{selected.date}</div>
              {selected.views != null && <div>조회 {selected.views.toLocaleString()}</div>}
            </div>
          </div>
          <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line" style={{ wordBreak: "keep-all" }}>{selected.body}</p>
        </article>
      </div>

      {/* 하단 고정: 본문과 동일 배경, 구분선으로만 분리 */}
      <div className="flex-shrink-0">
        <div className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4">
          <div className="border-t border-border py-4">
            <button
              onClick={() => setSelected(null)}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              목록으로
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
