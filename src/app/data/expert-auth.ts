/**
 * 전문가 인증(자격 검증) 상태 스토어 — localStorage 기반 프로토타입.
 *
 * 법무검토(260928) 반영: 세법/노무도우미의 상세분석·의견서 발행은 '자격 검증 + 전문가
 * 업무보조 도구 + 운영 통제 장치'를 전제로 전문가(세무사·공인노무사·변호사)에게 제공.
 * 협회·공공API 자동 자격확인이 불가하므로 검증은 'BO 관리자 수기 심사'로 처리한다
 * (프로토타입에서는 데모용 승인/반려로 대체, 실서비스 전환 시 BO 심사 화면이 대체).
 *
 * FE는 이 상태를 읽어 ▲전문가 인증 신청 ▲의견서 운영통제(초안 워터마크·전문가 검토·승인)에 활용.
 */
import { useEffect, useState } from "react";

export type ExpertLicenseType = "tax" | "labor" | "law"; // 세무사 / 공인노무사 / 변호사
export type ExpertStatus = "none" | "pending" | "verified" | "rejected";

export interface ExpertAuth {
  status: ExpertStatus;
  licenseType?: ExpertLicenseType;
  name?: string;
  licenseNo?: string;
  office?: string;
  evidenceFileName?: string; // 증빙(자격증/등록증) — 프로토타입은 파일명만 mock 저장
  submittedAt?: string;      // 신청 일시(ISO)
  decidedAt?: string;        // 심사 완료 일시(ISO)
  rejectReason?: string;
}

const KEY = "expert_auth";
const EVENT = "expert-auth-changed";
const DEFAULT: ExpertAuth = { status: "none" };

export const LICENSE_LABELS: Record<ExpertLicenseType, string> = {
  tax: "세무사",
  labor: "공인노무사",
  law: "변호사",
};

export const LICENSE_ASSOC: Record<ExpertLicenseType, string> = {
  tax: "한국세무사회",
  labor: "대한공인노무사회",
  law: "대한변호사협회",
};

export function getExpertAuth(): ExpertAuth {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULT, ...(JSON.parse(raw) as ExpertAuth) } : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

function save(next: ExpertAuth) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* noop */ }
  try { window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* noop */ }
}

const nowIso = () => new Date().toISOString();

/** 전문가 인증 신청 → 심사중(pending). 자격 진위확인은 BO 수기 심사에서 수행. */
export function applyExpertVerification(input: {
  licenseType: ExpertLicenseType;
  name: string;
  licenseNo: string;
  office?: string;
  evidenceFileName?: string;
}) {
  save({
    status: "pending",
    licenseType: input.licenseType,
    name: input.name,
    licenseNo: input.licenseNo,
    office: input.office,
    evidenceFileName: input.evidenceFileName,
    submittedAt: nowIso(),
    decidedAt: undefined,
    rejectReason: undefined,
  });
}

/** 데모/BO 대체용: 관리자 승인 → verified. (실서비스는 BO 인증 심사 화면에서 처리) */
export function approveExpert() {
  const cur = getExpertAuth();
  save({ ...cur, status: "verified", decidedAt: nowIso(), rejectReason: undefined });
}

/** 데모/BO 대체용: 관리자 반려 → rejected. */
export function rejectExpert(reason?: string) {
  const cur = getExpertAuth();
  save({ ...cur, status: "rejected", decidedAt: nowIso(), rejectReason: reason });
}

/** 데모용: 인증 상태 초기화(미인증). */
export function resetExpertAuth() {
  save(DEFAULT);
}

/**
 * React 훅 — 같은 탭(custom event)/다른 탭(storage)/탭 복귀(focus) 변경을 반영.
 * (App·의견서 화면 등에서 호출해 전문가 인증 상태를 실시간으로 읽는다.)
 */
export function useExpertAuth(): ExpertAuth {
  const [state, setState] = useState<ExpertAuth>(() => getExpertAuth());
  useEffect(() => {
    const sync = () => setState(getExpertAuth());
    const onStorage = (e: StorageEvent) => { if (!e.key || e.key === KEY) sync(); };
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return state;
}
