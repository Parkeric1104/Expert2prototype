import { Menu, Undo2 } from "lucide-react";

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
  isTrial?: boolean;
  companyName?: string;
  trialCount?: number;
  trialMax?: number;
}

// 체험판 배지 (체험판 · 회사명 · N/10)
function TrialBadge({ companyName, trialCount = 0, trialMax = 10 }: { companyName?: string; trialCount?: number; trialMax?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">체험판</span>
      {companyName && <span className="text-muted-foreground">· {companyName}</span>}
      <span className="font-semibold text-foreground">{trialCount}/{trialMax}</span>
    </div>
  );
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
  isTrial = false,
  companyName,
  trialCount = 0,
  trialMax = 10,
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
            <Undo2 className="w-4 h-4" />
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
          {/* 좌: 햄버거 */}
          <button
            onClick={onToggleSidebar}
            className="flex items-center justify-center w-9 h-9 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="채팅 이력 열기"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* 우: (체험판 배지) + 메인으로 돌아가기 (디자인 정합: 우측 정렬 + 곡선 화살표) */}
          <div className="flex items-center gap-3">
            {isTrial && <TrialBadge companyName={companyName} trialCount={trialCount} trialMax={trialMax} />}
            <button
              onClick={onNavigateToMain}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </header>
    );
  }

  // [1-1] 메인/홈 화면 GNB: ☰ (좌측)만. 사용자 매뉴얼은 햄버거 메뉴 하단으로 이동(디자인 정합)
  return (
    <header className="bg-white">
      <div className="h-14 flex items-center justify-between pl-6 pr-7">
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-9 h-9 rounded-lg text-foreground/70 hover:text-foreground hover:bg-muted transition-colors"
          aria-label="메뉴 열기"
        >
          <Menu className="w-5 h-5" />
        </button>
        {isTrial && <TrialBadge companyName={companyName} trialCount={trialCount} trialMax={trialMax} />}
      </div>
    </header>
  );
}
