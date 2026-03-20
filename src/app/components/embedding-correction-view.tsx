import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Database, FileText, Hash, Edit3, Save,
  CheckCircle2, BookOpen, Trash2, Merge, Scissors,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";

// ── 타입 ──────────────────────────────────────────────
interface EmbeddingChunk {
  id: string;
  article: string;
  content: string;
  tokens: number;
  docPage: number; // 원문 문서 페이지 번호
}

export interface EmbeddingCorrectionPolicy {
  id: string;
  name: string;
  category: string;
}

interface EmbeddingCorrectionViewProps {
  policy: EmbeddingCorrectionPolicy;
  onBack: () => void;
}

// ── 목 데이터 ─────────────────────────────────────────
const CHUNKS_PER_PAGE = 4;

const ALL_MOCK_CHUNKS: EmbeddingChunk[] = [
  // Page 1 – 총칙
  { id: "c1",  article: "제1조(목적)",           content: "본 규칙은 회사 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.", tokens: 104, docPage: 1 },
  { id: "c2",  article: "제2조(적용범위)",        content: "직원의 취업에 관하여 법령 또는 근로계약 등에서 별도로 정한 사항 외에는 본 규칙이 정하는 바에 따른다.", tokens: 112, docPage: 1 },
  { id: "c3",  article: "제3조(사원의 정의)",     content: '본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다.', tokens: 78, docPage: 1 },
  { id: "c4",  article: "제4조(채용)",            content: "회사는 필요에 따라 공개채용 또는 특별채용의 방법으로 사원을 채용한다.", tokens: 95, docPage: 1 },
  // Page 2 – 채용
  { id: "c5",  article: "제5조(채용 시 제출서류)", content: "채용이 결정된 자는 회사가 정하는 기간 내에 다음 각 호의 서류를 제출하여야 한다. 1. 이력서 2. 최종학교 졸업증명서 3. 기타 회사가 요구하는 서류", tokens: 138, docPage: 2 },
  { id: "c6",  article: "제6조(수습기간)",        content: "신규 채용된 사원에 대하여는 채용일로부터 3개월 간을 수습기간으로 한다. 단, 경력자의 경우 수습기간을 단축하거나 면제할 수 있다.", tokens: 121, docPage: 2 },
  { id: "c7",  article: "제7조(근로계약)",        content: "회사는 사원을 채용할 때에 다음 각 호의 사항을 명시한 근로계약서를 작성하고 교부하여야 한다. 1. 임금 2. 소정근로시간 3. 휴일 4. 연차 유급휴가", tokens: 145, docPage: 2 },
  { id: "c8",  article: "제8조(복무의무)",        content: "사원은 업무에 관한 지시사항을 성실히 이행하고, 업무상 지득한 기밀을 외부에 누설하지 않으며, 회사의 명예를 훼손하는 행위를 하지 않아야 한다.", tokens: 132, docPage: 2 },
  // Page 3 – 근무시간
  { id: "c9",  article: "제9조(출퇴근)",          content: "사원은 정해진 출근시간 전에 출근하여 업무 준비를 완료하고, 퇴근 시에는 사용한 기기 및 시설을 정리하여야 한다.", tokens: 110, docPage: 3 },
  { id: "c10", article: "제10조(근무시간)",        content: "사원의 소정 근무시간은 1일 8시간, 1주 40시간으로 한다. 단, 업무의 특성에 따라 근무시간을 조정할 수 있다.", tokens: 118, docPage: 3 },
  { id: "c11", article: "제11조(휴게시간)",        content: "사원은 근무시간 중 1시간의 휴게시간을 가진다. 휴게시간은 자유롭게 사용할 수 있다.", tokens: 89, docPage: 3 },
  { id: "c12", article: "제12조(초과근무)",        content: "초과근무는 부서장의 사전 승인을 받아야 하며, 초과근무 수당은 관련 법령에 따라 지급한다.", tokens: 97, docPage: 3 },
  // Page 4 – 휴가
  { id: "c13", article: "제13조(연차유급휴가)",    content: "사원은 1년간 80% 이상 출근한 경우 15일의 유급휴가를 받는다. 3년 이상 계속 근무한 경우 2년마다 1일씩 가산한다.", tokens: 128, docPage: 4 },
  { id: "c14", article: "제14조(병가)",            content: "사원이 업무 외 부상 또는 질병으로 치료가 필요한 경우 연간 최대 30일의 병가를 신청할 수 있다.", tokens: 108, docPage: 4 },
  { id: "c15", article: "제15조(경조사 휴가)",     content: "결혼, 출산, 사망 등 경조사 발생 시 별도 규정에 따른 유급 경조사 휴가를 부여한다.", tokens: 96, docPage: 4 },
  { id: "c16", article: "제16조(육아휴직)",        content: "만 8세 이하 자녀를 둔 사원은 자녀 1인당 최대 1년의 육아휴직을 신청할 수 있으며, 남녀 공히 적용한다.", tokens: 115, docPage: 4 },
  // Page 5 – 임금
  { id: "c17", article: "제17조(임금구성)",        content: "임금은 기본급, 직책수당, 성과급, 복리후생비로 구성하며 매월 지정일에 지급한다.", tokens: 103, docPage: 5 },
  { id: "c18", article: "제18조(임금지급일)",      content: "임금은 매월 25일에 지급하며, 지급일이 휴일인 경우 전일에 지급한다.", tokens: 87, docPage: 5 },
  { id: "c19", article: "제19조(성과급)",          content: "성과급은 반기 또는 연간 실적 평가 결과에 따라 차등 지급하며, 지급 기준은 별도 규정으로 정한다.", tokens: 112, docPage: 5 },
  { id: "c20", article: "제20조(퇴직금)",          content: "1년 이상 계속 근무한 사원이 퇴직하는 경우 근로기준법에 따라 퇴직금을 지급한다.", tokens: 98, docPage: 5 },
  // Page 6 – 복리후생
  { id: "c21", article: "제21조(건강검진)",        content: "회사는 사원에게 연 1회 정기 건강검진을 실시하며, 검진 비용은 회사가 부담한다.", tokens: 94, docPage: 6 },
  { id: "c22", article: "제22조(학자금 지원)",     content: "재직 중인 사원의 자녀 학자금을 회사 지원 규정에 따라 지원할 수 있다.", tokens: 85, docPage: 6 },
  { id: "c23", article: "제23조(경조사 지원)",     content: "결혼, 출산, 사망 등 주요 경조사에 대해 회사는 경조금을 지급하며, 세부 금액은 별도 기준에 따른다.", tokens: 105, docPage: 6 },
  { id: "c24", article: "제24조(사내 동호회)",     content: "회사는 사원의 복지 증진을 위해 사내 동호회 활동을 지원하며, 운영비의 일부를 지원할 수 있다.", tokens: 100, docPage: 6 },
  // Page 7 – 교육
  { id: "c25", article: "제25조(직무교육)",        content: "회사는 사원의 직무 능력 향상을 위해 연간 교육 계획을 수립하고, 필요한 교육을 실시한다.", tokens: 102, docPage: 7 },
  { id: "c26", article: "제26조(외부교육)",        content: "사원이 직무 관련 외부 교육을 수강하고자 할 경우, 부서장의 승인 후 교육비를 지원받을 수 있다.", tokens: 110, docPage: 7 },
  { id: "c27", article: "제27조(신입사원 교육)",   content: "신규 채용 사원은 입사 후 1개월 이내에 회사 문화 및 직무 기초 교육을 이수하여야 한다.", tokens: 99, docPage: 7 },
  { id: "c28", article: "제28조(교육 불참 시 조치)", content: "의무 교육에 불참한 경우 부서장에게 통보하며, 반복 불참 시 인사 고과에 반영될 수 있다.", tokens: 106, docPage: 7 },
  // Page 8 – 징계
  { id: "c29", article: "제29조(징계의 종류)",     content: "징계의 종류는 견책, 감봉, 정직, 강등, 해고로 구분하며, 사안의 경중에 따라 적용한다.", tokens: 103, docPage: 8 },
  { id: "c30", article: "제30조(징계 사유)",       content: "사원이 취업규칙을 위반하거나 직무를 태만히 하는 경우 징계 대상이 될 수 있다.", tokens: 90, docPage: 8 },
  { id: "c31", article: "제31조(징계위원회)",      content: "징계 처분은 인사위원회의 심의를 거쳐 결정하며, 해당 사원에게 소명 기회를 부여하여야 한다.", tokens: 108, docPage: 8 },
  { id: "c32", article: "제32조(이의 신청)",       content: "징계 처분에 이의가 있는 사원은 처분 통보 후 7일 이내에 서면으로 이의를 신청할 수 있다.", tokens: 95, docPage: 8 },
  // Page 9 – 퇴직
  { id: "c33", article: "제33조(퇴직 사유)",       content: "사원이 사직서를 제출하거나 정년에 달한 경우, 또는 해고 처분을 받은 경우 퇴직으로 처리한다.", tokens: 107, docPage: 9 },
  { id: "c34", article: "제34조(사직 절차)",       content: "사원이 퇴직하고자 하는 경우 1개월 전에 사직서를 제출하여야 하며, 업무 인수인계를 성실히 수행하여야 한다.", tokens: 118, docPage: 9 },
  { id: "c35", article: "제35조(정년)",            content: "사원의 정년은 만 60세로 하며, 정년에 달한 날이 속하는 달의 마지막 날을 퇴직일로 한다.", tokens: 97, docPage: 9 },
  { id: "c36", article: "제36조(퇴직 후 의무)",    content: "퇴직한 사원은 재직 중 취득한 회사의 기밀 및 영업 정보를 외부에 유출하여서는 아니 된다.", tokens: 101, docPage: 9 },
  // Page 10 – 부칙
  { id: "c37", article: "제37조(규칙의 해석)",     content: "본 규칙의 해석에 관한 이의가 있는 경우 인사부서의 유권 해석에 따른다.", tokens: 84, docPage: 10 },
  { id: "c38", article: "제38조(개정 절차)",       content: "본 규칙을 개정하고자 할 경우 노사협의회의 심의를 거쳐야 하며, 개정 내용은 즉시 사원에게 공지한다.", tokens: 109, docPage: 10 },
  { id: "c39", article: "제39조(시행일)",          content: "본 규칙은 2024년 1월 1일부터 시행한다.", tokens: 56, docPage: 10 },
  { id: "c40", article: "부칙(경과규정)",          content: "본 규칙 시행 이전에 발생한 사항에 대하여는 종전의 규칙을 적용한다.", tokens: 72, docPage: 10 },
];

