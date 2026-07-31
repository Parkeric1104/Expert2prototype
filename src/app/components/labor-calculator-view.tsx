import { useState } from "react";
import { ArrowLeft, Calculator, RotateCcw, Info } from "lucide-react";

// 노무(임금) 계산기 — 단일 컬럼 입력 → [계산하기] → 결과.
// 탭: 시급 / 연봉 / 퇴직금 / 실업급여 / 연차수당 / 가산수당 / 해고예고 / 주휴수당
// ⚠ 참고용 — 회사마다 평균/통상임금 기준이 달라 실제와 차이가 있을 수 있음.

interface LaborCalculatorViewProps {
  onBack: () => void;
}

type Tab = "hourly" | "annual" | "retire" | "unemploy" | "leave" | "extra" | "notice" | "weekly";
const TABS: { key: Tab; label: string }[] = [
  { key: "hourly", label: "시급" },
  { key: "annual", label: "연봉" },
  { key: "retire", label: "퇴직금" },
  { key: "unemploy", label: "실업급여" },
  { key: "leave", label: "연차수당" },
  { key: "extra", label: "가산수당" },
  { key: "notice", label: "해고예고" },
  { key: "weekly", label: "주휴수당" },
];

const MONTHLY_HOURS = 209;
const won = (n: number) => (isFinite(n) && n > 0 ? Math.round(n).toLocaleString() : "0");
const digits = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;
const dayDiff = (a: string, b: string) => (!a || !b ? 0 : Math.max(Math.round((+new Date(b) - +new Date(a)) / 86400000), 0));
const last3mDays = (leave: string) => {
  if (!leave) return 0;
  const end = new Date(leave);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  return Math.max(Math.round((+end - +start) / 86400000), 1);
};

// ── 연봉 실수령: 2024 기준 ──
const NPS_CAP = 6_170_000; // 국민연금 기준소득월액 상한(2024.7~)
const earnedDeduction = (g: number) => {
  let d;
  if (g <= 5_000_000) d = g * 0.7;
  else if (g <= 15_000_000) d = 3_500_000 + (g - 5_000_000) * 0.4;
  else if (g <= 45_000_000) d = 7_500_000 + (g - 15_000_000) * 0.15;
  else if (g <= 100_000_000) d = 12_000_000 + (g - 45_000_000) * 0.05;
  else d = 14_750_000 + (g - 100_000_000) * 0.02;
  return Math.min(d, 20_000_000);
};
const incomeTax = (b: number) => {
  if (b <= 0) return 0;
  if (b <= 14_000_000) return b * 0.06;
  if (b <= 50_000_000) return 840_000 + (b - 14_000_000) * 0.15;
  if (b <= 88_000_000) return 6_240_000 + (b - 50_000_000) * 0.24;
  if (b <= 150_000_000) return 15_360_000 + (b - 88_000_000) * 0.35;
  if (b <= 300_000_000) return 37_060_000 + (b - 150_000_000) * 0.38;
  if (b <= 500_000_000) return 94_060_000 + (b - 300_000_000) * 0.4;
  if (b <= 1_000_000_000) return 174_060_000 + (b - 500_000_000) * 0.42;
  return 384_060_000 + (b - 1_000_000_000) * 0.45;
};
const earnedTaxCredit = (tax: number, gross: number) => {
  const c = tax <= 1_300_000 ? tax * 0.55 : 715_000 + (tax - 1_300_000) * 0.3;
  let cap;
  if (gross <= 33_000_000) cap = 740_000;
  else if (gross <= 70_000_000) cap = Math.max(740_000 - (gross - 33_000_000) * 0.008, 660_000);
  else if (gross <= 120_000_000) cap = Math.max(660_000 - (gross - 70_000_000) * 0.5, 500_000);
  else cap = Math.max(500_000 - (gross - 120_000_000) * 0.5, 200_000);
  return Math.min(c, cap);
};

// ── 실업급여 소정급여일수 ──
const benefitDaysTable = (period: string, over50: boolean): number => {
  const under = { "<1": 120, "1-3": 150, "3-5": 180, "5-10": 210, "10+": 240 } as Record<string, number>;
  const over = { "<1": 120, "1-3": 180, "3-5": 210, "5-10": 240, "10+": 270 } as Record<string, number>;
  return (over50 ? over : under)[period] ?? 120;
};

