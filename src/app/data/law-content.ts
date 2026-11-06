// 법령 원문(발췌) — 근거법령 칩 클릭 시 국가법령정보센터 스타일 뷰어(LawViewerPanel)에 노출.
// 프로토타입용 발췌 데이터. 실제 서비스는 국가법령정보센터(law.go.kr) 연계로 대체된다.

export interface LawArticle {
  lawName: string;       // 법령명 (예: 근로기준법)
  articleNo: string;     // 조번호 라벨 (예: 제20조)
  articleTitle: string;  // 조 제목 (예: 위약 예정의 금지)
  enforceDate: string;   // 시행일 (예: 2026. 8. 20.)
  revision: string;      // 개정 정보 (예: 법률 제21373호, 2026. 2. 19., 타법개정)
  ministry?: string;     // 소관 부처/문의 (한 줄, 선택)
  body: string;          // 조문 본문 (빈 줄=문단, whitespace-pre-line)
}

// 근로기준법 소관 부처 연락처(법령 단위 공통) — 국가법령정보센터 표기와 동일
const KGN_MINISTRY =
  "고용노동부(근로기준정책과 - 해고, 취업규칙, 기타), 044-202-7534\n" +
  "고용노동부(근로기준정책과 - 소년), 044-202-7535\n" +
  "고용노동부(근로기준정책과 - 임금), 044-202-7548\n" +
  "고용노동부(여성고용정책과 - 여성), 044-202-7475\n" +
  "고용노동부(임금근로시간정책과 - 근로시간, 휴게), 044-202-7545\n" +
  "고용노동부(임금근로시간정책과 - 휴일, 연차휴가, 유연근로시간제), 044-202-7973\n" +
  "고용노동부(임금근로시간정책과 - 제63조 적용제외, 특례업종), 044-202-7530";

