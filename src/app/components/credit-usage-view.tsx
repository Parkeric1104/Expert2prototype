import { Menu, Undo2, RefreshCw, Info, Coins } from "lucide-react";
import { toast } from "sonner";
import {
  Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/app/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  ResponsiveContainer, Cell, Tooltip,
} from "recharts";

// 크레딧 사용현황 — 전체화면(페이지 전환). 사이드패널 '크레딧 사용현황' 진입점 → 페이지 전환.
// 구성: 헤더(아이콘·타이틀·부제 + 새로고침·추가 크레딧 구매) / 기본·추가 크레딧 카드 2단 / 최근 사용현황(월별 그래프).
// 값은 데모 더미(실서비스는 정산 API 주입). Figma 사용현황 페이지 디자인 반영.

const nf = (n: number) => n.toLocaleString("ko-KR");

// 기본/추가 크레딧
const OWNED = 4_233_082;   // 기본 크레딧 잔여
const BASE = 6_600_000;    // 기본 제공 총량
const EXTRA = 0;           // 추가 크레딧 잔여
const RENEW_AT = "2026-12-31 00:00 갱신 예정";

// 최근 사용현황(월별) — 그래프 (최근 12개월, 당월 = 12월)
const MONTHLY = [
  { label: "1월", value: 140_000 },
  { label: "2월", value: 165_000 },
  { label: "3월", value: 120_000 },
  { label: "4월", value: 185_000 },
  { label: "5월", value: 210_000 },
  { label: "6월", value: 225_000 },
  { label: "7월", value: 150_000 },
  { label: "8월", value: 235_000 },
  { label: "9월", value: 175_000 },
  { label: "10월", value: 245_000 },
  { label: "11월", value: 200_000 },
  { label: "12월", value: 416_183, current: true },
];
const CURRENT = MONTHLY.find((m) => m.current) ?? MONTHLY[MONTHLY.length - 1];
const AVG = 205_802;        // 평균 크레딧 사용량
const CURRENT_SHARE = 8;    // 당월 사용 비중(%) — 당월 사용 / 총 크레딧

export function CreditUsageView({ onBack }: { onBack: () => void }) {
  const usedPct = Math.min(100, Math.round((OWNED / BASE) * 100));

  return (
    <TooltipProvider delayDuration={100}>
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 상단 바: 메뉴 · 메인으로 돌아가기 */}
      <header className="flex-shrink-0 bg-card border-b border-border">
        <div className="h-14 flex items-center justify-between px-6">
          <button
            aria-label="메뉴"
            className="w-9 h-9 -ml-2 flex items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Undo2 className="w-4 h-4" />
            메인으로 돌아가기
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-[1120px] mx-auto px-6 max-sm:px-4 py-8" style={{ wordBreak: "keep-all" }}>
          {/* 헤더: 아이콘 + 타이틀/부제 + 액션(새로고침·추가 크레딧 구매) */}
          <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-white flex-shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">크레딧 사용현황</h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  보유 크레딧과 월별 사용량을 확인하고, 크레딧을 추가로 구매할 수 있습니다.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => toast.success("크레딧 사용현황을 새로고침했습니다.")}
                className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                새로고침
              </button>
              <button
                onClick={() => toast.info("추가 크레딧 구매는 결제 연동 후 제공될 예정입니다.")}
                className="h-9 px-4 inline-flex items-center rounded-lg bg-primary text-white text-sm font-semibold hover:opacity-95 transition-opacity"
              >
                추가 크레딧 구매
              </button>
            </div>
          </div>

          {/* 기본 · 추가 크레딧 카드 2단 (기본이 더 넓게) */}
          <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-4 mb-4">
            {/* 기본 크레딧 */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>기본 크레딧</span>
                  <UITooltip>
                    <TooltipTrigger asChild>
                      <button type="button" aria-label="기본 크레딧 설명" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-[260px]" style={{ wordBreak: "keep-all" }}>
                      사용중인 요금제의 기본 제공 크레딧 중 아직 사용하지 않은 크레딧 수입니다.
                    </TooltipContent>
                  </UITooltip>
                </div>
                <span className="text-xs text-muted-foreground">{RENEW_AT}</span>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground tabular-nums">{nf(OWNED)}</span>
                <span className="text-sm text-muted-foreground tabular-nums">/{nf(BASE)}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: `${usedPct}%` }} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                · 매달 기본 제공되는 크레딧은 갱신일까지 사용할 수 있으며, 미사용분은 소멸됩니다.
              </p>
            </div>

            {/* 추가 크레딧 */}
            <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <span>추가 크레딧</span>
                <UITooltip>
                  <TooltipTrigger asChild>
                    <button type="button" aria-label="추가 크레딧 설명" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                      <Info className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[260px]" style={{ wordBreak: "keep-all" }}>
                    기본 제공 크레딧 외에 추가로 구매한 크레딧 중 아직 사용하지 않은 크레딧 수입니다.
                  </TooltipContent>
                </UITooltip>
              </div>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground tabular-nums">{nf(EXTRA)}</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full bg-primary" style={{ width: "0%" }} />
              </div>
              <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                · 추가 구매한 미사용 크레딧은 이월 가능합니다.
              </p>
            </div>
          </div>

          {/* 최근 내 크레딧 사용현황 (전체 폭) */}
          <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
            <div className="flex items-center gap-1 text-sm font-semibold text-foreground mb-4">
              <span>최근 내 크레딧 사용현황</span>
              <UITooltip>
                <TooltipTrigger asChild>
                  <button type="button" aria-label="사용현황 설명" className="inline-flex items-center text-muted-foreground hover:text-foreground">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="max-w-[260px]" style={{ wordBreak: "keep-all" }}>
                  총 크레딧 대비 당월 내가 사용한 크레딧 사용량에 대한 현황입니다.
                </TooltipContent>
              </UITooltip>
            </div>

            {/* 요약 지표: 당월 사용량 · 평균 사용량 */}
            <div className="flex flex-wrap gap-x-10 gap-y-3 mb-5">
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{CURRENT.label} 사용량</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">
                  {nf(CURRENT.value)}
                  <span className="ml-1 text-sm font-medium text-muted-foreground">({CURRENT_SHARE}%)</span>
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">평균 크레딧 사용량</p>
                <p className="text-2xl font-bold text-foreground tabular-nums">{nf(AVG)}</p>
              </div>
            </div>

            {/* 막대 그래프 (12개월 · 당월 강조 · 평균선) */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fontWeight: 500, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis hide domain={[0, "dataMax"]} />
                  <Tooltip
                    cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                    formatter={(v: number) => [`${nf(v)} 크레딧`, "사용량"]}
                    contentStyle={{
                      borderRadius: 10,
                      border: "1px solid var(--border)",
                      background: "var(--card)",
                      color: "var(--foreground)",
                      fontSize: 12,
                      boxShadow: "0 8px 24px rgba(20,30,45,.12)",
                    }}
                    labelStyle={{ color: "var(--muted-foreground)", fontWeight: 600 }}
                  />
                  <ReferenceLine
                    y={AVG}
                    stroke="var(--primary)"
                    strokeDasharray="4 4"
                    strokeOpacity={0.6}
                    label={{ value: "평균선", position: "insideTopLeft", fontSize: 11, fill: "var(--primary)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {MONTHLY.map((m, i) => (
                      <Cell key={i} fill="var(--primary)" fillOpacity={m.current ? 1 : 0.3} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
