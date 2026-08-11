/**
 * BO(운영 백오피스) 데이터 스토어 — localStorage 기반 프로토타입.
 *
 * BO(?bo)에서 저장하면 서비스 FE(service-content의 getter)가 이 값을 즉시 읽는다(SYS-003 무배포 반영).
 * BO를 한 번도 열지 않아 저장값이 없으면 getter는 null을 반환하고 FE는 기존 정적 소스로 폴백.
 * 실제 서비스 전환 시 이 모듈이 BO API 클라이언트로 대체된다.
 */
import type { Notice, NoticeType, Emergency, EmergencySeverity, ServiceVersion } from "@/app/data/service-content";

// ── 저장 모델 ─────────────────────────────────────────────
export interface BONotice {
  id: string;
  type: NoticeType;
  title: string;          // ≤60자 (NTC-002)
  body: string;           // 제한 없음
  important: boolean;
  views: number;
  createdAt: string;      // YYYY-MM-DD (작성일)
  publishStart?: string;  // YYYY-MM-DDTHH:mm — 미설정 시 상시 노출
  publishEnd?: string;
}

export interface BOPopup {
  id: string;
  title: string;          // ≤30자 (POP-003)
  message: string;        // ≤150자
  severity: EmergencySeverity;
  active: boolean;        // 단일 팝업만 활성(POP-002)
  revision: number;       // 수정/재활성화 시 증가 → '다시 보지 않기' 해제(재노출)
  createdAt: string;
  publishStart?: string;
  publishEnd?: string;
}

const NOTICES_KEY = "bo_notices";
const POPUPS_KEY = "bo_popups";
const VERSION_KEY = "bo_version";

// 최초 진입 시드 — 서비스 정적 소스(service-content)와 동일 내용
const SEED_NOTICES: BONotice[] = [
  {
    id: "n-2026-08-04",
    type: "릴리즈노트",
    title: "v1.4.0 업데이트 — 상단 바로가기·퍼널 계측 개선",
    body: "국세청/사용자 매뉴얼 바로가기를 상단으로 이동하고, 정책 등록 사용성 개선을 위한 계측을 추가했습니다.",
    important: true,
    views: 342,
    createdAt: "2026-08-04",
  },
  {
    id: "n-2026-07-20",
    type: "공지",
    title: "법령 데이터 정기 업데이트 안내",
    body: "최신 개정 법령이 반영되었습니다. 답변은 최신 데이터 기준으로 제공됩니다.",
    important: false,
    views: 517,
    createdAt: "2026-07-20",
  },
  {
    id: "n-2026-07-01",
    type: "릴리즈노트",
    title: "v1.3.0 — 멀티턴 대화·의견서 작성 개선",
    body: "멀티턴 맥락 유지와 의견서 작성 흐름을 개선했습니다.",
    important: false,
    views: 288,
    createdAt: "2026-07-01",
  },
];

const SEED_POPUPS: BOPopup[] = [
  {
    id: "p-2026-08-04",
    title: "서비스 이용 안내",
    message: "세법/노무도우미의 주요 공지를 이곳에서 안내드립니다. 자세한 내용은 사이드패널의 공지사항에서 확인해 주세요.",
    severity: "info",
    active: false,
    revision: 0,
    createdAt: "2026-08-04",
  },
];

const SEED_VERSION: ServiceVersion = { service: "v1.4.0", lawDataUpdatedAt: "2026-08-04" };

// ── 저장/조회 공통 ────────────────────────────────────────
function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

