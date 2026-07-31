import { useState } from "react";
import { LayoutGrid, Search, Calculator, FileSearch, Scale, Bell, Zap, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";

// 메인화면 우하단 '펑션 버튼' — 클릭 시 위로 열리는 기능 메뉴.
// 크레딧(AI balance)은 항상 노출하지 않고, 해당 항목에 '마우스오버'할 때만 플라이아웃으로 표시.
// (레퍼런스: Figma Actions 메뉴 + AI balance 호버 플라이아웃)

interface FunctionItem {
  key: string;
  label: string;
  desc: string;
  Icon: React.ComponentType<{ className?: string }>;
}

// TODO(기능 확정): 실제 제공할 기능 목록으로 교체. 현재는 데모용 예시.
const FUNCTIONS: FunctionItem[] = [
  { key: "calculator", label: "노무 계산기", desc: "퇴직금·연차수당·가산수당", Icon: Calculator },
  { key: "doc-review", label: "문서 진단", desc: "근로계약서·취업규칙 검토", Icon: FileSearch },
  { key: "law-search", label: "법령·판례 검색", desc: "근거 자료 바로 찾기", Icon: Scale },
  { key: "law-alert", label: "법령 개정 알림", desc: "관심 분야 변경 알림", Icon: Bell },
];

export function FunctionMenu() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  // 실제로는 API에서 가져올 데이터
  const creditData = { remaining: 847, total: 1000, resetDate: "2026.04.30" };
  const remainPct = (creditData.remaining / creditData.total) * 100;

  const filtered = FUNCTIONS.filter(
    (f) => f.label.includes(query) || f.desc.includes(query)
  );

  const handleSelect = (item: FunctionItem) => {
    setOpen(false);
    setQuery("");
    // TODO: 각 기능 화면으로 연결. 현재는 준비중 안내.
    toast(`${item.label} — 준비 중입니다.`);
  };

  return (
    <Popover
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setQuery("");
      }}
    >
      <PopoverTrigger
        className="w-10 h-10 bg-card hover:bg-muted border border-border rounded-xl shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center group"
        title="기능"
        aria-label="기능 메뉴 열기"
      >
        <LayoutGrid className="w-[18px] h-[18px] text-muted-foreground group-hover:text-primary transition-colors" />
      </PopoverTrigger>

      <PopoverContent
        side="top"
        align="end"
        sideOffset={8}
        className="w-64 p-1.5 border border-border shadow-xl rounded-xl bg-popover"
      >
        {/* 검색 (Actions 스타일) */}
        <div className="flex items-center gap-2 px-2.5 py-2 mb-1 rounded-lg bg-muted/60">
          <Search className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="기능 검색..."
            className="flex-1 min-w-0 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* 기능 목록 */}
        <div className="py-0.5">
          {filtered.length > 0 ? (
            filtered.map((item) => (
              <button
                key={item.key}
                onClick={() => handleSelect(item)}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors text-left group/item"
              >
                <item.Icon className="w-4 h-4 text-muted-foreground group-hover/item:text-primary transition-colors flex-shrink-0" />
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground truncate">{item.label}</span>
                  <span className="block text-xs text-muted-foreground truncate">{item.desc}</span>
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
              </button>
            ))
          ) : (
            <p className="px-2.5 py-4 text-center text-xs text-muted-foreground">검색 결과가 없습니다.</p>
          )}
        </div>

        {/* 구분선 */}
        <div className="my-1 h-px bg-border" />

        {/* AI balance — 마우스오버 시에만 크레딧 플라이아웃 노출 */}
        <div className="relative group/ai">
          <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors text-left">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span className="flex-1 text-sm font-medium text-foreground">AI balance</span>
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 flex-shrink-0" />
          </button>

          {/* 호버 플라이아웃 (메뉴 왼쪽으로 펼침 — 우하단 위치 대응) */}
          <div className="invisible opacity-0 group-hover/ai:visible group-hover/ai:opacity-100 transition-opacity duration-150 absolute bottom-0 right-full mr-2 w-64 p-4 rounded-xl border border-border bg-popover shadow-xl z-10">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-foreground">
                {creditData.remaining.toLocaleString()} credits left
              </h3>
              <span className="text-xs text-muted-foreground">
                {creditData.total.toLocaleString()} / mo
              </span>
            </div>
            <div className="relative h-1.5 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${remainPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
              더존 AI 연구소 Full seat은 매월 {creditData.total.toLocaleString()} 크레딧을 제공합니다.
              크레딧은 {creditData.resetDate}에 초기화됩니다.
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
