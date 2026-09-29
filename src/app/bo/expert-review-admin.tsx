/**
 * BO 전문가 인증 심사 (법무검토 260928) — 관리자 수기 심사.
 * 신청 목록(데모 시드 + FE 현재 사용자) · 상세 · 승인/반려/보완요청(사유) · 감사로그.
 * me 신청 승인 시 expert-auth를 통해 FE(상세분석·의견서 발행)에 즉시 반영된다.
 */
import { useEffect, useMemo, useState } from "react";
import { ShieldCheck, FileText, History } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, Card, StatusDot, Segment, Pagination, fmtDT } from "@/app/bo/bo-ui";
import { LICENSE_LABELS, LICENSE_ASSOC, useExpertAuth } from "@/app/data/expert-auth";
import type { BOAccount } from "@/app/bo/bo-store";
import {
  listApplications, decideApplication, loadAudit, resetExpertReview,
  EXPERT_REVIEW_EVENT,
  type ExpertApplication, type ExpertReviewStatus, type ExpertReviewAction,
} from "@/app/bo/expert-review-store";

const PAGE_SIZE = 6;

const STATUS_META: Record<ExpertReviewStatus, { label: string; tone: "green" | "gray" | "blue" | "amber" }> = {
  pending:  { label: "심사중",   tone: "amber" },
  verified: { label: "승인",     tone: "green" },
  rejected: { label: "반려",     tone: "gray" },
  hold:     { label: "보완요청", tone: "blue" },
};

type Filter = "all" | ExpertReviewStatus;

