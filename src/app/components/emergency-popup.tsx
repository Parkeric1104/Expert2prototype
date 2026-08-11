import { AlertTriangle, AlertOctagon, Info } from "lucide-react";
import { getEmergency, type EmergencySeverity } from "@/app/data/service-content";

// 메인 중앙 공지 팝업(SVC-002). 심각도 3단계로 아이콘·색·라벨 구분.
// 콘텐츠·심각도는 service-content(추후 백오피스). 데모: URL ?severity=info|warning|critical
const SEV: Record<EmergencySeverity, { Icon: typeof Info; ring: string; bg: string }> = {
  info:     { Icon: Info,          ring: "text-primary",   bg: "bg-primary/10" },
  warning:  { Icon: AlertTriangle, ring: "text-amber-600", bg: "bg-amber-500/10" },
  critical: { Icon: AlertOctagon,  ring: "text-red-600",   bg: "bg-red-500/10" },
};

export function EmergencyPopup({ onClose, onDontShowAgain }: { onClose: () => void; onDontShowAgain: () => void }) {
  const e = getEmergency();
  // 데모용 심각도 오버라이드(프로토타입에서 단계 확인)
  const override = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("severity") : null;
  const severity: EmergencySeverity =
    override === "info" || override === "warning" || override === "critical" ? override : e.severity;
  const s = SEV[severity];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      {/* 너비 고정 420(모바일만 축소) · 높이만 가변(내용 따라, 최대 85vh 초과 시 본문 스크롤) */}
      <div className="w-full max-w-[420px] max-h-[85vh] bg-card rounded-2xl shadow-xl border border-border flex flex-col overflow-hidden">
        <div className="flex items-center gap-2.5 px-6 pt-6 pb-3 flex-shrink-0">
          <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.Icon className={`w-5 h-5 ${s.ring}`} />
          </div>
          <h2 className="text-base font-bold text-foreground" style={{ wordBreak: "keep-all" }}>{e.title}</h2>
        </div>
        <div className="px-6 flex-1 min-h-0 overflow-y-auto">
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line" style={{ wordBreak: "keep-all" }}>{e.message}</p>
        </div>
        <div className="px-6 pt-3 pb-5 flex-shrink-0 flex items-center justify-between">
          <button
            onClick={onDontShowAgain}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            다시 보지 않기
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 rounded-lg text-sm font-semibold text-primary hover:bg-primary/10 transition-colors"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
