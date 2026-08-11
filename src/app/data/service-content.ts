/**
 * 서비스 운영 콘텐츠 소스 (공지사항 / 긴급 팝업 / 버전 정보).
 *
 * 프로토타입: BO(운영 백오피스, URL ?bo)가 localStorage에 저장한 값을 getter가
 * 우선 읽고, BO 저장값이 없으면 아래 정적 소스로 폴백(무배포 반영 SYS-003 데모).
 * 운영 전환 시 getter 내부만 BO API fetch로 교체하면 됨 — FE는 이 getter만 의존.
 */
import { getBOVisibleNotices, getBOEmergency, getBOVersion } from "@/app/bo/bo-store";

export type NoticeType = "공지" | "릴리즈노트";
export interface Notice {
  id: string;
  type: NoticeType;
  title: string;
  body: string;
  date: string;        // YYYY-MM-DD (작성일)
  important?: boolean;
  views?: number;      // 조회수 — 실제 서비스는 백오피스/백엔드 집계값
}

export type EmergencySeverity = "info" | "warning" | "critical";
export interface Emergency {
  active: boolean;
  severity: EmergencySeverity;
  title: string;
  message: string;
  popupId?: string;  // BO 관리 팝업 id
  revision?: number; // BO에서 수정/재활성화 시 증가 — '다시 보지 않기' 해제 기준(POP-003)
}

export interface ServiceVersion {
  service: string;          // 예: v1.4.0
  lawDataUpdatedAt: string; // 법령 데이터 마지막 갱신일 YYYY-MM-DD
}

const SERVICE_CONTENT: {
  version: ServiceVersion;
  emergency: Emergency;
  notices: Notice[];
} = {
  version: {
    service: "v1.4.0",
    lawDataUpdatedAt: "2026-08-04",
  },
  // 메인 중앙 공지 팝업(SVC-002). 평시 active:false, 백오피스에서 노출 제어(무배포). 데모: 기능메뉴 '공지 팝업' 또는 URL ?emergency
  emergency: {
    active: false,
    severity: "info",
    title: "서비스 이용 안내",
    message: "세법/노무도우미의 주요 공지를 이곳에서 안내드립니다. 자세한 내용은 사이드패널의 공지사항에서 확인해 주세요.",
  },
  notices: [
    {
      id: "n-2026-08-04",
      type: "릴리즈노트",
      title: "v1.4.0 업데이트 — 상단 바로가기·퍼널 계측 개선",
      body: "국세청/사용자 매뉴얼 바로가기를 상단으로 이동하고, 정책 등록 사용성 개선을 위한 계측을 추가했습니다.",
      date: "2026-08-04",
      important: true,
      views: 342,
    },
    {
      id: "n-2026-07-20",
      type: "공지",
      title: "법령 데이터 정기 업데이트 안내",
      body: "최신 개정 법령이 반영되었습니다. 답변은 최신 데이터 기준으로 제공됩니다.",
      date: "2026-07-20",
      views: 517,
    },
    {
      id: "n-2026-07-01",
      type: "릴리즈노트",
      title: "v1.3.0 — 멀티턴 대화·의견서 작성 개선",
      body: "멀티턴 맥락 유지와 의견서 작성 흐름을 개선했습니다.",
      date: "2026-07-01",
      views: 288,
    },
  ],
};

export function getServiceVersion(): ServiceVersion {
  return getBOVersion() ?? SERVICE_CONTENT.version;
}

export function getEmergency(): Emergency {
  return getBOEmergency() ?? SERVICE_CONTENT.emergency;
}

export function getNotices(): Notice[] {
  // BO 저장값(게시 기간 내 공지만) 우선, 없으면 정적 소스 — 최신순 정렬
  const list = getBOVisibleNotices() ?? SERVICE_CONTENT.notices;
  return [...list].sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ── 공지 읽음 처리(localStorage) ─────────────────────────
const READ_KEY = "read_notice_ids";

function readIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(READ_KEY) || "[]");
  } catch {
    return [];
  }
}

export function getUnreadCount(): number {
  const read = new Set(readIds());
  return getNotices().filter((n) => !read.has(n.id)).length;
}

export function isNoticeRead(id: string): boolean {
  return readIds().includes(id);
}

export function markAllNoticesRead() {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(getNotices().map((n) => n.id)));
  } catch {
    /* noop */
  }
}
