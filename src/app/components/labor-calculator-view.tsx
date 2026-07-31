import { useState } from "react";
import { ArrowLeft, Calculator, RotateCcw, Info } from "lucide-react";

// 노무(임금) 계산기 — 네이버식 간단 계산기 패턴.
// 단일 컬럼 입력 → [계산하기] → 결과. 탭: 시급 / 연봉 / 퇴직금 / 실업급여.
// ⚠ 참고용 간이 계산 — 회사마다 평균임금·통상임금 기준이 달라 실제와 차이가 있을 수 있음.

interface LaborCalculatorViewProps {
  onBack: () => void;
}

type Tab = "hourly" | "annual" | "retire" | "unemploy";
const TABS: { key: Tab; label: string }[] = [
  { key: "hourly", label: "시급" },
  { key: "annual", label: "연봉" },
  { key: "retire", label: "퇴직금" },
  { key: "unemploy", label: "실업급여" },
];

const MONTHLY_HOURS = 209; // 주40h 월 소정근로시간
const won = (n: number) => (isFinite(n) && n > 0 ? Math.round(n).toLocaleString() : "0");
const digits = (s: string) => Number(s.replace(/[^0-9]/g, "")) || 0;
const dayDiff = (a: string, b: string) => (!a || !b ? 0 : Math.max(Math.round((+new Date(b) - +new Date(a)) / 86400000), 0));
// 퇴직일 이전 3개월 총일수
const last3mDays = (leave: string) => {
  if (!leave) return 0;
  const end = new Date(leave);
  const start = new Date(end);
  start.setMonth(start.getMonth() - 3);
  return Math.max(Math.round((+end - +start) / 86400000), 1);
};

