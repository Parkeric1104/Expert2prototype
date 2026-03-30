import { MessageSquarePlus, History, FileStack } from "lucide-react";

interface TopHeaderProps {
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onOpenPolicyUpload?: () => void;
  onLogoClick?: () => void;
  pendingPoliciesCount?: number;
}

export function TopHeader({ 
  onNewChat, 
  onOpenHistory, 
  onOpenPolicyUpload, 
  onLogoClick,
  pendingPoliciesCount = 0
}: TopHeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="h-16 flex items-center justify-between px-10">
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

        {/* Navigation Menu */}
        <nav className="flex items-center gap-6">
          <button
            onClick={onNewChat}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <MessageSquarePlus className="w-4 h-4" />
            <span className="text-sm">새 채팅</span>
          </button>
          <button 
            onClick={onOpenHistory}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <History className="w-4 h-4" />
            <span className="text-sm">히스토리</span>
          </button>
          <button 
            onClick={onOpenPolicyUpload}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors relative"
          >
            <FileStack className="w-4 h-4" />
            <span className="text-sm">정책 관리</span>
            {pendingPoliciesCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                {pendingPoliciesCount > 99 ? '99+' : pendingPoliciesCount}
              </span>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}