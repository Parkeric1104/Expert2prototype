import { Search } from "lucide-react";

interface RefinementBoxProps {
  onRefine: () => void;
}

export function RefinementBox({ onRefine }: RefinementBoxProps) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
      <span className="text-sm text-muted-foreground">
        결과가 충분하지 않나요?
      </span>
      <button
        onClick={onRefine}
        className="flex items-center gap-2 px-4 py-2 bg-card border border-primary rounded-lg text-primary hover:bg-primary/5 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="text-xs font-medium">특정 법령으로 다시 검색하기</span>
      </button>
    </div>
  );
}