export function LaborCalculatorView({ onBack }: LaborCalculatorViewProps) {
  const [tab, setTab] = useState<Tab>("retire");
  const [result, setResult] = useState<{ amount: number; lines: string[] } | null>(null);

  const [monthlyPay, setMonthlyPay] = useState(0); // 시급
  const [annualPay, setAnnualPay] = useState(0); // 연봉
  const [dependents, setDependents] = useState(1); // 부양가족(본인 포함)
  // 퇴직금
  const [joinDate, setJoinDate] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [avgMode, setAvgMode] = useState<"calc" | "manual">("calc");
  const [pay3m, setPay3m] = useState(0);
  const [bonusYear, setBonusYear] = useState(0);
  const [annualLeavePay, setAnnualLeavePay] = useState(0);
  const [avgManual, setAvgManual] = useState(0);
  // 실업급여
  const [avgDailyInput, setAvgDailyInput] = useState(0);
  const [coverage, setCoverage] = useState("1-3");
  const [over50, setOver50] = useState(false);
  // 통상임금 기반(연차/가산/해고예고)
  const [ordinaryMonthly, setOrdinaryMonthly] = useState(0);
  const [unusedDays, setUnusedDays] = useState(0);
  const [overtimeH, setOvertimeH] = useState(0);
  const [nightH, setNightH] = useState(0);
  const [holidayH, setHolidayH] = useState(0);
  // 주휴
  const [hourlyWage, setHourlyWage] = useState(0);
  const [weeklyHours, setWeeklyHours] = useState(40);

  const ordHourly = ordinaryMonthly / MONTHLY_HOURS;
  const ordDaily = ordHourly * 8;

  const switchTab = (t: Tab) => { setTab(t); setResult(null); };
  const reset = () => {
    setResult(null);
    setMonthlyPay(0); setAnnualPay(0); setDependents(1);
    setJoinDate(""); setLeaveDate(""); setAvgMode("calc");
    setPay3m(0); setBonusYear(0); setAnnualLeavePay(0); setAvgManual(0);
    setAvgDailyInput(0); setCoverage("1-3"); setOver50(false);
    setOrdinaryMonthly(0); setUnusedDays(0); setOvertimeH(0); setNightH(0); setHolidayH(0);
    setHourlyWage(0); setWeeklyHours(40);
  };

  const calculate = () => {
    if (tab === "hourly") {
      const h = monthlyPay / MONTHLY_HOURS;
      setResult({ amount: h, lines: [`월급 ${won(monthlyPay)}원 ÷ 209시간`, `일급(8h) ${won(h * 8)}원 · 연 환산 ${won(monthlyPay * 12)}원`] });
    } else if (tab === "annual") {
      const monthly = annualPay / 12;
      const nps = Math.min(monthly, NPS_CAP) * 0.045;
      const health = monthly * 0.03545;
      const care = health * 0.1295;
      const emp = monthly * 0.009;
      const earned = annualPay - earnedDeduction(annualPay); // 근로소득금액
      const base = Math.max(0, earned - 1_500_000 * dependents - nps * 12); // 과세표준(간이)
      const tax = incomeTax(base);
      const credit = earnedTaxCredit(tax, annualPay);
      const decided = Math.max(0, tax - credit);
      const incomeM = decided / 12;
      const localM = incomeM * 0.1;
      const net = monthly - nps - health - care - emp - incomeM - localM;
      setResult({
        amount: net,
        lines: [
          `월 세전 ${won(monthly)}원`,
          `4대보험 ${won(nps + health + care + emp)}원 (국민연금·건강·장기요양·고용)`,
          `소득세 ${won(incomeM)}원 + 지방소득세 ${won(localM)}원 (부양가족 ${dependents}인)`,
          `※ 비과세액·기타공제 미반영 예상치`,
        ],
      });
    } else if (tab === "retire") {
      const days = dayDiff(joinDate, leaveDate);
      if (days < 365) { setResult({ amount: 0, lines: ["계속 근로기간이 1년 미만이면 퇴직금이 발생하지 않습니다."] }); return; }
      let avg: number;
      if (avgMode === "manual") avg = avgManual;
      else { const d3 = last3mDays(leaveDate); avg = d3 > 0 ? (pay3m + (bonusYear * 3) / 12 + (annualLeavePay * 3) / 12) / d3 : 0; }
      setResult({ amount: avg * 30 * (days / 365), lines: [`1일 평균임금 ${won(avg)}원 × 30일 × (재직 ${days.toLocaleString()}일 ÷ 365)`] });
    } else if (tab === "unemploy") {
      const daily = Math.min(Math.max(avgDailyInput * 0.6, 63_104), 66_000);
      const d = benefitDaysTable(coverage, over50);
      setResult({ amount: daily * d, lines: [`구직급여 일액 ${won(daily)}원 × 소정급여일수 ${d}일`, `일액 = 평균임금×60% (상한 66,000 / 하한 63,104)`, `소정급여일수: 가입 ${coverage}년 · ${over50 ? "50세↑/장애인" : "50세 미만"}`] });
    } else if (tab === "leave") {
      setResult({ amount: ordDaily * unusedDays, lines: [`1일 통상임금 ${won(ordDaily)}원 × 미사용 ${unusedDays}일`, `통상시급 ${won(ordHourly)}원 = 월 통상임금 ÷ 209`] });
    } else if (tab === "extra") {
      const o = ordHourly * 1.5 * overtimeH;
      const n = ordHourly * 0.5 * nightH;
      const h = ordHourly * 1.5 * Math.min(holidayH, 8) + ordHourly * 2 * Math.max(holidayH - 8, 0);
      setResult({ amount: o + n + h, lines: [`연장 ${won(o)}원 (×1.5) · 야간 ${won(n)}원 (×0.5) · 휴일 ${won(h)}원`, `통상시급 ${won(ordHourly)}원 기준`] });
    } else if (tab === "notice") {
      setResult({ amount: ordDaily * 30, lines: [`1일 통상임금 ${won(ordDaily)}원 × 30일`, `통상시급 ${won(ordHourly)}원 = 월 통상임금 ÷ 209`] });
    } else if (tab === "weekly") {
      setResult({ amount: (Math.min(weeklyHours, 40) / 40) * 8 * hourlyWage, lines: [`(주 ${weeklyHours}h ÷ 40) × 8h × 시급 ${won(hourlyWage)}원`, `주 15시간 이상 개근 시 발생`] });
    }
  };

  const lawByTab: Record<Tab, string> = {
    hourly: "최저임금법", annual: "소득세법·4대보험", retire: "근로자퇴직급여 보장법 제8조",
    unemploy: "고용보험법 제46·50조", leave: "근로기준법 제60조", extra: "근로기준법 제56조",
    notice: "근로기준법 제26조", weekly: "근로기준법 제55조",
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="border-b border-border bg-card px-6 max-sm:px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0" aria-label="뒤로 가기">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 max-sm:w-9 max-sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl max-sm:text-lg font-bold text-foreground">노무 계산기</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-6 max-sm:px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-6 max-sm:p-4 shadow-sm">
            {/* 탭 (가로 스크롤) */}
            <div className="flex items-center gap-5 max-sm:gap-4 border-b border-border mb-5 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className={`pb-2.5 -mb-px text-[15px] whitespace-nowrap flex-shrink-0 border-b-2 transition-colors ${
                    tab === t.key ? "font-bold text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {tab === "hourly" && <Row label="월급"><NumInput value={monthlyPay} onChange={setMonthlyPay} suffix="원" /></Row>}

              {tab === "annual" && (
                <>
                  <Row label="연봉"><NumInput value={annualPay} onChange={setAnnualPay} suffix="원" /></Row>
                  <Row label="부양가족 수" info><NumInput value={dependents} onChange={setDependents} suffix="명" /></Row>
                  <p className="text-xs text-muted-foreground -mt-1">본인 포함(1인 이상). 소득세 간이 추정에 반영됩니다.</p>
                </>
              )}

              {tab === "retire" && (
                <>
                  <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
                    <Row label="입사일"><DateInput value={joinDate} onChange={setJoinDate} /></Row>
                    <Row label="퇴직일"><DateInput value={leaveDate} onChange={setLeaveDate} /></Row>
                  </div>
                  <p className="text-xs text-muted-foreground text-right -mt-2">퇴직일은 마지막 근무일의 다음 날짜입니다.</p>
                  <div className="rounded-xl border border-border p-4 space-y-3">
                    <div className="flex items-center gap-5">
                      <Radio checked={avgMode === "calc"} onChange={() => setAvgMode("calc")} label="평균임금 계산" />
                      <Radio checked={avgMode === "manual"} onChange={() => setAvgMode("manual")} label="평균임금 직접입력" />
                    </div>
                    {avgMode === "calc" ? (
                      <div className="space-y-2.5">
                        <Row label="3개월 급여 총액" info><NumInput value={pay3m} onChange={setPay3m} suffix="원" /></Row>
                        <Row label="연간 상여금 총액" info><NumInput value={bonusYear} onChange={setBonusYear} suffix="원" /></Row>
                        <Row label="연차수당" info><NumInput value={annualLeavePay} onChange={setAnnualLeavePay} suffix="원" /></Row>
                      </div>
                    ) : (
                      <Row label="1일 평균임금"><NumInput value={avgManual} onChange={setAvgManual} suffix="원" /></Row>
                    )}
                  </div>
                </>
              )}

              {tab === "unemploy" && (
                <>
                  <Row label="1일 평균임금"><NumInput value={avgDailyInput} onChange={setAvgDailyInput} suffix="원" /></Row>
                  <div className="grid grid-cols-2 max-sm:grid-cols-1 gap-3">
                    <Row label="고용보험 가입기간">
                      <SelectInput value={coverage} onChange={setCoverage} options={[["<1", "1년 미만"], ["1-3", "1~3년"], ["3-5", "3~5년"], ["5-10", "5~10년"], ["10+", "10년 이상"]]} />
                    </Row>
                    <Row label="연령">
                      <SelectInput value={over50 ? "y" : "n"} onChange={(v) => setOver50(v === "y")} options={[["n", "50세 미만"], ["y", "50세 이상·장애인"]]} />
                    </Row>
                  </div>
                </>
              )}

              {tab === "leave" && (
                <>
                  <Row label="월 통상임금" info><NumInput value={ordinaryMonthly} onChange={setOrdinaryMonthly} suffix="원" /></Row>
                  <Row label="미사용 연차일수"><NumInput value={unusedDays} onChange={setUnusedDays} suffix="일" /></Row>
                </>
              )}

              {tab === "extra" && (
                <>
                  <Row label="월 통상임금" info><NumInput value={ordinaryMonthly} onChange={setOrdinaryMonthly} suffix="원" /></Row>
                  <div className="grid grid-cols-3 max-sm:grid-cols-1 gap-3">
                    <Row label="연장 h"><NumInput value={overtimeH} onChange={setOvertimeH} suffix="h" /></Row>
                    <Row label="야간 h"><NumInput value={nightH} onChange={setNightH} suffix="h" /></Row>
                    <Row label="휴일 h"><NumInput value={holidayH} onChange={setHolidayH} suffix="h" /></Row>
                  </div>
                </>
              )}

              {tab === "notice" && <Row label="월 통상임금" info><NumInput value={ordinaryMonthly} onChange={setOrdinaryMonthly} suffix="원" /></Row>}

              {tab === "weekly" && (
                <>
                  <Row label="시급"><NumInput value={hourlyWage} onChange={setHourlyWage} suffix="원" /></Row>
                  <Row label="주 소정근로시간"><NumInput value={weeklyHours} onChange={setWeeklyHours} suffix="h" /></Row>
                </>
              )}
            </div>

            <div className="flex gap-2.5 mt-6">
              <button onClick={reset} className="flex-1 h-12 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> 초기화
              </button>
              <button onClick={calculate} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                계산하기
              </button>
            </div>

            {result && (
              <div className="mt-5 pt-5 border-t border-border">
                <div className="text-3xl max-sm:text-2xl font-bold text-primary mb-2">₩ {won(result.amount)}</div>
                <div className="space-y-1 mb-3">
                  {result.lines.map((l, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>{l}</p>
                  ))}
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">근거 · {lawByTab[tab]}</span>
              </div>
            )}

            <div className="mt-5 pt-4 border-t border-border space-y-1">
              {tab === "retire" && <p className="text-xs text-red-500"><b>1년 이상</b> 계속 근로한 경우에 지급됩니다.</p>}
              <p className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
                회사마다 평균임금·통상임금 기준이 다르고, 세금·보험료는 개별 사정에 따라 달라질 수 있어 실제 금액과 차이가 있을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, info, children }: { label: string; info?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="flex items-center gap-1 text-sm font-medium text-foreground mb-1.5">
        {label}
        {info && <Info className="w-3.5 h-3.5 text-muted-foreground/60" />}
      </span>
      {children}
    </label>
  );
}
function NumInput({ value, onChange, suffix }: { value: number; onChange: (n: number) => void; suffix?: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 h-11 focus-within:border-primary transition-colors">
      <input inputMode="numeric" value={value ? value.toLocaleString() : ""} onChange={(e) => onChange(digits(e.target.value))} placeholder="0"
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] text-foreground text-right" />
      {suffix && <span className="text-sm text-muted-foreground flex-shrink-0">{suffix}</span>}
    </span>
  );
}
function DateInput({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <input type="date" value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 h-11 text-[15px] text-foreground outline-none focus:border-primary transition-colors" />
  );
}
function SelectInput({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 h-11 text-[15px] text-foreground outline-none focus:border-primary transition-colors">
      {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
    </select>
  );
}
function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button type="button" onClick={onChange} className="flex items-center gap-2 text-sm text-foreground">
      <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${checked ? "border-primary" : "border-border"}`}>
        {checked && <span className="w-2 h-2 rounded-full bg-primary" />}
      </span>
      {label}
    </button>
  );
}
