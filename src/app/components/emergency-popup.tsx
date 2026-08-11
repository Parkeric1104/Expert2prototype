import { AlertTriangle, AlertOctagon, Info, X } from "lucide-react";
import { getEmergency, type EmergencySeverity } from "@/app/data/service-content";

// 메인 중앙 공지 팝업(SVC-002). 심각도 3단계로 아이콘·색·라벨 구분.
// 콘텐츠·심각도는 service-content(추후 백오피스). 데모: URL ?severity=info|warning|critical
const SEV: Record<EmergencySeverity, { Icon: typeof Info; ring: string; bg: string }> = {
  info:     { Icon: Info,          ring: "text-primary",   bg: "bg-primary/10" },
  warning:  { Icon: AlertTriangle, ring: "text-amber-600", bg: "bg-amber-500/10" },
  critical: { Icon: AlertOctagon,  ring: "text-red-600",   bg: "bg-red-500/10" },
};

export function EmergencyPopup({ onClose }: { onClose: () => void }) {
  const e = getEmergency();
  // 데모용 심각도 오버라이드(프로토타입에서 단계 확인)
  const override = typeof window !== "undefined" ? new URLSearchParams(window.location.search).get("severity") : null;
  const severity: EmergencySeverity =
    override === "info" || override === "warning" || override === "critical" ? override : e.severity;
  const s = SEV[severity];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[420px] bg-card rounded-2xl shadow-xl border border-border p-6">
        <div className="flex items-center gap-2.5 mb-3">
          <div className={`w-10 h-10 rounded-full ${s.bg} flex items-center justify-center flex-shrink-0`}>
            <s.Icon className={`w-5 h-5 ${s.ring}`} />
          </div>
          <h2 className="text-base font-bold text-foreground" style={{ wordBreak: "keep-all" }}>{e.title}</h2>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-5" style={{ wordBreak: "keep-all" }}>{e.message}</p>
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5"
        >
          <X className="w-4 h-4" />
          확인
        </button>
      </div>
    </div>
  );
}
