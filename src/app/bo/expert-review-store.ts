/**
 * BO 전문가 인증 심사 스토어 — localStorage 기반 프로토타입.
 *
 * 법무검토(260928): 상세분석·의견서는 자격 검증(관리자 수기 심사) 후 전문가에게만 제공.
 * 협회·공공API 자동확인 불가 → BO에서 승인/반려/보완을 수기 처리하고 감사로그를 남긴다.
 *
 * 데이터: 데모 시드 신청 + FE 현재 사용자(me) 신청(expert-auth)을 합성해 목록으로 노출.
 * me 신청 처리 시 expert-auth의 approveExpert/rejectExpert를 호출해 FE에 즉시 반영한다.
 */
import { newId } from "@/app/bo/bo-store";
import {
  getExpertAuth, approveExpert, rejectExpert,
  type ExpertLicenseType,
} from "@/app/data/expert-auth";

export type ExpertReviewStatus = "pending" | "verified" | "rejected" | "hold"; // hold=보완요청
export type ExpertReviewAction = "approve" | "reject" | "hold";

export interface ExpertApplication {
  id: string;                 // 'me' = FE 현재 사용자 신청, ap_* = 데모 시드
  licenseType: ExpertLicenseType;
  name: string;
  licenseNo: string;
  office?: string;
  evidenceFileName?: string;
  status: ExpertReviewStatus;
  submittedAt: string;
  decidedAt?: string;
  decidedBy?: string;
  reason?: string;
}

export interface ExpertAuditLog {
  at: string;
  actor: string;
  action: ExpertReviewAction;
  targetId: string;
  targetName: string;
  reason?: string;
}

const APPS_KEY = "bo_expert_apps";
const LOG_KEY = "bo_expert_audit";
const EVENT = "bo-expert-changed";

const SEED_APPS: ExpertApplication[] = [
  { id: "ap_1001", licenseType: "tax",  name: "김세무", licenseNo: "T-20419", office: "세무회계 정도", evidenceFileName: "세무사등록증.pdf", status: "pending",  submittedAt: "2026-09-27T10:12:00" },
  { id: "ap_1002", licenseType: "law",  name: "이변호", licenseNo: "L-33871", office: "법무법인 해원", evidenceFileName: "변호사신분증.jpg", status: "pending",  submittedAt: "2026-09-26T16:40:00" },
  { id: "ap_1003", licenseType: "labor", name: "박노무", licenseNo: "N-10255", office: "노무법인 다솜", evidenceFileName: "공인노무사증.pdf", status: "verified", submittedAt: "2026-09-22T09:05:00", decidedAt: "2026-09-23T11:20:00", decidedBy: "admin" },
];

function readApps(): ExpertApplication[] {
  if (typeof window === "undefined") return SEED_APPS;
  try {
    const raw = localStorage.getItem(APPS_KEY);
    if (!raw) { localStorage.setItem(APPS_KEY, JSON.stringify(SEED_APPS)); return [...SEED_APPS]; }
    return JSON.parse(raw) as ExpertApplication[];
  } catch { return [...SEED_APPS]; }
}

function writeApps(list: ExpertApplication[]) {
  try { localStorage.setItem(APPS_KEY, JSON.stringify(list)); } catch { /* noop */ }
  try { window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* noop */ }
}

/** FE 현재 사용자(me) 신청을 심사 목록 행으로 합성. 미신청(none)이면 null. */
export function meApplication(): ExpertApplication | null {
  const a = getExpertAuth();
  if (a.status === "none" || !a.licenseType) return null;
  return {
    id: "me",
    licenseType: a.licenseType,
    name: a.name ?? "(본인)",
    licenseNo: a.licenseNo ?? "-",
    office: a.office,
    evidenceFileName: a.evidenceFileName,
    status: a.status === "verified" ? "verified" : a.status === "rejected" ? "rejected" : "pending",
    submittedAt: a.submittedAt ?? "",
    decidedAt: a.decidedAt,
    reason: a.rejectReason,
  };
}

/** 심사 목록 = me 신청(있으면 최상단) + 데모 시드. */
export function listApplications(): ExpertApplication[] {
  const me = meApplication();
  const demo = readApps();
  return me ? [me, ...demo] : demo;
}

export function loadAudit(): ExpertAuditLog[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(LOG_KEY) || "[]") as ExpertAuditLog[]; } catch { return []; }
}

function addAudit(entry: ExpertAuditLog) {
  const log = loadAudit();
  log.unshift(entry);
  try { localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(0, 200))); } catch { /* noop */ }
}

/** 심사 처리 — me는 expert-auth(FE)에 반영, 데모는 목록에 반영. 감사로그 기록. */
export function decideApplication(app: ExpertApplication, action: ExpertReviewAction, actor: string, reason?: string) {
  const now = new Date().toISOString();
  if (app.id === "me") {
    if (action === "approve") approveExpert();
    else if (action === "reject") rejectExpert(reason);
    else rejectExpert(`[보완요청] ${reason ?? ""}`.trim()); // expert-auth엔 hold 없음 → 사유 접두로 표기
  } else {
    const list = readApps().map((a) =>
      a.id === app.id
        ? { ...a, status: action === "approve" ? "verified" : action === "reject" ? "rejected" : "hold", decidedAt: now, decidedBy: actor, reason }
        : a
    );
    writeApps(list as ExpertApplication[]);
  }
  addAudit({ at: now, actor, action, targetId: app.id, targetName: app.name, reason });
}

/** 데모용: 심사 데이터 초기화(시드 복원). */
export function resetExpertReview() {
  try { localStorage.removeItem(APPS_KEY); localStorage.removeItem(LOG_KEY); } catch { /* noop */ }
  try { window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* noop */ }
}

export const EXPERT_REVIEW_EVENT = EVENT;
export { newId };
