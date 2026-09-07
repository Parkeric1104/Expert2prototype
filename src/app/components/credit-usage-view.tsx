import { ArrowLeft, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";

// 크레딧 사용현황 — 전체화면(페이지 전환). 사이드패널 '크레딧 사용현황' 진입점 → 페이지 전환.
// 제품팀 요구 필수 구성: 보유 크레딧 / 추가 크레딧 / 추가 크레딧 구매 / 최근 내 크레딧 사용현황(그래프).
// 값은 데모 더미(실서비스는 정산 API 주입).

const nf = (n: number) => n.toLocaleString("ko-KR");

// 보유/추가 크레딧
const OWNED = 4_233_082;   // 보유(기본) 잔여
const BASE = 6_600_000;    // 기본 제공 총량
const EXTRA = 0;           // 추가 크레딧 잔여
const EXTRA_TOTAL = 6_000_000;

// 최근 사용현황(월별) — 그래프
const MONTHLY = [
  { label: "7월", value: 51_200 },
  { label: "8월", value: 53_800 },
  { label: "9월", value: 4_313, current: true },
];
const AVG = 52_039;                 // 평균 크레딧 사용량
const CURRENT_SHARE = 0.1;          // 당월 사용 비중(%) — 9월 4,313 / 총 크레딧

export function CreditUsageView({ onBack }: { onBack: () => void }) {
  const chartMax = Math.max(...MONTHLY.map((m) => m.value), AVG) * 1.1;
  const usedPct = Math.min(100, Math.round((OWNED / BASE) * 100));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 상단: 메인으로 돌아가기 */}
      <header className="flex-shrink-0 bg-card border-b border-border">
        <div className="h-14 flex items-center px-6">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            메인으로 돌아가기
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-[560px] mx-auto px-6 max-sm:px-4 py-8" style={{ wordBreak: "keep-all" }}>
          {/* 타이틀 */}
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-xl font-bold text-foreground">크레딧 사용현황</h1>
            <button
              onClick={() => toast.success("크레딧 사용현황을 새로고침했습니다.")}
              aria-label="새로고침"
              className="w-7 h-7 flex items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* 보유 + 추가 크레딧 카드 */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-5 space-y-6">
            {/* 보유 크레딧 */}
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <span>보유 크레딧</span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground tabular-nums">{nf(OWNED)}</span>
                <span className="text-sm text-muted-foreground">크레딧</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">2026-10-01 00:00 갱신 예정</p>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
              </div>
              <div className="mt-1.5 flex justify-end">
                <span className="text-xs text-muted-foreground">
                  <span className="px-1.5 py-0.5 rounded bg-muted text-foreground/70 mr-1">기본</span>
                  {nf(BASE)}
                </span>
              </div>
            </div>

            {/* 추가 크레딧 */}
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                <span>추가 크레딧</span>
                <Info className="w-3.5 h-3.5" />
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-3xl font-bold text-foreground tabular-nums">{nf(EXTRA)}</span>
                <span className="text-sm text-muted-foreground">크레딧</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${Math.round((EXTRA / EXTRA_TOTAL) * 100)}%` }} />
              </div>
              <div className="mt-1.5 flex justify-end">
                <span className="text-xs text-muted-foreground tabular-nums">{nf(EXTRA_TOTAL)}</span>
              </div>
            </div>

            {/* 안내 문구 */}
            <ul className="space-y-1 text-xs text-muted-foreground leading-relaxed">
              <li>* 매달 기본 제공되는 크레딧은 갱신일까지 사용할 수 있으며, 미사용분은 소멸됩니다.</li>
              <li>* 추가 구매한 미사용 크레딧은 이월 가능합니다.</li>
            </ul>

            {/* 추가 크레딧 구매 */}
            <Button
              onClick={() => toast.info("추가 크레딧 구매는 결제 연동 후 제공될 예정입니다.")}
              className="w-full h-11 rounded-xl text-white font-semibold hover:opacity-95"
              style={{ background: "linear-gradient(135deg, #5784FF 0%, #8B5CF6 100%)" }}
            >
              추가 크레딧 구매
            </Button>
          </div>

          {/* 최근 내 크레딧 사용현황 */}
          <div className="mt-4 rounded-2xl border border-border bg-card shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">최근 내 크레딧 사용현황</h2>
            </div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-lg font-bold text-primary">9월</span>
              <span className="text-sm text-foreground">
                <span className="text-lg font-bold text-primary tabular-nums">{nf(4_313)}</span>
                <span className="text-muted-foreground"> 크레딧 ({CURRENT_SHARE}%)</span>
              </span>
            </div>

            {/* 막대 그래프 (평균선 유지) */}
            <div className="relative h-44 flex items-end justify-around gap-6 px-2 border-b border-border">
              {/* 평균선 */}
              <div
                className="absolute left-0 right-0 border-t border-dashed border-primary/50"
                style={{ bottom: `${(AVG / chartMax) * 100}%` }}
              >
                <span className="absolute -top-4 right-0 text-[11px] text-primary/70 tabular-nums">
                  평균 {nf(AVG)}
                </span>
              </div>
              {MONTHLY.map((m) => (
                <div key={m.label} className="flex-1 max-w-[64px] flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[11px] text-muted-foreground tabular-nums">{nf(m.value)}</span>
                  <div
                    className={`w-full rounded-t-lg ${m.current ? "bg-primary" : "bg-primary/40"}`}
                    style={{ height: `${Math.max(2, (m.value / chartMax) * 100)}%` }}
                  />
                </div>
              ))}
            </div>
            {/* x축 라벨 */}
            <div className="flex items-center justify-around gap-6 px-2 mt-2">
              {MONTHLY.map((m) => (
                <span key={m.label} className={`flex-1 max-w-[64px] text-center text-xs ${m.current ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                  {m.label}
                </span>
              ))}
            </div>

            <div className="mt-4 text-right text-xs text-muted-foreground">
              ··· 평균 크레딧 사용량 : <span className="tabular-nums">{nf(AVG)}</span> 크레딧
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              * 총 크레딧 대비 당월 내가 사용한 크레딧 사용량에 대한 현황입니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
