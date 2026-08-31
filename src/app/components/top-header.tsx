import { Undo2, ArrowLeft, ExternalLink, BookOpen } from "lucide-react";

interface TopHeaderProps {
  variant?: "home" | "chat" | "policy";
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onOpenPolicyUpload?: () => void;
  onLogoClick?: () => void;
  onNavigateToMain?: () => void;
  pendingPoliciesCount?: number;
  isTrial?: boolean;
  companyName?: string;
  trialCount?: number;
  trialMax?: number;
  onOpenNtsDirectory?: () => void; // 국세청 조직·직원검색 바로가기(외부 링크)
  onOpenManual?: () => void;       // 사용자 매뉴얼(외부 링크)
}

// 체험판 배지 (체험판 · 회사명 · N/10)
function TrialBadge({ companyName, trialCount = 0, trialMax = 10 }: { companyName?: string; trialCount?: number; trialMax?: number }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold">체험판</span>
      {companyName && <span className="text-muted-foreground">{companyName}</span>}
      <span className="font-semibold text-foreground">{trialCount}/{trialMax}번</span>
    </div>
  );
}

export function TopHeader({
  variant = "home",
  onNewChat,
  onOpenHistory,
  onOpenPolicyUpload,
  onLogoClick,
  onNavigateToMain,
  pendingPoliciesCount = 0,
  isTrial = false,
  companyName,
  trialCount = 0,
  trialMax = 10,
  onOpenNtsDirectory,
  onOpenManual,
}: TopHeaderProps) {
  // GNB 우측 전역 바로가기 버튼 (국세청 전화번호 · 사용자 매뉴얼) — 홈·채팅·정책 GNB 공통 노출
  const QuickLinks = () =>
    onOpenNtsDirectory || onOpenManual ? (
      <>
        {onOpenNtsDirectory && (
          <button
            onClick={onOpenNtsDirectory}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg px-2.5 py-1.5 transition-colors"
            title="국세청 조직·직원검색 (외부 사이트)"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="max-sm:hidden">국세청 전화번호</span>
          </button>
        )}
        {onOpenManual && (
          <button
            onClick={onOpenManual}
            className="flex items-center gap-1.5 text-sm font-medium text-foreground/70 hover:text-foreground hover:bg-muted rounded-lg px-2.5 py-1.5 transition-colors"
            title="사용자 매뉴얼 (외부 사이트)"
          >
            <BookOpen className="w-4 h-4" />
            <span className="max-sm:hidden">사용자 매뉴얼</span>
          </button>
        )}
      </>
    ) : null;
  // [1] 정책관리 화면 GNB: (좌) ← 메인으로 돌아가기 · (우) 전역 바로가기(국세청·매뉴얼)
  if (variant === "policy") {
    return (
      <header className="bg-card border-b border-border">
        <div className="h-14 flex items-center px-6">
          <button
            onClick={onLogoClick ?? onNavigateToMain}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            메인으로 돌아가기
          </button>
          <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
            <QuickLinks />
          </div>
        </div>
      </header>
    );
  }

  // [1-2] 채팅 화면 GNB: (좌) 체험판 배지 · (우) 전역 바로가기(국세청·매뉴얼) + 메인으로 돌아가기
  //  — 사이드패널 토글/워크스페이스 내비게이션은 LNB 전담(햄버거 제거로 경계 명확화)
  if (variant === "chat") {
    return (
      <header className="bg-card border-b border-border">
        <div className="h-14 flex items-center justify-between gap-3 px-5">
          {/* 좌: (체험판 배지) */}
          <div className="flex items-center gap-3 min-w-0">
            {isTrial && <TrialBadge companyName={companyName} trialCount={trialCount} trialMax={trialMax} />}
          </div>

          {/* 우: 전역 바로가기 + 메인으로 돌아가기 */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <QuickLinks />
            {(onOpenNtsDirectory || onOpenManual) && <div className="w-px h-5 bg-border mx-1.5" />}
            <button
              onClick={onNavigateToMain}
              className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-2.5 py-1.5 transition-colors"
            >
              <Undo2 className="w-4 h-4" />
              메인으로 돌아가기
            </button>
          </div>
        </div>
      </header>
    );
  }

  // [1-1] 메인/홈 화면 GNB: (좌) 체험판 배지 · (우) 전역 바로가기(국세청·매뉴얼)
  //  — 좌상단 토글/메뉴는 LNB가 소유(GNB 햄버거 제거)
  return (
    <header className="bg-white">
      <div className="h-14 flex items-center gap-3 pl-6 pr-7">
        {isTrial && <TrialBadge companyName={companyName} trialCount={trialCount} trialMax={trialMax} />}
        <div className="ml-auto flex items-center gap-0.5 flex-shrink-0">
          <QuickLinks />
        </div>
      </div>
    </header>
  );
}
