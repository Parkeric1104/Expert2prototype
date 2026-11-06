/**
 * BO(운영 백오피스) 데이터 스토어 — localStorage 기반 프로토타입.
 *
 * BO(?bo)에서 저장하면 서비스 FE(service-content의 getter)가 이 값을 즉시 읽는다(SYS-003 무배포 반영).
 * BO를 한 번도 열지 않아 저장값이 없으면 getter는 null을 반환하고 FE는 기존 정적 소스로 폴백.
 * 실제 서비스 전환 시 이 모듈이 BO API 클라이언트로 대체된다.
 */
import type { Notice, NoticeType, Emergency, EmergencySeverity, ServiceVersion } from "@/app/data/service-content";
import type { CurationItem } from "@/app/data/curation";

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

// ── 체크포인트/큐레이션 (CUR) ─────────────────────────────
export interface BOCuration {
  id: string;
  title: string;      // ≤40 (CUR-002)
  sub: string;        // ≤30 부제(상태/마감 라벨)
  deadline: string;   // YYYY-MM-DD — D-day 태그 자동 계산 기준(DDY)
  question: string;   // 클릭 시 시작되는 질문
  laws: string[];     // 근거 법령
  active: boolean;    // 노출 여부
  createdAt: string;
  publishStart?: string;
  publishEnd?: string;
}

const CURATION_KEY = "bo_curation";

// 최초 진입 시드 — FE 정적 소스(data/curation)와 동일 내용
const SEED_CURATION: BOCuration[] = [
  { id: "c-1", title: "부가세 예정신고 체크리스트",   sub: "11/25 마감",       deadline: "2026-11-25", question: "부가가치세 예정신고 일정과 준비 서류 체크리스트를 알려주세요.",       laws: ["부가가치세법 제48조"],                active: true, createdAt: "2026-10-20" },
  { id: "c-2", title: "성실신고확인 대상 판정·준비", sub: "신고 전 준비",     deadline: "2026-12-20", question: "성실신고확인 대상 판정 기준과 준비해야 할 사항을 알려주세요.",       laws: ["소득세법 제70조의2"],                active: true, createdAt: "2026-10-20" },
  { id: "c-3", title: "연말정산 대비 노무 이슈",     sub: "통상임금·연차수당", deadline: "2027-01-15", question: "연말정산을 앞두고 통상임금·연차수당 관련 노무 이슈를 정리해 주세요.", laws: ["근로기준법 제2조", "근로기준법 제60조"], active: true, createdAt: "2026-10-20" },
];

export function loadCuration(): BOCuration[] {
  const stored = read<BOCuration[]>(CURATION_KEY);
  if (stored) return stored;
  write(CURATION_KEY, SEED_CURATION);
  return SEED_CURATION;
}

export function saveCuration(c: BOCuration) {
  const list = loadCuration();
  const idx = list.findIndex((x) => x.id === c.id);
  if (idx >= 0) list[idx] = c;
  else list.unshift(c);
  write(CURATION_KEY, list);
}

export function deleteCuration(id: string) {
  write(CURATION_KEY, loadCuration().filter((c) => c.id !== id));
}

export type CurationStatus = "노출중" | "예약" | "종료" | "비활성";

export function curationStatus(c: BOCuration, at: number = Date.now()): CurationStatus {
  if (!c.active) return "비활성";
  if (c.publishStart && at < new Date(c.publishStart).getTime()) return "예약";
  if (c.publishEnd && at > new Date(c.publishEnd).getTime()) return "종료";
  return "노출중";
}

// ── 계정 (ACC-001~005) ────────────────────────────────────
export type BORole = "admin" | "operator";
export interface BOAccount {
  id: string;
  loginId: string;   // 중복 불가
  name: string;
  password: string;  // 프로토타입: 평문 저장(운영 전환 시 서버 해시)
  role: BORole;      // admin=계정관리 포함 전체 / operator=콘텐츠 관리만
  createdAt: string;
  lastLoginAt?: string; // YYYY-MM-DD HH:mm
  mustChangePassword?: boolean; // 초기 비밀번호(0000) 상태 — 최초 로그인 시 변경 강제(ACC-006)
}

