// 채팅 이력 더미 데이터 — 추천질문 4가지 프로세스 유형별로 1건씩 구성 (2026-07-06)
//  유형1 간단·단일 / 유형2 간단·다중 / 유형3 상세·단일 / 유형4 상세·다중
// 각 세션은 turn 목록으로 대화를 재현한다. AI 답변의 enhancedData는 채팅 화면에서
// basedOn(또는 직전 사용자 질문) 기준으로 생성되어 '이전 대화 그대로' 복원된다.

export interface HistoryTurn {
  role: "user" | "ai";
  /** role=user일 때 질문 텍스트 */
  text?: string;
  /** role=ai일 때 답변 유형 */
  answerType?: "simple" | "enhanced" | "multiturn";
  /** ai 답변의 근거 질문(enhancedData 생성 키워드). 없으면 직전 사용자 질문 사용 */
  basedOn?: string;
}

export interface ChatHistorySession {
  id: string;
  title: string;
  date: string;
  category: string;
  contextType: "single" | "multi";
  answerTrack: "simple" | "detailed";
  turns: HistoryTurn[];
  // ── 사이드바 카드 표시용 ──
  initialQuestion: string;
  summary: string;
  laws: string[];
  hasDocument: boolean;
  documentName?: string;
}

export const CHAT_HISTORY: ChatHistorySession[] = [
  // ── 유형1: 간단답변 · 단일 맥락 ──
  {
    id: "h1",
    title: "연차휴가 사용 사유 고지 의무 검토",
    date: "2026-02-24",
    category: "휴가 · 휴직",
    contextType: "single",
    answerTrack: "simple",
    turns: [
      { role: "user", text: "연차휴가를 쓸 때 회사에 사유를 밝혀야 하나요?" },
      { role: "ai", answerType: "simple" },
      { role: "user", text: "그럼 반차도 사유 없이 쓸 수 있나요?" },
      { role: "ai", answerType: "multiturn" },
    ],
    initialQuestion: "연차휴가를 쓸 때 회사에 사유를 밝혀야 하나요?",
    summary: "연차휴가는 근로자가 자유롭게 사용할 수 있는 권리로, 사용 사유를 밝힐 의무가 없습니다.",
    laws: ["근로기준법 제60조"],
    hasDocument: false,
  },

  // ── 유형2: 간단답변 · 다중 맥락 ──
  {
    id: "h2",
    title: "포괄임금제 운영과 퇴직금 중간정산 문의",
    date: "2026-02-23",
    category: "임금 · 퇴직금",
    contextType: "multi",
    answerTrack: "simple",
    turns: [
      { role: "user", text: "포괄임금제와 고정OT제는 어떻게 다른가요?" },
      { role: "ai", answerType: "simple" },
      { role: "user", text: "포괄임금제도 연장근로수당을 따로 정산해야 하나요?", basedOn: "포괄임금제 연장근로수당" },
      { role: "ai", answerType: "multiturn", basedOn: "포괄임금제 연장근로수당" },
      { role: "user", text: "퇴직금 중간정산은 언제 가능한가요?", basedOn: "퇴직금 중간정산" },
      { role: "ai", answerType: "multiturn", basedOn: "퇴직금 중간정산" },
    ],
    initialQuestion: "포괄임금제와 고정OT제는 어떻게 다른가요?",
    summary: "포괄임금제와 고정OT제의 차이, 그리고 퇴직금 중간정산 허용 사유를 함께 검토했습니다.",
    laws: ["근로기준법 제56조", "근로자퇴직급여 보장법 제8조"],
    hasDocument: false,
  },

  // ── 유형3: 상세답변 · 단일 맥락 ──
  {
    id: "h3",
    title: "전직금지약정의 효력 및 위반 시 책임 검토",
    date: "2026-02-22",
    category: "근로계약",
    contextType: "single",
    answerTrack: "detailed",
    turns: [
      { role: "user", text: "퇴직 후 동종업체 취업을 금지하는 전직금지약정도 효력이 있나요?" },
      { role: "ai", answerType: "enhanced" },
      { role: "user", text: "약정을 위반하면 손해배상 범위는 어떻게 되나요?", basedOn: "전직금지약정 위반 손해배상" },
      { role: "ai", answerType: "multiturn", basedOn: "전직금지약정 위반 손해배상" },
    ],
    initialQuestion: "퇴직 후 동종업체 취업을 금지하는 전직금지약정도 효력이 있나요?",
    summary: "전직금지약정은 정당한 이익·합리적 범위·적절한 보상이 전제될 때 유효합니다.",
    laws: ["근로기준법 제15조", "대법원 2009다82244 판결"],
    hasDocument: true,
    documentName: "전직금지약정_효력_법률검토의견서.pdf",
  },

  // ── 유형4: 상세답변 · 다중 맥락 ──
  {
    id: "h4",
    title: "구내식당 이동 중 사고 산재 및 연차수당 검토",
    date: "2026-02-21",
    category: "산업재해 · 안전보건",
    contextType: "multi",
    answerTrack: "detailed",
    turns: [
      { role: "user", text: "점심시간에 회사 구내식당으로 이동하다 계단에서 다쳤는데 산재로 인정되나요?" },
      { role: "ai", answerType: "enhanced" },
      { role: "user", text: "휴게시간 중 발생한 사고도 업무상 재해로 인정되나요?", basedOn: "휴게시간 재해 인정" },
      { role: "ai", answerType: "multiturn", basedOn: "휴게시간 재해 인정" },
      { role: "user", text: "퇴직 시 미사용 연차휴가 수당은 어떻게 계산하나요?", basedOn: "연차휴가 미사용 수당" },
      { role: "ai", answerType: "multiturn", basedOn: "연차휴가 미사용 수당" },
    ],
    initialQuestion: "점심시간에 회사 구내식당으로 이동하다 계단에서 다쳤는데 산재로 인정되나요?",
    summary: "구내식당 이동 중 사고의 업무상 재해 인정 가능성과 미사용 연차수당 계산을 검토했습니다.",
    laws: ["산업재해보상보험법 제37조", "근로기준법 제60조"],
    hasDocument: true,
    documentName: "구내식당_사고_산재_법률검토의견서.pdf",
  },

  // ── 혼합 케이스: 간단답변(1) + 멀티턴(2) + 상세답변(3) ──
  {
    id: "h5",
    title: "연차·임금·퇴직금 종합 상담 이력",
    date: "2026-02-20",
    category: "휴가 · 휴직",
    contextType: "multi",
    answerTrack: "simple",
    turns: [
      // 간단답변
      { role: "user", text: "연차휴가를 쓸 때 회사에 사유를 밝혀야 하나요?" },
      { role: "ai", answerType: "simple" },
      // 멀티턴 ×2
      { role: "user", text: "그럼 반차도 사유 없이 쓸 수 있나요?", basedOn: "연차 반차 사유" },
      { role: "ai", answerType: "multiturn", basedOn: "연차 반차 사유" },
      { role: "user", text: "연차를 미리 당겨서 사용할 수도 있나요?", basedOn: "연차 선사용" },
      { role: "ai", answerType: "multiturn", basedOn: "연차 선사용" },
      // 상세답변 ×3
      { role: "user", text: "퇴직 시 미사용 연차휴가 수당은 어떻게 계산하나요?", basedOn: "연차휴가 미사용 수당" },
      { role: "ai", answerType: "enhanced", basedOn: "연차휴가 미사용 수당" },
      { role: "user", text: "포괄임금제에서도 연장근로수당을 따로 지급해야 하나요?", basedOn: "포괄임금제 연장근로수당" },
      { role: "ai", answerType: "enhanced", basedOn: "포괄임금제 연장근로수당" },
      { role: "user", text: "퇴직금 중간정산은 언제 가능한가요?", basedOn: "퇴직금 중간정산" },
      { role: "ai", answerType: "enhanced", basedOn: "퇴직금 중간정산" },
    ],
    initialQuestion: "연차휴가를 쓸 때 회사에 사유를 밝혀야 하나요?",
    summary: "연차 사용 사유 고지 의무부터 미사용 연차수당·포괄임금·퇴직금 중간정산까지 상세 검토했습니다.",
    laws: ["근로기준법 제60조", "근로기준법 제56조", "근로자퇴직급여 보장법 제8조"],
    hasDocument: true,
    documentName: "연차_임금_퇴직금_종합_법률검토의견서.pdf",
  },
];

export const getHistorySession = (id: string): ChatHistorySession | undefined =>
  CHAT_HISTORY.find((s) => s.id === id);
