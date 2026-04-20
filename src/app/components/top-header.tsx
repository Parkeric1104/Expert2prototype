import { Menu, BookOpen, FileStack } from "lucide-react";

interface TopHeaderProps {
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onOpenPolicyUpload?: () => void;
  onLogoClick?: () => void;
  onToggleSidebar?: () => void;
  pendingPoliciesCount?: number;
  isSidebarOpen?: boolean;
}

export function TopHeader({
  onNewChat,
  onOpenHistory,
  onOpenPolicyUpload,
  onLogoClick,
  onToggleSidebar,
  pendingPoliciesCount = 0,
  isSidebarOpen = false
}: TopHeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="h-16 flex items-center justify-between px-10">
        {/* Left Side: Menu Button + Logo */}
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="메뉴 열기"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo */}
          <button
            onClick={onLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <FileStack className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-lg font-bold text-primary">노무도우미</h1>
          </button>
        </div>

        {/* Right Side: User Manual (사이드바와 중복되지 않는 메뉴만 표시) */}
        <nav className="flex items-center gap-6">
          <button
            onClick={() => {
              // 사용자 매뉴얼 열기 로직
              console.log("사용자 매뉴얼 열기");
            }}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            <span className="text-sm">사용자 매뉴얼</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
