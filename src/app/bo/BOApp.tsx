/**
 * Expert Back-Office (SVC-004) — 운영 콘텐츠 관리 콘솔. URL ?bo 로 진입.
 * 룩앤필: apps in toss 콘솔 (BO_DESIGN_REFERENCE.md) — 좌측 사이드바 + 옅은 회색 바탕 흰 카드.
 * 로그인 필수(ACC-001), 계정관리는 관리자 권한만 노출(ACC-002).
 */
import { useState } from "react";
import { Megaphone, MessageSquareWarning, Tag, ExternalLink, Users, LogOut } from "lucide-react";
import { Toaster } from "@/app/components/ui/sonner";
import { BOAccount, currentAccount, logout } from "@/app/bo/bo-store";
import { BOLogin, BOPasswordChange } from "@/app/bo/bo-login";
import { NoticeAdmin } from "@/app/bo/notice-admin";
import { PopupAdmin } from "@/app/bo/popup-admin";
import { VersionAdmin } from "@/app/bo/version-admin";
import { AccountAdmin } from "@/app/bo/account-admin";

type Section = "notice" | "popup" | "version" | "account";

const CONTENT_NAV: { key: Section; label: string; Icon: typeof Megaphone; iconColor: string }[] = [
  { key: "notice", label: "공지사항", Icon: Megaphone, iconColor: "text-primary" },
  { key: "popup", label: "공지팝업", Icon: MessageSquareWarning, iconColor: "text-amber-500" },
  { key: "version", label: "버전정보", Icon: Tag, iconColor: "text-violet-500" },
];

export function BOApp() {
  const [account, setAccount] = useState<BOAccount | null>(() => currentAccount());
  const [section, setSection] = useState<Section>("notice");

  // 로그인 게이트 (ACC-001)
  if (!account) {
    return (
      <>
        <BOLogin onLogin={(a) => { setAccount(a); setSection("notice"); }} />
        <Toaster position="bottom-center" />
      </>
    );
  }

  // 초기 비밀번호(0000) 상태면 변경 강제 (ACC-006)
  if (account.mustChangePassword) {
    return (
      <>
        <BOPasswordChange account={account} onDone={(u) => setAccount(u)} onCancel={() => setAccount(null)} />
        <Toaster position="bottom-center" />
      </>
    );
  }

  const navItem = (key: Section, label: string, Icon: typeof Megaphone, iconColor: string) => (
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
  );

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
          {CONTENT_NAV.map(({ key, label, Icon, iconColor }) => navItem(key, label, Icon, iconColor))}
          {account.role === "admin" && (
            <>
              <p className="px-2 pt-4 pb-1.5 text-[11px] font-medium text-muted-foreground/70">관리</p>
              {navItem("account", "계정관리", Users, "text-emerald-500")}
            </>
          )}
        </nav>

        {/* 하단: 로그인 계정 + 로그아웃 + 서비스 화면 열기 */}
        <div className="px-3 pb-4 space-y-1">
          <div className="px-2.5 py-2 rounded-lg bg-gray-50 flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{account.name}</p>
              <p className="text-[11px] text-muted-foreground">{account.role === "admin" ? "관리자" : "운영자"}</p>
            </div>
            <button
              onClick={() => { logout(); setAccount(null); }}
              title="로그아웃"
              className="flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-gray-200 hover:text-foreground transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* BO 전용 포트(VITE_BO)에서는 ?service — 같은 origin이라 저장값(무배포 반영)이 공유됨 */}
          <a
            href={import.meta.env.VITE_BO === "1" ? `${window.location.pathname}?service` : window.location.pathname}
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
          {section === "account" && account.role === "admin" && <AccountAdmin me={account} />}
        </div>
      </main>

      <Toaster position="bottom-center" />
    </div>
  );
}
