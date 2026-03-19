import { MessageSquarePlus, History, FileStack } from "lucide-react";
import logoIcon from "@/assets/ba68b3d133c0b0eab30536be7e6ef8ec6cdf174e.png";

interface TopHeaderProps {
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  onOpenPolicyUpload?: () => void;
  onLogoClick?: () => void;
}

export function TopHeader({ onNewChat, onOpenHistory, onOpenPolicyUpload, onLogoClick }: TopHeaderProps) {
  return (
    <header className="bg-card border-b border-border">
      <div className="h-16 flex items-center justify-between px-10">
        {/* Logo */}
        <button 
          onClick={onLogoClick}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <img 
            src={logoIcon} 
            alt="노무도우미 로고" 
            className="w-10 h-10 object-contain"
          />
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
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <FileStack className="w-4 h-4" />
            <span className="text-sm">정책 관리</span>
          </button>
        </nav>
      </div>
    </header>
  );
}