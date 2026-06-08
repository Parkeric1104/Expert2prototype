import { Menu, BookOpen, ChevronLeft } from "lucide-react";
import logoIcon from "@/imports/image-1.png";

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
        <div className="h-14 flex items-center gap-3 px-5">
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
      </header>
    );
  }

  // [1-1] 메인/홈 화면 GNB: ☰ + 로고 (좌측), 사용자 매뉴얼 (우측)
  return (
    <header className="bg-card border-b border-border">
      <div className="h-14 flex items-center justify-between px-5">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={onLogoClick}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <img
              src={logoIcon}
              alt="노무도우미 로고"
              className="w-8 h-8 object-contain"
            />
            <span className="text-base font-bold text-primary">노무도우미</span>
          </button>
        </div>

        <nav className="flex items-center gap-5">
          <button
            onClick={() => console.log("사용자 매뉴얼 열기")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            사용자 매뉴얼
          </button>
        </nav>
      </div>
    </header>
  );
}
