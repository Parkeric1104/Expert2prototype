/**
 * Expert Back-Office (SVC-004) — 운영 콘텐츠 관리 콘솔. URL ?bo 로 진입.
 * 룩앤필: apps in toss 콘솔 (BO_DESIGN_REFERENCE.md) — 좌측 사이드바 + 옅은 회색 바탕 흰 카드.
 */
import { useState } from "react";
import { Megaphone, MessageSquareWarning, Tag, ExternalLink } from "lucide-react";
import { Toaster } from "@/app/components/ui/sonner";
import { NoticeAdmin } from "@/app/bo/notice-admin";
import { PopupAdmin } from "@/app/bo/popup-admin";
import { VersionAdmin } from "@/app/bo/version-admin";

type Section = "notice" | "popup" | "version";

const NAV: { key: Section; label: string; Icon: typeof Megaphone; iconColor: string }[] = [
  { key: "notice", label: "공지사항", Icon: Megaphone, iconColor: "text-primary" },
  { key: "popup", label: "공지팝업", Icon: MessageSquareWarning, iconColor: "text-amber-500" },
  { key: "version", label: "버전정보", Icon: Tag, iconColor: "text-violet-500" },
];

export function BOApp() {
  const [section, setSection] = useState<Section>("notice");

  return (
    <div className="h-screen flex bg-[#F4F6F8] text-foreground">
      {/* 좌측 사이드바 */}
      <aside className="w-[232px] flex-shrink-0 bg-white border-r border-black/[0.06] flex flex-col">
        <div className="px-5 pt-5 pb-3">
          <p className="text-[15px] font-extrabold tracking-tight text-foreground/80">
            Expert <span className="text-primary">BO</span>
          </p>
        </div>

        {/* 워크스페이스 카드 */}
        <div className="px-3 pb-4">
          <div className="px-3 py-2.5 rounded-xl bg-gray-50 border border-black/[0.04]">
            <p className="text-sm font-bold text-foreground">세법노무도우미</p>
            <p className="text-xs text-muted-foreground mt-0.5">Admin</p>
          </div>
        </div>

        {/* 내비게이션 */}
        <nav className="flex-1 px-3 space-y-0.5">
          <p className="px-2 pb-1.5 text-[11px] font-medium text-muted-foreground/70">콘텐츠</p>
          {NAV.map(({ key, label, Icon, iconColor }) => (
            <button
              key={key}
              onClick={() => setSection(key)}
              className={`w-full flex items-center gap-2.5 px-2.5 h-10 rounded-lg text-sm transition-colors ${
                section === key ? "bg-gray-100 font-semibold text-foreground" : "text-foreground/70 hover:bg-gray-50 hover:text-foreground"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${iconColor}`} />
              {label}
            </button>
          ))}
        </nav>

        {/* 하단: 서비스 화면 열기 */}
        <div className="px-3 pb-4">
          <a
            href={window.location.pathname}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center gap-2.5 px-2.5 h-10 rounded-lg text-sm text-foreground/70 hover:bg-gray-50 hover:text-foreground transition-colors"
          >
            <ExternalLink className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
            서비스 화면 열기
          </a>
        </div>
      </aside>

      {/* 콘텐츠 영역 */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="max-w-[1080px] mx-auto px-8 py-8">
          {section === "notice" && <NoticeAdmin />}
          {section === "popup" && <PopupAdmin />}
          {section === "version" && <VersionAdmin />}
        </div>
      </main>

      <Toaster position="bottom-center" />
    </div>
  );
}
