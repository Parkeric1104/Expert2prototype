// 큐레이션(체크포인트) — BO 운영 콘텐츠(CUR). 공지와 달리 '전면 노출→클릭→질문 프리필'로 유입·전환 유도.
// 홈에는 상위 일부만 노출하고, '더보기'로 전체 페이지(CurationView)에서 전체 목록을 본다.
// BO(?bo)에서 저장하면 getBOCuration()이 그 값을 반환 → FE 즉시 반영(무배포). 저장값 없으면 기본 세트로 폴백.
// deadline: 마감일(YYYY-MM-DD) — D-day 태그는 오늘 기준 자동 계산(ddayLabel).
import { getBOCuration } from "@/app/bo/bo-store";

export interface CurationItem {
  title: string;
  sub: string;
  deadline: string; // YYYY-MM-DD
  question: string;
  laws: string[];
}

export const CURATION_CAPTION = "체크포인트";

// 기본 세트(BO 미사용 시 폴백). BO 시드(bo-store SEED_CURATION)와 동일 내용.
const DEFAULT_ITEMS: CurationItem[] = [
  { title: "부가세 예정신고 체크리스트",   sub: "11/25 마감",       deadline: "2026-11-25", question: "부가가치세 예정신고 일정과 준비 서류 체크리스트를 알려주세요.",       laws: ["부가가치세법 제48조"] },
  { title: "성실신고확인 대상 판정·준비", sub: "신고 전 준비",     deadline: "2026-12-20", question: "성실신고확인 대상 판정 기준과 준비해야 할 사항을 알려주세요.",       laws: ["소득세법 제70조의2"] },
  { title: "연말정산 대비 노무 이슈",     sub: "통상임금·연차수당", deadline: "2027-01-15", question: "연말정산을 앞두고 통상임금·연차수당 관련 노무 이슈를 정리해 주세요.", laws: ["근로기준법 제2조", "근로기준법 제60조"] },
];

/** 현재 노출 체크포인트 세트 — BO 저장값 우선, 없으면 기본 세트 폴백. */
export function getCurationSet(): { caption: string; items: CurationItem[] } {
  const bo = getBOCuration();
  return { caption: CURATION_CAPTION, items: bo ?? DEFAULT_ITEMS };
}

// 마감일 → D-day 라벨(오늘 기준). 당일=D-DAY.
export function ddayLabel(deadline: string): string {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const due = new Date(deadline + "T00:00:00");
  const diff = Math.round((due.getTime() - today.getTime()) / 86400000);
  return diff <= 0 ? "D-DAY" : `D-${diff}`;
}
