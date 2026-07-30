// 노무 골든셋 (노무사 검증 Q&A 70건) — "노무도우미 골든셋 70(26.07.08).xlsx" 기반.
//
// 출처: 골드셋70_origin(서비스가능여부 Y/N·품질점수) + 골드셋50_최종(판례 보강본)을 순번 기준으로 병합.
//   - 답변          → 채팅 답변 본문
//   - 답변포맷변경   → 의견서(ONEFFICE) 초안 (### 사실관계/질의내용/검토 내용/결론)
//   - 관련법률       → 하단 출처 칩(법령)
//   - 관련판례       → 하단 출처 칩(판례)  "사건번호~선고일자~사건제목"
//   - 참고사례       → 참고 판례 요약
//
// ⚠️ 데이터 갱신 시: 엑셀에서 재추출 후 golden-set.json 을 교체한다(스키마 동일 유지).
//    JSON은 용량이 커(≈680KB) 지연 import로만 로드해 메인 번들에서 분리한다(golden-match.ts 참고).

export interface GoldenPrecedent {
  /** 사건번호 (예: 2004다29736) */
  caseNo: string;
  /** 선고일자 (YYYYMMDD) */
  date: string;
  /** 사건제목/사건명 */
  title: string;
}

export interface GoldenEntry {
  /** 순번(1~70) */
  id: number;
  /** 난이도(상/중/하) */
  difficulty: string;
  /** 분야 */
  field: string;
  /** 질문 전문(괄호 제목 + 시나리오) */
  question: string;
  /** 괄호 안 핵심 제목 (예: "노동법 적용 여부") */
  questionTitle: string;
  /** 채팅 답변 본문 */
  answer: string;
  /** 참고사례(판례 요약) */
  refCases: string;
  /** 관련 법령·조문 */
  laws: string[];
  /** 관련 판례 */
  precedents: GoldenPrecedent[];
  /** 의견서(ONEFFICE) 초안 마크다운 */
  opinionDraft: string;
}

// Vite/esbuild는 JSON import를 네이티브로 처리한다.
import raw from "@/app/data/golden-set.json";

export const GOLDEN_SET: GoldenEntry[] = raw as GoldenEntry[];