export function LaborCalculatorView({ onBack }: LaborCalculatorViewProps) {
  const [tab, setTab] = useState<Tab>("retire");
  const [result, setResult] = useState<{ amount: number; lines: string[] } | null>(null);

  // 시급
  const [monthlyPay, setMonthlyPay] = useState(0);
  // 연봉
  const [annualPay, setAnnualPay] = useState(0);
  // 퇴직금
  const [joinDate, setJoinDate] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [avgMode, setAvgMode] = useState<"calc" | "manual">("calc");
  const [pay3m, setPay3m] = useState(0); // 3개월 급여 총액
  const [bonusYear, setBonusYear] = useState(0); // 연간 상여금 총액
  const [annualLeavePay, setAnnualLeavePay] = useState(0); // 연차수당
  const [avgManual, setAvgManual] = useState(0); // 1일 평균임금 직접입력
  // 실업급여
  const [avgDailyInput, setAvgDailyInput] = useState(0); // 1일 평균임금
  const [benefitDays, setBenefitDays] = useState(120); // 소정급여일수

  const switchTab = (t: Tab) => {
    setTab(t);
    setResult(null);
  };

  const reset = () => {
    setResult(null);
    setMonthlyPay(0); setAnnualPay(0);
    setJoinDate(""); setLeaveDate(""); setAvgMode("calc");
    setPay3m(0); setBonusYear(0); setAnnualLeavePay(0); setAvgManual(0);
    setAvgDailyInput(0); setBenefitDays(120);
  };

  const calculate = () => {
    if (tab === "hourly") {
      const hourly = monthlyPay / MONTHLY_HOURS;
      setResult({
        amount: hourly,
        lines: [
          `월급 ${won(monthlyPay)}원 ÷ 209시간(주40h 기준)`,
          `일급(8h): ${won(hourly * 8)}원 · 연 환산: ${won(monthlyPay * 12)}원`,
        ],
      });
    } else if (tab === "annual") {
      const monthly = annualPay / 12;
      // 간이 공제: 국민연금4.5% + 건강3.545% + 장기요양(건강의12.95%) + 고용0.9% + 근로소득 간이 6%
      const pension = monthly * 0.045;
      const health = monthly * 0.03545;
      const care = health * 0.1295;
      const employ = monthly * 0.009;
      const tax = monthly * 0.06;
      const net = monthly - pension - health - care - employ - tax;
      setResult({
        amount: net,
        lines: [
          `월 세전 ${won(monthly)}원 (연봉 ÷ 12)`,
          `공제(간이): 국민연금·건강·고용보험 + 소득세 근사`,
          `※ 부양가족·비과세액 미반영 간이 추정치`,
        ],
      });
    } else if (tab === "retire") {
      const svcDays = dayDiff(joinDate, leaveDate);
      if (svcDays < 365) {
        setResult({ amount: 0, lines: ["계속 근로기간이 1년 미만이면 퇴직금이 발생하지 않습니다."] });
        return;
      }
      let avgDaily: number;
      if (avgMode === "manual") {
        avgDaily = avgManual;
      } else {
        const d3 = last3mDays(leaveDate);
        const total = pay3m + (bonusYear * 3) / 12 + (annualLeavePay * 3) / 12;
        avgDaily = d3 > 0 ? total / d3 : 0;
      }
      const retire = avgDaily * 30 * (svcDays / 365);
      setResult({
        amount: retire,
        lines: [
          `1일 평균임금 ${won(avgDaily)}원 × 30일 × (재직 ${svcDays.toLocaleString()}일 ÷ 365)`,
          avgMode === "calc" ? `평균임금 = (3개월 급여 + 상여×3/12 + 연차수당×3/12) ÷ 3개월 일수` : `평균임금 직접입력 기준`,
        ],
      });
    } else if (tab === "unemploy") {
      // 구직급여 일액 = 1일 평균임금 × 60% (2024 상한 66,000 / 하한 최저임금80% 근사 63,104)
      const raw = avgDailyInput * 0.6;
      const daily = Math.min(Math.max(raw, 63104), 66000);
      setResult({
        amount: daily * benefitDays,
        lines: [
          `구직급여 일액 ${won(daily)}원 × 소정급여일수 ${benefitDays}일`,
          `일액 = 1일 평균임금 × 60% (상한 66,000 / 하한 63,104 적용)`,
        ],
      });
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 max-sm:px-4 py-4 flex items-center gap-3 flex-shrink-0">
        <button onClick={onBack} className="p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors flex-shrink-0" aria-label="뒤로 가기">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-10 h-10 max-sm:w-9 max-sm:h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Calculator className="w-5 h-5 text-primary" />
        </div>
        <h1 className="text-2xl max-sm:text-lg font-bold text-foreground">노무 계산기</h1>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 max-sm:px-4 py-6">
        <div className="max-w-xl mx-auto">
          <div className="rounded-2xl border border-border bg-card p-6 max-sm:p-4 shadow-sm">
            {/* 탭 (텍스트 언더라인) */}
            <div className="flex items-center gap-5 max-sm:gap-4 border-b border-border mb-5">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => switchTab(t.key)}
                  className={`pb-2.5 -mb-px text-[15px] border-b-2 transition-colors ${
                    tab === t.key ? "font-bold text-foreground border-primary" : "text-muted-foreground border-transparent hover:text-foreground"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* 입력 영역 */}
            <div className="space-y-4">
              {tab === "hourly" && (
                <Row label="월급">
                  <NumInput value={monthlyPay} onChange={setMonthlyPay} suffix="원" />
                </Row>
              )}

              {tab === "annual" && (
                <Row label="연봉">
                  <NumInput value={annualPay} onChange={setAnnualPay} suffix="원" />
                </Row>
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
                  <Row label="소정급여일수"><NumInput value={benefitDays} onChange={setBenefitDays} suffix="일" /></Row>
                  <p className="text-xs text-muted-foreground">가입기간·연령에 따라 120~270일(간이 입력).</p>
                </>
              )}
            </div>

            {/* 버튼 */}
            <div className="flex gap-2.5 mt-6">
              <button onClick={reset} className="flex-1 h-12 rounded-xl border border-border bg-card text-foreground font-semibold hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                <RotateCcw className="w-4 h-4" /> 초기화
              </button>
              <button onClick={calculate} className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors">
                계산하기
              </button>
            </div>

            {/* 결과 */}
            {result && (
              <div className="mt-5 pt-5 border-t border-border">
                <div className="text-3xl max-sm:text-2xl font-bold text-primary mb-2">₩ {won(result.amount)}</div>
                <div className="space-y-1">
                  {result.lines.map((l, i) => (
                    <p key={i} className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>{l}</p>
                  ))}
                </div>
              </div>
            )}

            {/* 고지 */}
            <div className="mt-5 pt-4 border-t border-border space-y-1">
              {tab === "retire" && <p className="text-xs text-red-500"><b>1년 이상</b> 계속 근로한 경우에 지급됩니다.</p>}
              <p className="text-xs text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
                회사마다 평균임금·통상임금 기준이 다르기 때문에 실제 금액과는 차이가 있을 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 하위 UI ──────────────────────────────────────────────
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
      <input
        inputMode="numeric"
        value={value ? value.toLocaleString() : ""}
        onChange={(e) => onChange(digits(e.target.value))}
        placeholder="0"
        className="flex-1 min-w-0 bg-transparent border-none outline-none text-[15px] text-foreground text-right"
      />
      {suffix && <span className="text-sm text-muted-foreground flex-shrink-0">{suffix}</span>}
    </span>
  );
}

function DateInput({ value, onChange }: { value: string; onChange: (s: string) => void }) {
  return (
    <input
      type="date"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-border bg-background px-3 h-11 text-[15px] text-foreground outline-none focus:border-primary transition-colors"
    />
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
