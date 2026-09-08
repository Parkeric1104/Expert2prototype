import { ArrowLeft, RefreshCw, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import {
  Tooltip as UITooltip, TooltipTrigger, TooltipContent, TooltipProvider,
} from "@/app/components/ui/tooltip";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine,
  ResponsiveContainer, Cell, Tooltip,
} from "recharts";

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
  { label: "4월", value: 48_500 },
  { label: "5월", value: 55_200 },
  { label: "6월", value: 61_800 },
  { label: "7월", value: 51_200 },
  { label: "8월", value: 53_800 },
  { label: "9월", value: 4_313, current: true },
];
const CURRENT = MONTHLY.find((m) => m.current) ?? MONTHLY[MONTHLY.length - 1];
const AVG = Math.round(MONTHLY.reduce((s, m) => s + m.value, 0) / MONTHLY.length); // 평균 크레딧 사용량
const CURRENT_SHARE = 0.1;          // 당월 사용 비중(%) — 당월 사용 / 총 크레딧
const kfmt = (v: number) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`);

export function CreditUsageView({ onBack }: { onBack: () => void }) {
  const usedPct = Math.min(100, Math.round((OWNED / BASE) * 100));

  return (
    <TooltipProvider delayDuration={100}>
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
        <div className="w-full max-w-[1000px] mx-auto px-6 max-sm:px-4 py-8" style={{ wordBreak: "keep-all" }}>
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

          {/* 가로 2단: (좌) 크레딧 정보 · (우) 사용현황 그래프 */}
          <div className="grid lg:grid-cols-2 gap-4 items-stretch">
          {/* 기본 + 추가 크레딧 카드 */}
          <div className="h-full rounded-2xl border border-border bg-card shadow-sm p-5 space-y-6">
            {/* 기본 크레딧 (기본 제공량 중 잔여) */}
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
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
                  <span className="px-1.5 py-0.5 rounded bg-muted text-foreground/70 mr-1">기본 제공량</span>
                  {nf(BASE)}
                </span>
              </div>
            </div>

            {/* 추가 크레딧 */}
            <div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
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
          <div className="h-full rounded-2xl border border-border bg-card shadow-sm p-5">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground">최근 내 크레딧 사용현황</h2>
            </div>
            <div className="flex items-baseline justify-between mb-4">
              <span className="text-lg font-bold text-primary">{CURRENT.label}</span>
              <span className="text-sm text-foreground">
                <span className="text-lg font-bold text-primary tabular-nums">{nf(CURRENT.value)}</span>
                <span className="text-muted-foreground"> 크레딧 ({CURRENT_SHARE}%)</span>
              </span>
            </div>

            {/* 막대 그래프 (recharts · 토스 스타일: 둥근 막대 + 가로 그리드 + 축, 평균선 유지) */}
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MONTHLY} margin={{ top: 16, right: 8, left: -12, bottom: 0 }} barCategoryGap="32%">
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tick={{ fontSize: 11, fontWeight: 500, fill: "var(--muted-foreground)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    width={44}
                    tick={{ fontSize: 11, fontWeight: 500, fill: "var(--muted-foreground)" }}
                    tickFormatter={kfmt}
                  />
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
                    strokeOpacity={0.55}
                    label={{ value: `평균 ${nf(AVG)}`, position: "insideTopRight", fontSize: 11, fill: "var(--primary)" }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={40}>
                    {MONTHLY.map((m, i) => (
                      <Cell key={i} fill="var(--primary)" fillOpacity={m.current ? 1 : 0.35} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 text-right text-xs text-muted-foreground">
              ··· 평균 크레딧 사용량 : <span className="tabular-nums">{nf(AVG)}</span> 크레딧
            </div>
            <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
              * 총 크레딧 대비 당월 내가 사용한 크레딧 사용량에 대한 현황입니다.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
    </TooltipProvider>
  );
}
