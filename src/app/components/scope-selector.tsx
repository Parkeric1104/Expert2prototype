import { Globe, ChevronDown } from "lucide-react";

interface ScopeSelectorProps {
  selectedScopes: string[];
  onClick: () => void;
}

export function ScopeSelector({ selectedScopes, onClick }: ScopeSelectorProps) {
  const displayText = selectedScopes.length === 0 
    ? "🌐 전체 법령 검색 (기본값)"
    : `✅ ${selectedScopes.length}개 법령 선택됨`;

  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary text-primary hover:bg-primary/10 transition-colors"
    >
      <span className="text-sm font-medium">{displayText}</span>
      <ChevronDown className="w-4 h-4" />
    </button>
  );
}