/** 계정 생성·초기화 시 부여되는 초기 비밀번호 (ACC-006) */
export const DEFAULT_PASSWORD = "0000";

/** 비밀번호 규칙(초안): 8자 이상, 영문+숫자+특수문자 포함. 위반 시 오류 메시지, 통과 시 null */
export function validatePassword(pw: string): string | null {
  if (pw.length < 8) return "비밀번호는 8자 이상이어야 해요.";
  if (!/[a-zA-Z]/.test(pw)) return "영문자를 1자 이상 포함해야 해요.";
  if (!/[0-9]/.test(pw)) return "숫자를 1자 이상 포함해야 해요.";
  if (!/[^a-zA-Z0-9]/.test(pw)) return "특수문자를 1자 이상 포함해야 해요.";
  return null;
}

/** 비밀번호 변경(최초 로그인 변경 포함) — 변경 강제 플래그 해제 */
export function changePassword(accountId: string, newPassword: string): BOAccount | null {
  const acc = loadAccounts().find((a) => a.id === accountId);
  if (!acc) return null;
  const updated = { ...acc, password: newPassword, mustChangePassword: false };
  saveAccount(updated);
  return updated;
}

const ACCOUNTS_KEY = "bo_accounts";
const SESSION_KEY = "bo_session"; // 로그인된 loginId — 기본 sessionStorage(브라우저 세션), 자동 로그인 시 localStorage에도 저장
const REMEMBER_KEY = "bo_saved_login_id"; // '아이디 저장' 체크 시 로그인 ID 기억

const SEED_ACCOUNTS: BOAccount[] = [
  { id: "a-admin", loginId: "admin", name: "박대웅", password: "expert2!", role: "admin", createdAt: "2026-08-04" },
  { id: "a-op", loginId: "operator", name: "운영자", password: "expert2!", role: "operator", createdAt: "2026-08-04" },
];

export function loadAccounts(): BOAccount[] {
  const stored = read<BOAccount[]>(ACCOUNTS_KEY);
  if (stored) return stored;
  write(ACCOUNTS_KEY, SEED_ACCOUNTS);
  return SEED_ACCOUNTS;
}

export function saveAccount(a: BOAccount) {
  const list = loadAccounts();
  const idx = list.findIndex((x) => x.id === a.id);
  if (idx >= 0) list[idx] = a;
  else list.unshift(a);
  write(ACCOUNTS_KEY, list);
}

export function deleteAccount(id: string) {
  write(ACCOUNTS_KEY, loadAccounts().filter((a) => a.id !== id));
}

export function isLoginIdTaken(loginId: string, exceptId?: string): boolean {
  return loadAccounts().some((a) => a.loginId === loginId && a.id !== exceptId);
}

/** 로그인(ACC-001) — 성공 시 세션 저장 + 최근 접속 갱신.
 *  autoLogin: true면 localStorage에도 저장(브라우저 재시작 후에도 유지), false면 브라우저 세션 동안만 */
export function login(loginId: string, password: string, opts?: { autoLogin?: boolean }): BOAccount | null {
  const acc = loadAccounts().find((a) => a.loginId === loginId && a.password === password);
  if (!acc) return null;
  const updated = { ...acc, lastLoginAt: nowDT() };
  saveAccount(updated);
  try {
    sessionStorage.setItem(SESSION_KEY, acc.loginId);
    if (opts?.autoLogin) localStorage.setItem(SESSION_KEY, acc.loginId);
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* noop */ }
  return updated;
}

export function logout() {
  try {
    sessionStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(SESSION_KEY);
  } catch { /* noop */ }
}

