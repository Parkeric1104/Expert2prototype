import { Menu, BookOpen, ChevronLeft } from "lucide-react";

// 사용자 매뉴얼(Figma 덱) — 메인 화면 GNB에서 새 탭으로 오픈
const USER_MANUAL_URL = "https://www.figma.com/deck/1ZXPBZL2hOhbLcfZiKLBH6";

interface TopHeaderProps {
  variant?: "home" | "chat" | "policy";
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onOpenPolicyUpload?: () => void;
  onLogoClick?: () => void;
  onToggleSidebar?: () => void;
  onNavigateToMain?: () => void;
  pendingPoliciesCount?: number;
  isSidebarOpen?: boolean;
}

export function TopHeader({
  variant = "home",
  onNewChat,
  onOpenHistory,
  onOpenPolicyUpload,
  onLogoClick,
  onToggleSidebar,
  onNavigateToMain,
  pendingPoliciesCount = 0,
  isSidebarOpen = false,
}: TopHeaderProps) {
  // [1] 정책관리 화면 GNB: ← 메인으로 돌아가기
  if (variant === "policy") {
    return (
      <header className="bg-card border-b border-border">
        <div className="h-14 flex items-center px-6">
          <button
            onClick={onLogoClick ?? onNavigateToMain}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            메인으로 돌아가기
          </button>
        </div>
      </header>
    );
  }

  // [1-2] 채팅 화면 GNB: ☰ + 메인으로 돌아가기 (좌측), 우측 없음
  if (variant === "chat") {
    return (
      <header className="bg-card border-b border-border">
        <div className="h-14 flex items-center justify-between gap-3 px-5">
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="채팅 이력 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button
              onClick={onNavigateToMain}
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              메인으로 돌아가기
            </button>
          </div>

        </div>
      </header>
    );
  }

  // [1-1] 메인/홈 화면 GNB: ☰ (좌측), 사용자 매뉴얼 (우측) — 배경과 이어지도록 보더 없음
  return (
    <header className="bg-white">
      <div className="h-14 flex items-center justify-between px-5">
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>

        <nav className="flex items-center gap-5">
          <button
            onClick={() => window.open(USER_MANUAL_URL, "_blank", "noopener,noreferrer")}
            className="flex items-center gap-1.5 text-sm text-foreground/80 hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            사용자 매뉴얼
          </button>
        </nav>
      </div>
    </header>
  );
}
