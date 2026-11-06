// 큐레이션(체크포인트) — BO 운영 콘텐츠(CUR). 공지와 달리 '전면 노출→클릭→질문 프리필'로 유입·전환 유도.
// 홈에는 상위 일부만 노출하고, '더보기'로 전체 페이지(CurationView)에서 전체 목록을 본다.
// BO(?bo)에서 저장하면 getBOCuration()이 그 값을 반환 → FE 즉시 반영(무배포). 저장값 없으면 기본 세트로 폴백.
// deadline: 마감일(YYYY-MM-DD) — D-day 태그는 오늘 기준 자동 계산(ddayLabel).
import { getBOCuration } from "@/app/bo/bo-store";

export interface CurationItem {
  title: string;
  sub: string;
  deadline: string; // YYYY-MM-DD
  body: string;     // 상세 본문(설명) — 체크포인트 상세 화면에 노출. 공지 상세와 동일 구조.
  question: string;
  laws: string[];
}

export const CURATION_CAPTION = "체크포인트";

// 기본 세트(BO 미사용 시 폴백). BO 시드(bo-store SEED_CURATION)와 동일 내용.
const DEFAULT_ITEMS: CurationItem[] = [
  {
    title: "부가세 예정신고 체크리스트",
    sub: "11/25 마감",
    deadline: "2026-11-25",
    body: "법인 사업자는 제2기 예정신고·납부(예정신고 기간분)를 준비해야 합니다. 직전 과세기간 납부세액의 50%가 예정고지되지만, 휴업·사업 부진 등으로 공급가액 또는 납부세액이 직전 기의 1/3에 미달하면 예정신고로 전환할 수 있습니다.\n\n신고 전 매입세금계산서 수취 여부와 매입세액 공제 요건, 영세율·면세 매출 구분을 미리 점검하세요.",
    question: "부가가치세 예정신고 일정과 준비 서류 체크리스트를 알려주세요.",
    laws: ["부가가치세법 제48조"],
  },
  {
    title: "성실신고확인 대상 판정·준비",
    sub: "신고 전 준비",
    deadline: "2026-12-20",
    body: "업종별 수입금액 기준(예: 도소매업 15억, 제조·음식·숙박업 7.5억, 서비스업 5억 원 이상)을 넘으면 성실신고확인 대상입니다. 대상이 되면 종합소득세 신고기한이 다음 해 6월 30일까지 연장되고, 세무대리인이 작성한 성실신고확인서를 함께 제출해야 합니다.\n\n대상 여부를 먼저 판정하고, 수입·비용 증빙과 확인 항목을 미리 준비하세요.",
    question: "성실신고확인 대상 판정 기준과 준비해야 할 사항을 알려주세요.",
    laws: ["소득세법 제70조의2"],
  },
  {
    title: "연말정산 대비 노무 이슈",
    sub: "통상임금·연차수당",
    deadline: "2027-01-15",
    body: "연말정산을 앞두고 통상임금의 범위(정기성·일률성·고정성)와 연차미사용수당의 임금성 판단이 자주 문제됩니다. 상여·각종 수당의 통상임금 포함 여부에 따라 연장·야간·휴일근로수당과 퇴직금 산정액이 달라집니다.\n\n임금체계를 미리 점검해 과소·과다 지급을 예방하세요.",
    question: "연말정산을 앞두고 통상임금·연차수당 관련 노무 이슈를 정리해 주세요.",
    laws: ["근로기준법 제2조", "근로기준법 제60조"],
  },
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
