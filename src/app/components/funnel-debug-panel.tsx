import { useState } from "react";
import { X, RefreshCw, RotateCcw } from "lucide-react";
import { getFunnelSummary, resetFunnel } from "@/app/utils/track";

// 비개발자용 퍼널 검증 패널. URL에 ?funnel 붙이면 노출.
// localStorage 카운터(track.ts)를 읽어 7단계 카운트·전환율을 표/막대로 표시.

const STAGES: { key: string; label: string }[] = [
  { key: "S1_eligibility", label: "S1 · 자격(관리자)" },
  { key: "S2_impression", label: "S2 · 진입점 노출" },
  { key: "S3_enter", label: "S3 · 정책화면 진입" },
  { key: "S4_modal_open", label: "S4 · 등록모달 오픈" },
  { key: "S5_upload_submit", label: "S5 · 업로드 제출" },
  { key: "S6_review_save", label: "S6 · 조문검수 저장" },
  { key: "S7_register_complete", label: "S7 · 등록 완료" },
];

export function FunnelDebugPanel({ onClose }: { onClose: () => void }) {
  const [counts, setCounts] = useState<Record<string, number>>(() => getFunnelSummary());
  const refresh = () => setCounts({ ...getFunnelSummary() });

  // 단계별 합산(소스 접미사 :sidebar 등 포함) + 소스 분해
  const sumForStage = (stageKey: string) =>
    Object.entries(counts)
      .filter(([k]) => k === stageKey || k.startsWith(stageKey + ":"))
      .reduce((a, [, v]) => a + v, 0);

  const sourcesForStage = (stageKey: string) =>
    Object.entries(counts)
      .filter(([k]) => k.startsWith(stageKey + ":"))
      .map(([k, v]) => ({ src: k.split(":")[1], v }));

  const rows = STAGES.map((s) => ({ ...s, count: sumForStage(s.key), sources: sourcesForStage(s.key) }));
  const base = rows[0].count || 0;
  const max = Math.max(1, ...rows.map((r) => r.count));

  // 단조성 위반(뒤 단계가 앞 단계보다 큼) 감지
  let violation = false;
  for (let i = 1; i < rows.length; i++) if (rows[i].count > rows[i - 1].count) violation = true;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[560px] max-h-[85vh] overflow-y-auto bg-card rounded-2xl shadow-xl border border-border p-5">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-foreground">정책 등록 퍼널 (검증용)</h2>
          <div className="flex items-center gap-1">
            <button onClick={refresh} title="새로고침" className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={() => { resetFunnel(); refresh(); }} title="초기화" className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={onClose} title="닫기" className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-3" style={{ wordBreak: "keep-all" }}>
          localStorage 원시 이벤트 수(QA·데모용). 실제 분석은 세션·고객사 단위 dedup 필요.
        </p>

        {violation && (
          <p className="text-xs font-semibold text-red-600 mb-2">⚠ 단조성 위반: 뒤 단계 수가 앞 단계보다 큽니다(계측 점검 필요).</p>
        )}

        <div className="space-y-2">
          {rows.map((r, i) => {
            const prev = i === 0 ? r.count : rows[i - 1].count;
            const stepConv = i === 0 || prev === 0 ? null : Math.round((r.count / prev) * 100);
            const fromTop = base === 0 ? 0 : Math.round((r.count / base) * 100);
            return (
              <div key={r.key} className="rounded-xl border border-border/70 px-3 py-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-foreground">{r.label}</span>
                  <span className="tabular-nums text-foreground">
                    <b>{r.count}</b>
                    {stepConv !== null && <span className="text-muted-foreground text-xs"> · 이전 대비 {stepConv}%</span>}
                    {i > 0 && <span className="text-muted-foreground text-xs"> · 최상단 대비 {fromTop}%</span>}
                  </span>
                </div>
                <div className="mt-1.5 h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.round((r.count / max) * 100)}%` }} />
                </div>
                {r.sources.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {r.sources.map((s) => (
                      <span key={s.src} className="text-[11px] px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground">{s.src}: {s.v}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