export function todayStr(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}`;
}

/** 게시 기간 판정 — 미설정 시 상시 노출 (NTC-002/POP-003) */
export function inPeriod(start?: string, end?: string, at: number = Date.now()): boolean {
  if (start && at < new Date(start).getTime()) return false;
  if (end && at > new Date(end).getTime()) return false;
  return true;
}

// ── 공지사항 (NTC) ────────────────────────────────────────
export function loadNotices(): BONotice[] {
  const stored = read<BONotice[]>(NOTICES_KEY);
  if (stored) return stored;
  write(NOTICES_KEY, SEED_NOTICES);
  return SEED_NOTICES;
}

export function saveNotice(n: BONotice) {
  const list = loadNotices();
  const idx = list.findIndex((x) => x.id === n.id);
  if (idx >= 0) list[idx] = n;
  else list.unshift(n);
  write(NOTICES_KEY, list);
}

export function deleteNotice(id: string) {
  write(NOTICES_KEY, loadNotices().filter((n) => n.id !== id));
}

export type NoticeStatus = "게시중" | "예약" | "종료";

export function noticeStatus(n: BONotice, at: number = Date.now()): NoticeStatus {
  if (n.publishStart && at < new Date(n.publishStart).getTime()) return "예약";
  if (n.publishEnd && at > new Date(n.publishEnd).getTime()) return "종료";
  return "게시중";
}

// ── 공지팝업 (POP) ────────────────────────────────────────
export function loadPopups(): BOPopup[] {
  const stored = read<BOPopup[]>(POPUPS_KEY);
  if (stored) return stored;
  write(POPUPS_KEY, SEED_POPUPS);
  return SEED_POPUPS;
}

/** 저장. 기존 항목 수정 시 revision 증가 → '다시 보지 않기' 사용자에게도 재노출(POP-003) */
export function savePopup(p: BOPopup) {
  const list = loadPopups();
  const idx = list.findIndex((x) => x.id === p.id);
  if (idx >= 0) list[idx] = { ...p, revision: list[idx].revision + 1 };
  else list.unshift(p);
  write(POPUPS_KEY, list);
}

export function deletePopup(id: string) {
  write(POPUPS_KEY, loadPopups().filter((p) => p.id !== id));
}

/** 활성/비활성 전환 — 단일 팝업만 노출 가능하므로 활성화 시 나머지는 자동 비활성(POP-002).
 *  활성화도 새 노출로 간주해 revision 증가(재노출). */
export function setPopupActive(id: string, active: boolean) {
  const list = loadPopups().map((p) => {
    if (p.id === id) return { ...p, active, revision: active ? p.revision + 1 : p.revision };
    return active ? { ...p, active: false } : p;
  });
  write(POPUPS_KEY, list);
}

export type PopupStatus = "노출중" | "예약" | "종료" | "비활성";

export function popupStatus(p: BOPopup, at: number = Date.now()): PopupStatus {
  if (!p.active) return "비활성";
  if (p.publishStart && at < new Date(p.publishStart).getTime()) return "예약";
  if (p.publishEnd && at > new Date(p.publishEnd).getTime()) return "종료";
  return "노출중";
}

// ── 버전정보 (VER) ────────────────────────────────────────
export function loadVersion(): ServiceVersion {
  const stored = read<ServiceVersion>(VERSION_KEY);
  if (stored) return stored;
  write(VERSION_KEY, SEED_VERSION);
  return SEED_VERSION;
}

export function saveVersion(v: ServiceVersion) {
  write(VERSION_KEY, v);
}

// ── 서비스 FE 공급 (service-content getter가 호출) ─────────
/** BO 저장값 기준 현재 노출 대상 공지. BO 미사용(저장값 없음) 시 null → 정적 소스 폴백 */
export function getBOVisibleNotices(): Notice[] | null {
  const stored = read<BONotice[]>(NOTICES_KEY);
  if (!stored) return null;
  return stored
    .filter((n) => inPeriod(n.publishStart, n.publishEnd))
    .map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      date: n.createdAt,
      important: n.important || undefined,
      views: n.views,
    }));
}

/** BO 저장값 기준 현재 노출 팝업(활성 + 기간 내). BO 미사용 시 null → 정적 소스 폴백 */
export function getBOEmergency(): Emergency | null {
  const stored = read<BOPopup[]>(POPUPS_KEY);
  if (!stored) return null;
  const shown = stored.find((p) => p.active && inPeriod(p.publishStart, p.publishEnd));
  if (!shown) return { active: false, severity: "info", title: "", message: "" };
  return {
    active: true,
    severity: shown.severity,
    title: shown.title,
    message: shown.message,
    popupId: shown.id,
    revision: shown.revision,
  };
}

export function getBOVersion(): ServiceVersion | null {
  return read<ServiceVersion>(VERSION_KEY);
}