export function currentAccount(): BOAccount | null {
  try {
    const loginId = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY); // 자동 로그인 폴백
    if (!loginId) return null;
    return loadAccounts().find((a) => a.loginId === loginId) ?? null;
  } catch {
    return null;
  }
}

// '아이디 저장' (로그인정보 저장)
export function getSavedLoginId(): string {
  try { return localStorage.getItem(REMEMBER_KEY) ?? ""; } catch { return ""; }
}

export function setSavedLoginId(loginId: string | null) {
  try {
    if (loginId) localStorage.setItem(REMEMBER_KEY, loginId);
    else localStorage.removeItem(REMEMBER_KEY);
  } catch { /* noop */ }
}

// ── 버전정보 (VER) ────────────────────────────────────────
/** 변경 이력 항목 — 시각·행위자(로그인 계정, ACC-005)·변경 내용 기록(LOG-001) */
export interface BOVersionLog {
  id: string;
  changedAt: string; // YYYY-MM-DD HH:mm
  service: string;
  lawDataUpdatedAt: string;
  changed: ("service" | "lawDataUpdatedAt")[]; // 빈 배열 = 최초 등록
  by?: string; // 행위자(계정 이름) — 계정 도입 전 이력은 없음
}

const VERSION_LOG_KEY = "bo_version_log";

function nowDT(): string {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function loadVersion(): ServiceVersion {
  const stored = read<ServiceVersion>(VERSION_KEY);
  if (stored) return stored;
  write(VERSION_KEY, SEED_VERSION);
  return SEED_VERSION;
}

export function loadVersionLog(): BOVersionLog[] {
  const stored = read<BOVersionLog[]>(VERSION_LOG_KEY);
  if (stored) return stored;
  // 자동 기록 시뮬레이션 — 배포 파이프라인/법령 적재 배치가 기록한 이력(VER-001/002, 운영 수동 등록 없음)
  const seed: BOVersionLog[] = [
    { id: "vl-3", changedAt: "2026-08-04 09:12", service: "v1.4.0", lawDataUpdatedAt: "2026-08-04", changed: ["service"], by: "system(배포)" },
    { id: "vl-2", changedAt: "2026-08-04 07:00", service: "v1.3.0", lawDataUpdatedAt: "2026-08-04", changed: ["lawDataUpdatedAt"], by: "system(법령 배치)" },
    { id: "vl-1", changedAt: "2026-07-01 09:00", service: "v1.3.0", lawDataUpdatedAt: "2026-07-01", changed: [], by: "system(배포)" },
  ];
  write(VERSION_LOG_KEY, seed);
  return seed;
}

/** 버전 기록 — 운영 수동 등록 없음(VER-003 조회 전용). 파이프라인(/api/internal/version) 자동 기록의 시뮬레이션용으로만 유지 */
export function saveVersion(v: ServiceVersion) {
  const prev = loadVersion();
  const changed: BOVersionLog["changed"] = [];
  if (v.service !== prev.service) changed.push("service");
  if (v.lawDataUpdatedAt !== prev.lawDataUpdatedAt) changed.push("lawDataUpdatedAt");
  write(VERSION_KEY, v);
  write(VERSION_LOG_KEY, [{ id: newId("vl"), changedAt: nowDT(), ...v, changed, by: currentAccount()?.name }, ...loadVersionLog()]);
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

/** BO 저장값 기준 현재 노출 체크포인트(활성 + 기간 내, 마감일 임박순). BO 미사용 시 null → 정적 소스 폴백 */
export function getBOCuration(): CurationItem[] | null {
  const stored = read<BOCuration[]>(CURATION_KEY);
  if (!stored) return null;
  return stored
    .filter((c) => c.active && inPeriod(c.publishStart, c.publishEnd))
    .sort((a, b) => (a.deadline < b.deadline ? -1 : 1))
    .map((c) => ({ title: c.title, sub: c.sub, deadline: c.deadline, question: c.question, laws: c.laws }));
}