// ── 원문 문서 페이지별 목 데이터 ──────────────────────
const MOCK_DOC_PAGES: Record<number, string> = {
  1: `2024 더존비즈온 취업규칙 개정안\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제1장 총 칙\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제1조(목적)\n본 규칙은 주식회사 더존비즈온(이하 "회사"라 한다) 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.\n\n제2조(적용범위)\n직원의 취업에 관하여 법령 또는 근로계약 등에서 별도로 정한 사항 외에는 본 규칙이 정하는 바에 따른다.\n\n제3조(사원의 정의)\n본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다.\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제2장 채용 및 수습\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제4조(채용)\n회사는 필요에 따라 공개채용 또는 특별채용의 방법으로 사원을 채용한다.`,

  2: `제5조(채용 시 제출서류)\n채용이 결정된 자는 회사가 정하는 기간 내에 다음 각 호의 서류를 제출하여야 한다.\n  1. 이력서\n  2. 최종학교 졸업증명서\n  3. 기타 회사가 요구하는 서류\n\n제6조(수습기간)\n신규 채용된 사원에 대하여는 채용일로부터 3개월 간을 수습기간으로 한다. 단, 경력자의 경우 수습기간을 단축하거나 면제할 수 있다.\n\n제7조(근로계약)\n회사는 사원을 채용할 때에 다음 각 호의 사항을 명시한 근로계약서를 작성하고 교부하여야 한다.\n  1. 임금\n  2. 소정근로시간\n  3. 휴일\n  4. 연차 유급휴가\n  5. 취업의 장소와 종사하여야 할 업무에 관한 사항\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제3장 복무\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제8조(복무의무)\n사원은 다음 각 호의 사항을 준수하여야 한다.\n  1. 업무에 관한 지시사항을 성실히 이행할 것\n  2. 업무상 지득한 기밀을 외부에 누설하지 않을 것\n  3. 회사의 명예를 훼손하는 행위를 하지 않을 것\n  4. 직무 이외의 업무를 위하여 회사 시설 및 비품을 무단으로 사용하지 않을 것`,

  3: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제4장 근무시간\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제9조(출퇴근)\n사원은 정해진 출근시간 전에 출근하여 업무 준비를 완료하고, 퇴근 시에는 사용한 기기 및 시설을 정리하여야 한다.\n\n제10조(근무시간)\n사원의 소정 근무시간은 1일 8시간, 1주 40시간으로 한다. 단, 업무의 특성에 따라 근무시간을 조정할 수 있다.\n\n제11조(휴게시간)\n사원은 근무시간 중 1시간의 휴게시간을 가진다. 휴게시간은 자유롭게 사용할 수 있다.\n\n제12조(초과근무)\n초과근무는 부서장의 사전 승인을 받아야 하며, 초과근무 수당은 관련 법령에 따라 지급한다.`,

  4: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제5장 휴가\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제13조(연차유급휴가)\n사원은 1년간 80% 이상 출근한 경우 15일의 유급휴가를 받는다.\n3년 이상 계속 근무한 경우 2년마다 1일씩 가산되며, 최대 25일을 초과할 수 없다.\n\n제14조(병가)\n사원이 업무 외 부상 또는 질병으로 치료가 필요한 경우 연간 최대 30일의 병가를 신청할 수 있다.\n연속 3일 이상 병가 시 의사 진단서를 제출하여야 한다.\n\n제15조(경조사 휴가)\n결혼, 출산, 사망 등 경조사 발생 시 별도 규정에 따른 유급 경조사 휴가를 부여한다.\n\n제16조(육아휴직)\n만 8세 이하 자녀를 둔 사원은 자녀 1인당 최대 1년의 육아휴직을 신청할 수 있으며, 남녀 공히 적용한다.`,

  5: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제6장 임금\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제17조(임금구성)\n임금은 기본급, 직책수당, 성과급, 복리후생비로 구성하며 매월 지정일에 지급한다.\n\n제18조(임금지급일)\n임금은 매월 25일에 지급하며, 지급일이 휴일인 경우 전일에 지급한다.\n\n제19조(성과급)\n성과급은 반기 또는 연간 실적 평가 결과에 따라 차등 지급하며, 지급 기준은 별도 규정으로 정한다.\n\n제20조(퇴직금)\n1년 이상 계속 근무한 사원이 퇴직하는 경우 근로기준법에 따라 퇴직금을 지급한다.\n퇴직연금제도를 운영하는 경우 해당 규정에 따른다.`,

  6: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제7장 복리후생\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제21조(건강검진)\n회사는 사원에게 연 1회 정기 건강검진을 실시하며, 검진 비용은 회사가 부담한다.\n희망자에 한해 종합건강검진을 지원할 수 있으며, 비용 한도는 별도 기준에 따른다.\n\n제22조(학자금 지원)\n재직 중인 사원의 자녀 학자금을 회사 지원 규정에 따라 지원할 수 있다.\n\n제23조(경조사 지원)\n결혼, 출산, 사망 등 주요 경조사에 대해 회사는 경조금을 지급하며, 세부 금액은 별도 기준에 따른다.\n\n제24조(사내 동호회)\n회사는 사원의 복지 증진을 위해 사내 동호회 활동을 지원하며, 운영비의 일부를 지원할 수 있다.`,

  7: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제8장 교육\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제25조(직무교육)\n회사는 사원의 직무 능력 향상을 위해 연간 교육 계획을 수립하고, 필요한 교육을 실시한다.\n\n제26조(외부교육)\n사원이 직무 관련 외부 교육을 수강하고자 할 경우, 부서장의 승인 후 교육비를 지원받을 수 있다.\n지원 한도 및 절차는 교육비 지원 규정에 따른다.\n\n제27조(신입사원 교육)\n신규 채용 사원은 입사 후 1개월 이내에 회사 문화 및 직무 기초 교육을 이수하여야 한다.\n\n제28조(교육 불참 시 조치)\n의무 교육에 불참한 경우 부서장에게 통보하며, 반복 불참 시 인사 고과에 반영될 수 있다.`,

  8: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제9장 징계\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제29조(징계의 종류)\n징계의 종류는 견책, 감봉, 정직, 강등, 해고로 구분하며, 사안의 경중에 따라 적용한다.\n\n제30조(징계 사유)\n사원이 취업규칙을 위반하거나 직무를 태만히 하는 경우 징계 대상이 될 수 있다.\n구체적인 징계 사유는 별도 인사규정에서 정한다.\n\n제31조(징계위원회)\n징계 처분은 인사위원회의 심의를 거쳐 결정하며, 해당 사원에게 소명 기회를 부여하여야 한다.\n\n제32조(이의 신청)\n징계 처분에 이의가 있는 사원은 처분 통보 후 7일 이내에 서면으로 이의를 신청할 수 있다.`,

  9: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n제10장 퇴직\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제33조(퇴직 사유)\n사원이 사직서를 제출하거나 정년에 달한 경우, 또는 해고 처분을 받은 경우 퇴직으로 처리한다.\n\n제34조(사직 절차)\n사원이 퇴직하고자 하는 경우 1개월 전에 사직서를 제출하여야 하며, 업무 인수인계를 성실히 수행하여야 한다.\n\n제35조(정년)\n사원의 정년은 만 60세로 하며, 정년에 달한 날이 속하는 달의 마지막 날을 퇴직일로 한다.\n\n제36조(퇴직 후 의무)\n퇴직한 사원은 재직 중 취득한 회사의 기밀 및 영업 정보를 외부에 유출하여서는 아니 된다.\n비밀유지 의무는 퇴직 후 2년간 유효하다.`,

  10: `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n부 칙\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n제37조(규칙의 해석)\n본 규칙의 해석에 관한 이의가 있는 경우 인사부서의 유권 해석에 따른다.\n\n제38조(개정 절차)\n본 규칙을 개정하고자 할 경우 노사협의회의 심의를 거쳐야 하며, 개정 내용은 즉시 사원에게 공지한다.\n\n제39조(시행일)\n본 규칙은 2024년 1월 1일부터 시행한다.\n\n부칙(경과규정)\n본 규칙 시행 이전에 발생한 사항에 대하여는 종전의 규칙을 적용한다.\n시행 전 진행 중인 징계 절차는 새 규칙에 따라 처리한다.\n\n─────────────────────────────\n문서 작성일: 2024년 1월 1일\n승인: 대표이사\n관리부서: 인사팀\n─────────────────────────────`,
};

const TOTAL_DOC_PAGES = 10;

// ── 헬퍼: 텍스트 내 article 키워드 강조 ────────────────
function highlightArticle(text: string, article: string | null) {
  if (!article) return text;
  // article에서 조항 번호만 추출 (예: "제1조")
  const match = article.match(/제\d+조/);
  if (!match) return text;
  return text; // 하이라이트는 CSS로 처리
}

// ── 메인 컴포넌트 ──────────────────────────────────────
export function EmbeddingCorrectionView({ policy, onBack }: EmbeddingCorrectionViewProps) {
  const [chunks, setChunks] = useState<EmbeddingChunk[]>(ALL_MOCK_CHUNKS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);

  const docRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const totalPages = Math.ceil(chunks.length / CHUNKS_PER_PAGE);
  const pageChunks = chunks.slice((currentPage - 1) * CHUNKS_PER_PAGE, currentPage * CHUNKS_PER_PAGE);

  // 선택된 청크의 docPage
  const selectedChunk = chunks.find((c) => c.id === selectedChunkId);
  const activePage = selectedChunk?.docPage ?? pageChunks[0]?.docPage ?? 1;

  // 청크 선택 시 원문 해당 구절 스크롤
  useEffect(() => {
    if (selectedChunkId && articleRefs.current[selectedChunkId]) {
      articleRefs.current[selectedChunkId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedChunkId]);

  // ── 청크 조작 ────────────────────────────────────────
  const startEditing = (chunkId: string, content: string) => {
    setEditingChunkId(chunkId);
    setEditContent(content);
  };

  const saveEditing = (chunkId: string) => {
    setChunks((prev) => prev.map((c) => (c.id === chunkId ? { ...c, content: editContent } : c)));
    setEditingChunkId(null);
    toast.success("청크 내용이 수정되었습니다.");
  };

  const deleteChunk = (chunkId: string) => {
    setChunks((prev) => prev.filter((c) => c.id !== chunkId));
    if (selectedChunkId === chunkId) setSelectedChunkId(null);
    toast.success("청크가 삭제되었습니다.");
  };

  const mergeChunk = (chunkId: string) => {
    const idx = chunks.findIndex((c) => c.id === chunkId);
    if (idx < 0 || idx >= chunks.length - 1) {
      toast.error("병합할 다음 청크가 없습니다.");
      return;
    }
    const curr = chunks[idx];
    const next = chunks[idx + 1];
    const merged: EmbeddingChunk = {
      ...curr,
      content: `${curr.content}\n\n${next.content}`,
      tokens: curr.tokens + next.tokens,
    };
    setChunks((prev) => {
      const copy = [...prev];
      copy.splice(idx, 2, merged);
      return copy;
    });
    setMergeTargetId(null);
    toast.success(`${curr.article}와 ${next.article}이 병합되었습니다.`);
  };

  const splitChunk = (chunkId: string) => {
    const idx = chunks.findIndex((c) => c.id === chunkId);
    if (idx < 0) return;
    const curr = chunks[idx];
    const mid = Math.floor(curr.content.length / 2);
    const splitPoint = curr.content.indexOf(" ", mid);
    if (splitPoint < 0) {
      toast.error("분해 가능한 위치를 찾지 못했습니다.");
      return;
    }
    const part1 = curr.content.slice(0, splitPoint).trim();
    const part2 = curr.content.slice(splitPoint).trim();
    const newChunks: EmbeddingChunk[] = [
      { ...curr, id: `${curr.id}-a`, content: part1, tokens: Math.ceil(curr.tokens / 2) },
      { ...curr, id: `${curr.id}-b`, article: `${curr.article}(분해)`, content: part2, tokens: Math.floor(curr.tokens / 2) },
    ];
    setChunks((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1, ...newChunks);
      return copy;
    });
    toast.success(`${curr.article}이 2개로 분해되었습니다.`);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("분석 데이터가 저장되었습니다.");
      onBack();
    }, 800);
  };

  // ── 원문 렌더링: 선택 청크 키워드 하이라이트 ────────────
  const renderDocPage = (pageText: string) => {
    if (!selectedChunk) {
      return <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{pageText}</pre>;
    }
    const keyword = selectedChunk.article.match(/제\d+조/)?.[0];
    if (!keyword) {
      return <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{pageText}</pre>;
    }
    const parts = pageText.split(new RegExp(`(${keyword})`, "g"));
    return (
      <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
        {parts.map((part, i) =>
          part === keyword ? (
            <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </pre>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

      {/* ── 상단 헤더 ── */}
      <div className="border-b border-border bg-white px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Button>
            <div className="w-px h-5 bg-gray-200" />
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              문서 분석 상세 결과
            </h1>
            <span className="text-sm text-muted-foreground truncate max-w-[240px]">{policy.name}</span>
          </div>
          <Button
            onClick={handleSaveAll}
            disabled={isSaving}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 flex-shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            {isSaving ? "저장 중..." : "수정 완료"}
          </Button>
        </div>
      </div>

      {/* ── 상단 고정 메타데이터 ── */}
      <div className="border-b border-border bg-white px-6 py-2.5 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-gray-700">카테고리</span>
            <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
              {policy.category}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">총 청크</span>
            <span className="ml-1 font-semibold text-gray-800">{chunks.length}개</span>
          </span>
        </div>
      </div>

      {/* ── 좌우 분할 메인 영역 ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* 좌측: 원문 문서 뷰어 */}
        <div className="w-1/2 flex flex-col border-r border-border bg-white overflow-hidden">
          <div className="px-5 py-2.5 border-b border-gray-100 flex items-center gap-2 flex-shrink-0 bg-gray-50">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">원문 문서</span>
            <span className="ml-auto text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">
              {activePage} / {TOTAL_DOC_PAGES} 페이지
            </span>
          </div>
          <div ref={docRef} className="flex-1 overflow-y-auto px-8 py-6">
            {renderDocPage(MOCK_DOC_PAGES[activePage] ?? "")}
          </div>
          {/* 원문 페이지 네비 */}
          <div className="border-t border-gray-100 px-5 py-2 flex items-center justify-center gap-2 flex-shrink-0 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={activePage <= 1}
              onClick={() => {
                setSelectedChunkId(null);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500">원문 {activePage}페이지</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={activePage >= TOTAL_DOC_PAGES}
              onClick={() => {
                setSelectedChunkId(null);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 우측: 청크 리스트 */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50">
          <div className="px-5 py-2.5 border-b border-gray-200 flex items-center gap-2 flex-shrink-0 bg-gray-50">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">청크 데이터</span>
            <span className="ml-auto text-xs text-gray-400">
              {(currentPage - 1) * CHUNKS_PER_PAGE + 1}–{Math.min(currentPage * CHUNKS_PER_PAGE, chunks.length)} / {chunks.length}개
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {pageChunks.map((chunk, index) => {
              const isSelected = selectedChunkId === chunk.id;
              const isEditing = editingChunkId === chunk.id;
              const globalIndex = (currentPage - 1) * CHUNKS_PER_PAGE + index;

              return (
                <div
                  key={chunk.id}
                  className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
                    isSelected ? "border-blue-400 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => !isEditing && setSelectedChunkId(isSelected ? null : chunk.id)}
                >
                  {/* 청크 헤더 */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">#{globalIndex + 1}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                        {chunk.article}
                      </span>
                      <span className="text-xs text-gray-400">{chunk.tokens}t</span>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      {!isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="수정"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                            onClick={() => startEditing(chunk.id, chunk.content)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="분해"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-purple-600"
                            onClick={() => splitChunk(chunk.id)}
                          >
                            <Scissors className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="병합 (다음 청크와)"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-green-600"
                            onClick={() => mergeChunk(chunk.id)}
                            disabled={globalIndex >= chunks.length - 1}
                          >
                            <Merge className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="삭제"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => deleteChunk(chunk.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditingChunkId(null)}>
                            취소
                          </Button>
                          <Button size="sm" className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => saveEditing(chunk.id)}>
                            <Save className="w-3 h-3 mr-1" />저장
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 청크 내용 */}
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[72px] text-sm p-2.5 border-blue-300 focus-visible:ring-blue-500 bg-blue-50/30"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className={`text-sm leading-relaxed p-2.5 rounded-lg border ${
                      isSelected ? "bg-blue-50/50 border-blue-100 text-blue-900" : "bg-gray-50 border-gray-100 text-gray-700"
                    }`}>
                      {chunk.content}
                    </div>
                  )}

                  {/* 원문 페이지 배지 */}
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-500">
                      <FileText className="w-3 h-3" />
                      원문 {chunk.docPage}페이지에서 발췌
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── 하단 페이지네이션 ── */}
          <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-center gap-2 flex-shrink-0 bg-white">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={currentPage <= 1}
              onClick={() => { setCurrentPage((p) => p - 1); setSelectedChunkId(null); }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); setSelectedChunkId(null); }}
                className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={currentPage >= totalPages}
              onClick={() => { setCurrentPage((p) => p + 1); setSelectedChunkId(null); }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
