/**
 * 서비스 운영 콘텐츠 소스 (공지사항 / 긴급 팝업 / 버전 정보).
 *
 * ⚠️ 현재는 임시 정적 소스(드래프트). 추후 **백오피스 또는 원격 config**가
 *    이 모듈의 getter 반환값만 대체하면 됨(무배포 갱신). FE는 이 getter만 의존.
 *    - 운영 전환: getNotices/getEmergency/getServiceVersion 내부를 fetch로 교체
 *    - PE(폐쇄망): 외부 원격 config 불가 → 내부 소스로 공급
 */

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
  // 평시 active:false. 장애 시 백오피스에서 true로 전환(무배포). 데모: URL ?emergency
  emergency: {
    active: false,
    severity: "critical",
    title: "일시적인 서비스 오류 안내",
    message: "현재 일부 기능에서 지연이 발생하고 있습니다. 빠르게 조치 중이니 잠시 후 다시 시도해 주세요.",
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
  return SERVICE_CONTENT.version;
}

export function getEmergency(): Emergency {
  return SERVICE_CONTENT.emergency;
}

export function getNotices(): Notice[] {
  // 최신순 정렬
  return [...SERVICE_CONTENT.notices].sort((a, b) => (a.date < b.date ? 1 : -1));
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
