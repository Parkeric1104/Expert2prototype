import { Menu, BookOpen, ChevronLeft, FileText } from "lucide-react";

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
  showDraftDocument?: boolean; // 채팅 GNB 우측 의견서 작성 버튼 노출
  onDraftDocument?: () => void;
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
  showDraftDocument = false,
  onDraftDocument,
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

          {showDraftDocument && (
            <button
              onClick={onDraftDocument}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: "#3182F6" }}
            >
              <FileText className="w-3.5 h-3.5" />
              의견서 작성
            </button>
          )}
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
            onClick={() => console.log("사용자 매뉴얼 열기")}
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
