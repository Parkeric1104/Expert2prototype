import { AlertTriangle, X } from "lucide-react";
import { getEmergency } from "@/app/data/service-content";

// 서비스 오류 긴급 팝업 — 전역 최우선 모달.
// 표시 조건: content.emergency.active === true (또는 데모용 ?emergency).
// 콘텐츠는 service-content(추후 백오피스/원격 config로 무배포 전환).
export function EmergencyPopup({ onClose }: { onClose: () => void }) {
  const e = getEmergency();
  const tone =
    e.severity === "critical"
      ? { ring: "text-red-600", bg: "bg-red-500/10" }
      : e.severity === "warning"
      ? { ring: "text-amber-600", bg: "bg-amber-500/10" }
      : { ring: "text-primary", bg: "bg-primary/10" };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-[420px] bg-card rounded-2xl shadow-xl border border-border p-6 text-center">
        <div className={`w-12 h-12 rounded-full ${tone.bg} flex items-center justify-center mx-auto mb-3`}>
          <AlertTriangle className={`w-6 h-6 ${tone.ring}`} />
        </div>
        <h2 className="text-base font-bold text-foreground mb-1.5" style={{ wordBreak: "keep-all" }}>{e.title}</h2>
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