export function ExpertReviewAdmin({ me }: { me: BOAccount }) {
  const auth = useExpertAuth();              // FE 현재 사용자(me) 신청 변경 시 재렌더
  const [tick, setTick] = useState(0);       // 데모 신청 변경(bo-expert-changed) 재렌더
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<ExpertApplication | null>(null);
  const [showAudit, setShowAudit] = useState(false);

  useEffect(() => {
    const bump = () => setTick((t) => t + 1);
    window.addEventListener(EXPERT_REVIEW_EVENT, bump);
    return () => window.removeEventListener(EXPERT_REVIEW_EVENT, bump);
  }, []);

  const apps = useMemo(() => listApplications(), [auth, tick]);
  const filtered = useMemo(
    () => (filter === "all" ? apps : apps.filter((a) => a.status === filter)),
    [apps, filter]
  );
  const pendingCount = apps.filter((a) => a.status === "pending" || a.status === "hold").length;
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const audit = useMemo(() => loadAudit(), [tick, auth]);

  return (
    <div>
      <PageHeader
        title="전문가 인증 심사"
        desc="세무사·공인노무사·변호사 자격 신청을 심사해 상세분석·의견서 발행 권한을 부여할 수 있어요. 자격 진위는 관리자가 증빙으로 직접 확인합니다."
        action={
          <button
            onClick={() => setShowAudit(true)}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <History className="w-4 h-4" />
            감사로그
          </button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-3 flex-wrap">
        <Segment<Filter>
          value={filter}
          onChange={(v) => { setFilter(v); setPage(1); }}
          options={[
            { value: "all", label: `전체 ${apps.length}` },
            { value: "pending", label: "심사중" },
            { value: "verified", label: "승인" },
            { value: "rejected", label: "반려" },
            { value: "hold", label: "보완요청" },
          ]}
        />
        {pendingCount > 0 && (
          <span className="text-sm text-amber-600 font-medium">처리 대기 {pendingCount}건</span>
        )}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-gray-50/60 text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">신청일</th>
                <th className="px-4 py-3 font-medium">자격</th>
                <th className="px-4 py-3 font-medium">성명</th>
                <th className="px-4 py-3 font-medium">등록번호</th>
                <th className="px-4 py-3 font-medium">소속</th>
                <th className="px-4 py-3 font-medium">증빙</th>
                <th className="px-4 py-3 font-medium">상태</th>
                <th className="px-4 py-3 font-medium text-right">처리</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">신청 내역이 없어요.</td></tr>
              )}
              {pageItems.map((a) => {
                const meta = STATUS_META[a.status];
                const decidable = a.status === "pending" || a.status === "hold";
                return (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-gray-50/50">
                    <td className="px-4 py-3 whitespace-nowrap text-foreground/80">{fmtDT(a.submittedAt)}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{LICENSE_LABELS[a.licenseType]}</td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-foreground">
                      {a.name}{a.id === "me" && <span className="ml-1.5 text-[11px] text-primary">본인</span>}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground/80">{a.licenseNo}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground/80">{a.office || "-"}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-foreground/70">
                      <span className="inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5" />{a.evidenceFileName || "-"}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusDot tone={meta.tone} label={meta.label} /></td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button
                        onClick={() => setDetail(a)}
                        className={`px-2.5 h-7 rounded-lg text-xs font-medium transition-colors ${
                          decidable ? "bg-primary/10 text-primary hover:bg-primary/15" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {decidable ? "심사" : "상세"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* 데모: 심사 데이터 초기화 */}
      <button onClick={() => { resetExpertReview(); toast.success("심사 데이터를 초기화했어요."); }}
        className="mt-4 text-xs text-muted-foreground/70 hover:text-foreground underline underline-offset-2">
        데모: 심사 데이터 초기화(시드 복원)
      </button>

      {detail && (
        <ReviewDetailModal app={detail} actor={me.loginId} onClose={() => setDetail(null)} />
      )}
      {showAudit && (
        <AuditModal log={audit} onClose={() => setShowAudit(false)} />
      )}
    </div>
  );
}

// ── 심사 상세/처리 모달 ──
function ReviewDetailModal({ app, actor, onClose }: { app: ExpertApplication; actor: string; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const decidable = app.status === "pending" || app.status === "hold";
  const meta = STATUS_META[app.status];

  const handle = (action: ExpertReviewAction) => {
    if ((action === "reject" || action === "hold") && !reason.trim()) {
      toast.error("반려·보완요청은 사유를 입력해 주세요.");
      return;
    }
    decideApplication(app, action, actor, reason.trim() || undefined);
    toast.success(action === "approve" ? "승인 처리했어요. 전문가 발행 권한이 부여됩니다." : action === "reject" ? "반려 처리했어요." : "보완요청 처리했어요.");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[460px] bg-white rounded-2xl shadow-xl overflow-hidden" onClick={(e) => e.stopPropagation()} style={{ wordBreak: "keep-all" }}>
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ShieldCheck className="w-[18px] h-[18px] text-primary" /></div>
          <h3 className="text-base font-bold text-foreground">전문가 인증 심사</h3>
          <span className="ml-auto"><StatusDot tone={meta.tone} label={meta.label} /></span>
        </div>

        <div className="px-6 py-5 space-y-3 text-sm">
          <Row label="자격 유형" value={`${LICENSE_LABELS[app.licenseType]} (${LICENSE_ASSOC[app.licenseType]})`} />
          <Row label="성명" value={app.name} />
          <Row label="등록번호" value={app.licenseNo} />
          <Row label="소속" value={app.office || "-"} />
          <Row label="증빙" value={app.evidenceFileName || "-"} />
          <Row label="신청일" value={fmtDT(app.submittedAt)} />
          {app.reason && <Row label="사유" value={app.reason} />}

          {decidable && (
            <div className="pt-2">
              <label className="block text-xs font-semibold text-foreground mb-1.5">사유 <span className="text-muted-foreground font-normal">(반려·보완 시 필수)</span></label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={2}
                placeholder="예: 자격증 사본이 불명확합니다. 재제출 바랍니다."
                className="w-full px-3 py-2 rounded-lg border border-border text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors resize-none"
              />
              <p className="mt-2 text-[11px] text-muted-foreground leading-relaxed">
                승인 시 상세분석·의견서 발행이 전문가 명의로 활성화됩니다. 심사는 자격 검증에 한하며 의견 내용에는 개입하지 않습니다.
              </p>
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 h-10 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">닫기</button>
          {decidable && (
            <>
              <button onClick={() => handle("hold")} className="px-4 h-10 rounded-lg bg-slate-100 text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors">보완요청</button>
              <button onClick={() => handle("reject")} className="px-4 h-10 rounded-lg bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors">반려</button>
              <button onClick={() => handle("approve")} className="px-4 h-10 rounded-lg bg-primary text-sm font-semibold text-white hover:bg-primary/90 transition-colors">승인</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground flex-shrink-0">{label}</span>
      <span className="text-foreground font-medium text-right">{value}</span>
    </div>
  );
}

// ── 감사로그 모달 ──
function AuditModal({ log, onClose }: { log: ReturnType<typeof loadAudit>; onClose: () => void }) {
  const ACTION_LABEL: Record<ExpertReviewAction, string> = { approve: "승인", reject: "반려", hold: "보완요청" };
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="w-full max-w-[520px] bg-white rounded-2xl shadow-xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2 px-6 py-4 border-b border-border">
          <History className="w-[18px] h-[18px] text-foreground/70" />
          <h3 className="text-base font-bold text-foreground">심사 감사로그</h3>
          <button onClick={onClose} className="ml-auto text-sm text-muted-foreground hover:text-foreground">닫기</button>
        </div>
        <div className="px-6 py-4 overflow-y-auto">
          {log.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">기록이 없어요.</p>
          ) : (
            <ul className="space-y-2.5">
              {log.map((e, i) => (
                <li key={i} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground whitespace-nowrap">{fmtDT(e.at)}</span>
                  <span className="text-foreground">
                    <b>{e.actor}</b> 님이 <b>{e.targetName}</b> 신청을 <b>{ACTION_LABEL[e.action]}</b>
                    {e.reason ? ` — ${e.reason}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