// 키: "법령명 조번호" (예: "근로기준법 제20조")
const LAW_DB: Record<string, LawArticle> = {
  "근로기준법 제2조": {
    lawName: "근로기준법",
    articleNo: "제2조",
    articleTitle: "정의",
    enforceDate: "2026. 8. 20.",
    revision: "법률 제21373호, 2026. 2. 19., 타법개정",
    ministry: KGN_MINISTRY,
    body:
      "① 이 법에서 사용하는 용어의 뜻은 다음과 같다.\n" +
      "1. “근로자”란 직업의 종류와 관계없이 임금을 목적으로 사업이나 사업장에 근로를 제공하는 사람을 말한다.\n" +
      "2. “사용자”란 사업주 또는 사업 경영 담당자, 그 밖에 근로자에 관한 사항에 대하여 사업주를 위하여 행위하는 자를 말한다.\n" +
      "3. “근로”란 정신노동과 육체노동을 말한다.\n" +
      "5. “임금”이란 사용자가 근로의 대가로 근로자에게 임금, 봉급, 그 밖에 어떠한 명칭으로든지 지급하는 모든 금품을 말한다.\n" +
      "② 제1항제6호에 따른 통상임금의 구체적인 범위 등 필요한 사항은 대통령령으로 정한다.",
  },
  "근로기준법 제20조": {
    lawName: "근로기준법",
    articleNo: "제20조",
    articleTitle: "위약 예정의 금지",
    enforceDate: "2026. 8. 20.",
    revision: "법률 제21373호, 2026. 2. 19., 타법개정",
    ministry: KGN_MINISTRY,
    body: "사용자는 근로계약 불이행에 대한 위약금 또는 손해배상액을 예정하는 계약을 체결하지 못한다.",
  },
  "근로기준법 제60조": {
    lawName: "근로기준법",
    articleNo: "제60조",
    articleTitle: "연차 유급휴가",
    enforceDate: "2026. 8. 20.",
    revision: "법률 제21373호, 2026. 2. 19., 타법개정",
    ministry: KGN_MINISTRY,
    body:
      "① 사용자는 1년간 80퍼센트 이상 출근한 근로자에게 15일의 유급휴가를 주어야 한다.\n" +
      "② 사용자는 계속하여 근로한 기간이 1년 미만인 근로자 또는 1년간 80퍼센트 미만 출근한 근로자에게 1개월 개근 시 1일의 유급휴가를 주어야 한다.\n" +
      "④ 사용자는 제1항에 따른 휴가에 3년 이상 계속하여 근로한 근로자에게는 2년마다 1일을 가산한 유급휴가를 주어야 한다. 이 경우 가산휴가를 포함한 총 휴가 일수는 25일을 한도로 한다.",
  },
  "부가가치세법 제48조": {
    lawName: "부가가치세법",
    articleNo: "제48조",
    articleTitle: "예정신고와 납부",
    enforceDate: "2026. 1. 1.",
    revision: "법률 제20610호, 2024. 12. 31., 일부개정",
    ministry: "기획재정부(부가가치세제과) 044-215-4321",
    body:
      "① 사업자는 각 과세기간 중 예정신고기간이 끝난 후 25일 이내에 각 예정신고기간에 대한 과세표준과 납부세액을 납세지 관할 세무서장에게 신고하여야 한다.\n" +
      "③ 납세지 관할 세무서장은 개인사업자와 대통령령으로 정하는 법인사업자에 대해서는 각 예정신고기간마다 직전 과세기간에 대한 납부세액의 50퍼센트를 결정하여 징수한다.\n" +
      "④ 다만, 휴업 또는 사업 부진 등으로 각 예정신고기간의 공급가액 또는 납부세액이 직전 과세기간의 3분의 1에 미달하는 자 등은 예정신고를 하고 납부할 수 있다.",
  },
  "소득세법 제70조의2": {
    lawName: "소득세법",
    articleNo: "제70조의2",
    articleTitle: "성실신고확인서 제출",
    enforceDate: "2026. 1. 1.",
    revision: "법률 제20615호, 2024. 12. 31., 일부개정",
    ministry: "기획재정부(소득세제과) 044-215-4216",
    body:
      "① 성실신고확인대상사업자는 종합소득과세표준 확정신고를 할 때에 비치·기록된 장부와 증명서류에 의하여 계산한 사업소득금액의 적정성을 세무사 등이 확인하고 작성한 확인서(“성실신고확인서”)를 납세지 관할 세무서장에게 제출하여야 한다.\n" +
      "② 성실신고확인대상사업자가 성실신고확인서를 제출하는 경우 종합소득과세표준 확정신고는 그 과세기간의 다음 연도 5월 1일부터 6월 30일까지 하여야 한다.",
  },
};

// "법령명 제N조(…)" 형태의 칩 라벨 → {법령명, 조번호} 파싱.
function parseRef(ref: string): { lawName: string; articleNo: string } {
  const m = ref.match(/(제\d+조(?:의\d+)?)/); // 제48조 / 제70조의2
  if (!m) return { lawName: ref.trim(), articleNo: "" };
  const articleNo = m[1];
  const lawName = ref.slice(0, m.index).trim();
  return { lawName, articleNo };
}

/** 근거법령 칩 라벨로 원문 조회. 미수록이면 파싱된 법령명/조번호로 폴백(본문 안내 문구). */
export function getLawArticle(ref: string): LawArticle {
  const clean = ref.replace(/[「」]/g, "").trim();
  const direct = LAW_DB[clean];
  if (direct) return direct;

  const { lawName, articleNo } = parseRef(clean);
  const keyed = LAW_DB[`${lawName} ${articleNo}`];
  if (keyed) return keyed;

  return {
    lawName: lawName || clean,
    articleNo,
    articleTitle: "",
    enforceDate: "",
    revision: "",
    body: "해당 조문의 원문은 국가법령정보센터(law.go.kr)에서 확인할 수 있어요.",
  };
}
