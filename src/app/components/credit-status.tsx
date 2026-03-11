import { useState } from "react";
import { CreditCard } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";

export function CreditStatus() {
  const [isOpen, setIsOpen] = useState(false);
  
  // 실제로는 API에서 가져올 데이터
  const creditData = {
    remaining: 847,
    total: 1000,
    usedToday: 23,
    usedThisMonth: 153,
    expiryDate: "2026.04.30",
  };

  const usagePercentage = ((creditData.total - creditData.remaining) / creditData.total) * 100;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger
        className="w-9 h-9 bg-muted/80 hover:bg-muted border border-border rounded-lg shadow-sm hover:shadow transition-all duration-200 flex items-center justify-center group"
        onClick={() => setIsOpen(!isOpen)}
        title="크레딧 현황"
      >
        <CreditCard className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-72 p-0 ml-4 mb-2 border border-border shadow-xl rounded-xl overflow-hidden"
        side="top"
        align="start"
        sideOffset={8}
      >
        {/* 헤더 */}
        <div className="bg-card p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">{creditData.remaining.toLocaleString()} credits left</h3>
            <span className="text-xs text-muted-foreground">{creditData.total.toLocaleString()} credits/mo</span>
          </div>
          
          {/* 프로그레스 바 */}
          <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${100 - usagePercentage}%` }}
            />
          </div>
        </div>

        {/* 상세 정보 */}
        <div className="bg-card p-4 space-y-3">
          {/* 사용량 정보 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">오늘 사용</span>
              <span className="text-xs font-semibold text-foreground">{creditData.usedToday.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">이번 달 사용</span>
              <span className="text-xs font-semibold text-foreground">{creditData.usedThisMonth.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">만료일</span>
              <span className="text-xs font-semibold text-foreground">{creditData.expiryDate}</span>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}