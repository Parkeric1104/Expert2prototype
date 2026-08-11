import { Bell, X, ChevronRight } from "lucide-react";
import { getNotices, type Notice } from "@/app/data/service-content";

// 메인화면 우하단 공지사항 팝업(바로보기). 최신 공지 노출 → 클릭 시 공지 페이지 이동.
// ⚠ 1차 버전(형태 추후 수정). 콘텐츠는 service-content(추후 백오피스).
export function NoticePopup({ onOpen, onClose }: { onOpen: () => void; onClose: () => void }) {
  const latest = getNotices()[0];
  if (!latest) return null;

  const badge = (type: Notice["type"]) =>
    type === "릴리즈노트" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground";

  return (
    <div className="fixed bottom-20 right-6 z-40 w-[300px] max-sm:right-4 max-sm:w-[calc(100vw-2rem)]">
      <div className="bg-card border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 pt-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Bell className="w-3.5 h-3.5" />
            공지사항
          </span>
          <button onClick={onClose} aria-label="공지 팝업 닫기" className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <button onClick={onOpen} className="w-full text-left px-4 pt-2 pb-3.5">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${badge(latest.type)}`}>{latest.type}</span>
            {latest.important && <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600">중요</span>}
            <span className="ml-auto text-[11px] text-muted-foreground">{latest.date}</span>
          </div>
          <p className="text-sm font-medium text-foreground line-clamp-2" style={{ wordBreak: "keep-all" }}>{latest.title}</p>
          <span className="mt-2 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary">
            바로보기
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>
    </div>
  );
}
