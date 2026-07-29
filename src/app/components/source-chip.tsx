// 답변 하단 '법령 출처' 공용 칩 — 멀티턴·간단·상세 답변에서 동일 형태로 사용.
// 배지(조항/해석례/판례) + 명칭 구조. (디자인 정합)

// 출처 제목에서 조항 배지/법령명 분리 (예: "근로기준법 제17조 (근로조건의 명시)" → 제17조 / 근로기준법)
export function parseSourceChip(title: string, type?: string): { badge: string; name: string } {
  const m = title.match(/^([가-힣·\s]+?)\s*(제\d+조(?:의\d+)?)/);
  if (m) return { badge: m[2], name: m[1].trim() };
  if (type === "해석례") {
    const bare = title.startsWith("#") ? title : `#${title.split(" ")[0].split("(")[0].trim()}`;
    return { badge: "해석례", name: bare };
  }
  if (type === "판례") return { badge: "판례", name: title };
  return { badge: type ?? "법령", name: title };
}

interface SourceChipProps {
  title: string;
  type?: string;
  onClick?: () => void;
}

export function SourceChip({ title, type, onClick }: SourceChipProps) {
  const { badge, name } = parseSourceChip(title, type);
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg bg-card border border-border/60 shadow-sm hover:border-primary/40 transition-colors"
    >
      <span className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-primary text-xs font-bold whitespace-nowrap">
        {badge}
      </span>
      <span className="text-sm text-foreground whitespace-nowrap">{name}</span>
    </button>
  );
}
