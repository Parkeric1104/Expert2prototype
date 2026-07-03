import { SourcesAndHistoryPanel } from "@/app/components/sources-and-history-panel";
import { useState, useRef, useEffect } from "react";
import { ChatBubble } from "@/app/components/chat-bubble";
import { UserMessageBubble } from "@/app/components/user-message-bubble";
import { ProgressiveLoadingBubble } from "@/app/components/progressive-loading";
import { InlineDetailedAnswer } from "@/app/components/inline-detailed-answer";
import { AIOpinionDebatePanel } from "@/app/components/ai-opinion-debate-panel";
import { OpinionTopicBottomSheet } from "@/app/components/opinion-topic-bottom-sheet";
import { SimpleResponseCard } from "@/app/components/simple-response-card";
import { MultiTurnResponse } from "@/app/components/multi-turn-response";
import { DualPersonaDebate } from "@/app/components/dual-persona-debate";
import { HumanFeedbackRequest } from "@/app/components/human-feedback-request";
import { InvalidQuestionCard } from "@/app/components/invalid-question-card";
import { DocumentView } from "@/app/components/document-view";
import { DocumentCompleteModal } from "@/app/components/document-complete-modal";
import { AIDebateResultModal } from "@/app/components/ai-debate-result-modal";
import { ChatLeaveConfirmModal } from "@/app/components/chat-leave-confirm-modal";
import { SessionLimitModal } from "@/app/components/session-limit-modal";
import { 
  Send, 
  Paperclip, 
  X, 
  FileText, 
  MessageCircle,
  Scale,
  Calendar,
  Clock,
  Shield,
  Users,
  Briefcase,
  BookOpen,
  Award,
  DollarSign,
  ClipboardCheck,
  UserCheck,
  Info
} from "lucide-react";
import { toast } from "sonner";
import { getDummyResponse } from "@/app/data/dummy-responses";
import { validateQuestion, ValidationReason } from "@/app/utils/validate-question";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

interface EnhancedResponseData {
  factAnalysis: string;
  queryRedefinition: string;
  reviewContent: string;
  conclusion: string;
  sources: Array<{
    type: "법령" | "해석례" | "사규";
    title: string;
    url: string;
    content: string;
  }>;
  aiOpinionSummary?: {
    integratedConclusion: string; // 통합 결론
    proConclusion: string; // 찬성 측 결론
    conConclusion: string; // 반대 측 결론
  };
}

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
  isFeedback?: boolean;
  needsFeedback?: boolean;
  feedbackReason?: "invalid" | "insufficient" | "inappropriate";
  feedbackData?: {
    feedbackPoints: string[];
  };
  suggestedQuestions?: string[]; // 추천 질문 추가
  isEnhancedResponse?: boolean;  // 상세 답변
  isSimpleResponse?: boolean;    // 간단 답변
  isMultiTurnResponse?: boolean; // 멀티턴(대화형) 답변
  enhancedData?: EnhancedResponseData;
  lawCategory?: string;
  isDebate?: boolean;
  hasAIOpinion?: boolean;
  debateHistory?: Array<{
    persona: "conservative" | "progressive";
    message: string;
  }>; // AI 토론 히스토리 저장
  relatedLaws?: string[]; // 추천 질문의 관련 법령
  isInvalidQuestion?: boolean; // 유효하지 않은 질문
  invalidReason?: "meaningless" | "out-of-scope" | "inappropriate" | "unethical";
  attachedFiles?: Array<{ name: string; size: number; type: string; }>; // 첨부파일 정보
  isDraftBasis?: boolean; // 의견서 작성 플로우에서 생성된 상세답변 (하단 '의견서 작성' CTA 노출)
  draftTopicTitle?: string; // 의견서 작성 대상 주제
  isError?: boolean; // LLM/프록시 실패·가드레일 거부 — 채팅 횟수에 미포함(잔여 횟수 보존)
  isDetailUpgrade?: boolean; // 간단답변에서 '상세 답변 받기'로 받은 상세답변 — 멀티턴 횟수 미포함(PRD CHA-004)
}

interface ModernChatInterfaceProps {
  initialMessage?: string;
  selectedLaws: string[];
  onOpenLawSelector: () => void;
  onStepChange?: (step: number) => void;
  onCompleteDocument?: () => void;
  onMessagesChange?: (hasMessages: boolean) => void;
  relatedLaws?: string[];
  questionType?: string;
  contextType?: string; // 프로세스 유형: 멀티턴 맥락 수 (single=즉시 의견서 / multi=주제선택 팝업)
  requestDraftDocument?: boolean; // 외부에서 의견서 작성 트리거
  onDraftDocumentHandled?: () => void; // 트리거 처리 완료 콜백
}

// 배경 아이콘 데이터 - 메인 화면과 동일
const FLOATING_ICONS = [
  { Icon: Scale, delay: 0, duration: 20, x: "8%", y: "8%", size: 48, opacity: 0.15 },
  { Icon: FileText, delay: 2, duration: 18, x: "88%", y: "12%", size: 56, opacity: 0.12 },
  { Icon: Calendar, delay: 4, duration: 22, x: "5%", y: "82%", size: 52, opacity: 0.1 },
  { Icon: Clock, delay: 1, duration: 19, x: "92%", y: "85%", size: 44, opacity: 0.13 },
  { Icon: Shield, delay: 3, duration: 21, x: "3%", y: "35%", size: 60, opacity: 0.08 },
  { Icon: Users, delay: 5, duration: 17, x: "95%", y: "40%", size: 50, opacity: 0.11 },
  { Icon: Briefcase, delay: 2.5, duration: 20, x: "18%", y: "18%", size: 46, opacity: 0.14 },
  { Icon: BookOpen, delay: 4.5, duration: 18, x: "80%", y: "25%", size: 54, opacity: 0.09 },
  { Icon: Award, delay: 1.5, duration: 19, x: "15%", y: "65%", size: 48, opacity: 0.12 },
  { Icon: DollarSign, delay: 3.5, duration: 21, x: "82%", y: "68%", size: 52, opacity: 0.1 },
  { Icon: ClipboardCheck, delay: 0.5, duration: 22, x: "50%", y: "5%", size: 50, opacity: 0.13 },
  { Icon: UserCheck, delay: 4, duration: 20, x: "48%", y: "92%", size: 46, opacity: 0.11 },
];

// 멀티턴 제한 상수
const MAX_QUESTIONS = 4; // 최초 답변 1 + 멀티턴(후속질문) 3회 (최초 질문은 멀티턴 횟수에 미포함)

// 가드레일 거부 문구 (PRD RIS-001) — 세션은 유지하고 재시도를 유도
const GUARDRAIL_REFUSAL =
  "죄송합니다. 노무·세법 관련 질문에만 답변드릴 수 있습니다. 관련 질문으로 다시 시도해 주세요.";

// 사용자가 입력한 실제 질문이 아닌 시스템성 사용자 메시지 (카운트/맥락분석/의견서 누적에서 제외)
const isSystemUserText = (t: string): boolean =>
  t === "의견서 작성" || t === "상세 답변 받기" || t === "상세 답변 생성" || t.includes("AI 의견");

export function ModernChatInterface({
  initialMessage,
  selectedLaws,
  onOpenLawSelector,
  onStepChange,
  onCompleteDocument,
  onMessagesChange,
  relatedLaws,
  questionType,
  contextType,
  requestDraftDocument,
  onDraftDocumentHandled,
}: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  // 가드레일 차단 시 채팅 종료 (재시도 불가)
  const [chatEnded, setChatEnded] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [documentContent, setDocumentContent] = useState("");
  const [documentData, setDocumentData] = useState<any>(null); // 의견서 조화 데이터
  // 의견서 작성 — 주제 선택 바텀시트 (프로토타입: 최초 선택 시 무조건 노출)
  const [showTopicSheet, setShowTopicSheet] = useState(false);
  const [topicSheetMode, setTopicSheetMode] = useState<"detail" | "opinion">("detail"); // 진입점별 문구
  const [topicCandidates, setTopicCandidates] = useState<Array<{ title: string; desc: string; basis: string }>>([]);
  // 의견서 작성 플로우 시작 여부 (최초 선택 후 true) → 이후 멀티턴 불가, 재진입 시 바로 의견서 화면
  const [opinionFlowStarted, setOpinionFlowStarted] = useState(false);
  const [lastDraftTopicTitle, setLastDraftTopicTitle] = useState<string>("");
  const [previousSelectedLaws, setPreviousSelectedLaws] = useState<string[]>(selectedLaws);
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number; type: string; data: ArrayBuffer | string }[]>([]);
  const [showSecurityAlert, setShowSecurityAlert] = useState(false);
  const [userQuestion, setUserQuestion] = useState<string>(initialMessage || "");
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [humanFeedback, setHumanFeedback] = useState<string | null>(null);
  const [showDebateResultModal, setShowDebateResultModal] = useState(false);
  const [debateSummary, setDebateSummary] = useState("");
  const [pendingDebateMessageId, setPendingDebateMessageId] = useState("");
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [pendingLeaveAction, setPendingLeaveAction] = useState<(() => void) | null>(null);
  const [pendingDocDraftAfterSidebar, setPendingDocDraftAfterSidebar] = useState(false);
  
  // 세션 제한 관련 상태
  const [showSessionLimitModal, setShowSessionLimitModal] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [pendingAttachedFiles, setPendingAttachedFiles] = useState<Array<{ name: string; size: number; type: string; }>>([]);
  
  // 답변 상세 사이드바 관련 상태
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [preparingAnswerData, setPreparingAnswerData] = useState<EnhancedResponseData | null>(null);
  const [isInitialAnswerView, setIsInitialAnswerView] = useState(false); // 최초 답변 생성 시 사이드바인지 여부
  const [autoCloseSidebar, setAutoCloseSidebar] = useState(false); // 사이드바 자동 닫기 플래그
  const [detailInitialView, setDetailInitialView] = useState<"answer" | "debate">("answer"); // 사이드바 최초 진입 뷰
  // AI 상세의견 토론 오버레이
  const [showAIDebate, setShowAIDebate] = useState(false);
  const [aiDebateTargetId, setAiDebateTargetId] = useState<string>("");
  
  // 출처 및 탐색기록 패널 상태
  const [showSourcesPanel, setShowSourcesPanel] = useState(false);
  const [selectedSourceTitle, setSelectedSourceTitle] = useState<string>("");
  const [panelSources, setPanelSources] = useState<{ type: "법령" | "해석례" | "사규" | "판례"; title: string; url?: string; content?: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 상세 답변 자동 스트리밍 사이드패널을 이미 띄운 메시지 id 집합 (중복 방지)
  const autoStreamedRef = useRef<Set<string>>(new Set());

  // 답변 형태 정책 상태
  // answerTrack: 이 스레드의 최초 답변이 간단/상세 중 무엇으로 시작했는지 (간단→상세 승급 추적)
  const [answerTrack, setAnswerTrack] = useState<"simple" | "detailed" | null>(null);
  // 스트리밍 중에는 추가 질문 입력 비활성화
  const [isStreaming, setIsStreaming] = useState(false);

  // 답변 생성 지연 (ms)
  const DELAY_SIMPLE = 2500;
  const DELAY_DETAILED = 3500;

  // 질문 복잡도 분류 (낮음 → 간단 답변, 중간~높음 → 상세 답변)
  const classifyComplexity = (text: string, presetType?: string): "simple" | "detailed" => {
    // 개발/검증용 마커: 질문에 '(상세답변)'이 포함되면 항상 상세 (질문 수정 후에도 유지)
    if ((text || "").includes("(상세답변)")) return "detailed";
    if (presetType === "simple") return "simple";
    if (presetType && presetType !== "normal") return "detailed";
    const t = (text || "").trim();
    const detailedSignals = /계산|비교|차이|요건|절차|어떻게|가능한가|가능한지|인정|기준|판단|위반|책임|불이익|소송|징계|해고|산재|중간정산|포괄임금|어떻게 되나|되나요/;
    if (detailedSignals.test(t)) return "detailed";
    if (t.length <= 25) return "simple";
    return t.length > 45 ? "detailed" : "simple";
  };

  // AI 답변 횟수 계산 (실제 답변만 카운트)
  const getAIResponseCount = (): number => {
    return messages.filter(m =>
      !m.isUser &&
      !m.isLoading &&
      !m.isError && // 실패(에러)·가드레일 거부 답변은 횟수에 미포함 → 잔여 횟수 보존
      !m.isDetailUpgrade && // '상세 답변 받기'로 받은 상세답변은 멀티턴 횟수 미포함(PRD CHA-004)
      (m.isEnhancedResponse || m.isSimpleResponse || m.isMultiTurnResponse || (m.relatedLaws && m.relatedLaws.length > 0))
    ).length;
  };

  // 멀티턴 답변 실패 시: 해당 답변과 직전 사용자 질문을 '에러 턴'으로 표시해 채팅 횟수에서 제외.
  // (프록시가 정상 답변/폴백을 주면 호출되지 않음 — 네트워크·프록시 다운 등 실제 실패에서만 발동)
  const markMessageError = (aiId: string) => {
    setMessages((prev) => {
      const idx = prev.findIndex((m) => m.id === aiId);
      if (idx === -1 || prev[idx].isError) return prev;
      const copy = [...prev];
      copy[idx] = { ...copy[idx], isError: true };
      for (let i = idx - 1; i >= 0; i--) {
        if (copy[i].isUser && !isSystemUserText(copy[i].text)) {
          copy[i] = { ...copy[i], isError: true };
          break;
        }
      }
      return copy;
    });
  };

  // 누적 질문 텍스트 (1턴부터 현재까지)
  const getAccumulatedQuestions = (extra?: string): string => {
    const prior = messages.filter(m => m.isUser && !isSystemUserText(m.text)).map(m => m.text);
    if (extra) prior.push(extra);
    return prior.join("\n");
  };

  // 답변 메시지 생성: 최초=복잡도 기반(간단/상세), 후속=항상 멀티턴(대화형) 답변
  // (CHA-008: 멀티턴이 진행되면 답변은 항상 멀티턴 답변으로 출력 — n-2/n 상세답변 강제 전환 없음)
  // 반환: { msg, delay }
  const buildAnswerMessage = (
    question: string,
    opts: { isFirst: boolean; presetType?: string }
  ): { msg: Message; delay: number } => {
    const enhancedData = generateIntegratedResponse(question);
    const base: Message = {
      id: (Date.now() + 2).toString(),
      text: "",
      isUser: false,
      enhancedData,
    };

    if (opts.isFirst) {
      const complexity = classifyComplexity(question, opts.presetType);
      setAnswerTrack(complexity);
      if (complexity === "detailed") {
        return { msg: { ...base, isEnhancedResponse: true }, delay: DELAY_DETAILED };
      }
      return { msg: { ...base, isSimpleResponse: true }, delay: DELAY_SIMPLE };
    }

    // 후속(멀티턴): 복잡도/턴수와 무관하게 항상 멀티턴(대화형) 답변
    return { msg: { ...base, isMultiTurnResponse: true }, delay: DELAY_SIMPLE };
  };

  // Helper to get law names from IDs
  const getLawNames = (lawIds: string[]): string[] => {
    const lawMap: Record<string, string> = {
      "labor-standards": "근로기준법",
      "equal-employment": "남녀고용평등법",
      "industrial-safety": "산업안전보건법",
      "serious-accident": "중대재해처벌법",
      "labor-union": "노동조합 및 노동관계조정법",
      "minimum-wage": "최저임금법",
      "dispatched-workers": "파견근로자 보호법",
      "fixed-term": "기간제 및 단시간근로자 보호법",
      "employment-insurance": "고용보험법",
      "industrial-accident-insurance": "산업재해보상보험법",
      "elderly-employment": "고령자고용촉진법",
      "disabled-employment": "장애인고용촉진법",
      "foreign-workers": "외국인근로자 고용법",
      "vocational-training": "근로자직업능력개발법",
      "labor-welfare": "근로본법",
    };
    return lawIds.map(id => lawMap[id] || id);
  };

  // Helper to detect law category from message content
  const detectLawCategory = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("재해") || lowerMessage.includes("산재") || lowerMessage.includes("부상") || lowerMessage.includes("사고")) {
      return "산업재해 · 안전보건";
    }
    if (lowerMessage.includes("해고") || lowerMessage.includes("징계") || lowerMessage.includes("수습")) {
      return "해고 · 징계";
    }
    if (lowerMessage.includes("임금") || lowerMessage.includes("급여") || lowerMessage.includes("퇴직금")) {
      return "임금 · 퇴직금";
    }
    if (lowerMessage.includes("근로시간") || lowerMessage.includes("연장근로") || lowerMessage.includes("52시간")) {
      return "근로시간 · 휴게";
    }
    if (lowerMessage.includes("휴가") || lowerMessage.includes("연차")) {
      return "휴가 · 휴직";
    }
    if (lowerMessage.includes("차별") || lowerMessage.includes("성희롱") || lowerMessage.includes("평")) {
      return "고용평등 · 차별";
    }
    if (lowerMessage.includes("노동조합") || lowerMessage.includes("단체교섭")) {
      return "노동조합 · 단체교섭";
    }
    
    return "노동법 일반";
  };

  // 검색 모드 대화형 응답 생성 — 결론 텍스트 반환
  const generateSearchResponse = (question: string): string => {
    const data = getDummyResponse(question);
    return data.conclusion;
  };

  // 의견서 검토유형 자동 분류 (PRD: 단순문의 / 리스크검토 / 법률검토 / 기타)
  const detectReviewType = (message: string): string => {
    const lower = message.toLowerCase();

    // 리스크검토: 위험·예방·대응·위반 관련 키워드
    const riskKeywords = ["리스크", "위험", "예방", "대비", "대응", "가능성", "분석", "검토", "적법", "위반", "불법", "제재"];
    if (riskKeywords.some(kw => lower.includes(kw))) return "리스크 검토";

    // 법률검토: 해고·계약·판례 등 법적 판단이 필요한 키워드
    const legalKeywords = ["해고", "징계", "계약", "정당", "판례", "소송", "처벌", "권리", "의무", "손해배상", "근거", "법령", "규정"];
    if (legalKeywords.some(kw => lower.includes(kw))) return "법률 검토";

    // 단순문의: 정보·절차·기간 등 단순 조회성 키워드
    const simpleKeywords = ["언제", "어떻게", "방법", "절차", "기간", "일수", "계산", "얼마", "조건", "기준", "알려", "궁금", "몇 일", "몇일", "며칠"];
    if (simpleKeywords.some(kw => lower.includes(kw))) return "단순 문의";

    return "기타";
  };

  // Helper to generate question summary (max 20 characters)
  const generateQuestionSummary = (message: string): string => {
    // Remove unnecessary whitespace and newlines
    const cleaned = message.replace(/\s+/g, ' ').trim();
    
    // If short enough, return as is
    if (cleaned.length <= 20) {
      return cleaned;
    }
    
    // Extract key information
    const lowerMessage = cleaned.toLowerCase();
    
    // Pattern matching for common labor questions
    if (lowerMessage.includes("점심") && lowerMessage.includes("사고")) {
      return "점심시간 중 사고";
    }
    if (lowerMessage.includes("배우자") && (lowerMessage.includes("대출") || lowerMessage.includes("소득공제"))) {
      return "주택담보대출 소득공제";
    }
    if (lowerMessage.includes("출퇴근") && lowerMessage.includes("사고")) {
      return "출퇴근 중 사고";
    }
    if (lowerMessage.includes("임금") || lowerMessage.includes("급여")) {
      return "임금 지급 관련";
    }
    if (lowerMessage.includes("연차") || lowerMessage.includes("휴가")) {
      return "연휴가 관련";
    }
    if (lowerMessage.includes("퇴직금") || lowerMessage.includes("중정산")) {
      return "퇴직금 관련";
    }
    if (lowerMessage.includes("징계")) {
      return "징계 관련";
    }
    if (lowerMessage.includes("해고")) {
      return "근로계약 종료 관련";
    }
    
    // Fallback: First 20 characters + ellipsis
    return cleaned.substring(0, 17) + "...";
  };

  // Get suggested questions based on validation reason
  const getSuggestedQuestions = (reason: "meaningless" | "out-of-scope" | "inappropriate" | "unethical" | "insufficient"): string[] => {
    switch (reason) {
      case "meaningless":
        return [
          "연차 사용 시 회사가 사용 사유를 물어봐도 되나요?",
          "퇴직금 중간정산이 가능한 경우는 언제인가요?",
          "점심시간에 발생한 사고도 산재로 인정받을 수 있나요?"
        ];
      
      case "out-of-scope":
        return [
          "최저임금 미만으로 급여를 받고 있는데 어떻게 해야 하나요?",
          "연차휴가를 사용하지 못하고 퇴사하면 수당을 받을 수 있나요?",
          "근로계서를 작성하지 않은 경우 법적으로 문제가 되나요?"
        ];
      
      case "inappropriate":
      case "unethical":
        return [
          "해고 예고수당의 계산 방법과 지급 기준이 궁금합니다",
          "직장 내 괴롭힘을 당했을 때 대응 방법을 알려주세요",
          "육휴직 신청 시 회사가 거부할 수 있는 사유가 있나요?"
        ];
      
      case "insufficient":
        return [
          "상시근로자 10명 규모의 회사에서 3년 근속 직원의 퇴직금 계산 방법을 알려주세요",
          "정규직 근로자가 2년간 연차휴가를 사용하지 못했을 경우 수당 계산 방법이 궁금합니다",
          "직원이 업무 중 사다리에서 떨어져 부상을 입은 경우 산재 인정 기준을 알려주세요"
        ];
    }
  };

  // Handle suggested question selection
  const handleSuggestedQuestionSelect = (question: string) => {
    // Clear previous messages and start fresh with the suggested question
    const userMsg: Message = {
      id: Date.now().toString(),
      text: question,
      isUser: true,
      lawCategory: detectLawCategory(question),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Show loading
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      isLoading: true,
      relatedLaws: relatedLaws,
    };
    setMessages((prev) => [...prev, loadingMsg]);

    // Step 1: 문 입력 완료 -> Step 2: 법령 분석 시작
    onStepChange?.(2);
    setCurrentStep(2);

    const hasPriorAnswer = messages.some(
      m => !m.isUser && (m.isSimpleResponse || m.isEnhancedResponse || m.isMultiTurnResponse)
    );
    const { msg, delay } = buildAnswerMessage(question, { isFirst: !hasPriorAnswer });
    setTimeout(() => {
      setMessages((prev) => prev.filter(m => !m.isLoading).concat(msg));
      onStepChange?.(3);
      setCurrentStep(3);
    }, delay);
  };

  // Watch for selectedLaws changes (refined search)
  useEffect(() => {
    // If laws changed and we have messages (meaning we're in an active chat)
    if (messages.length > 0 && 
        selectedLaws.length > 0 && 
        JSON.stringify(selectedLaws) !== JSON.stringify(previousSelectedLaws)) {
      
      setPreviousSelectedLaws(selectedLaws);
      
      // 동일한 질문으로 재검색 (원래 질문 찾기)
      const originalQuestion = messages.find(m => m.isUser && !m.text.includes("AI 의견"))?.text || "";
      
      if (!originalQuestion) return;
      
      // 법령 재선택 메시지 표시
      const lawNames = getLawNames(selectedLaws);
      const refinedSearchMessage = `[${lawNames.join(", ")}] 범위로 검색`;
      
      const userMsg: Message = {
        id: Date.now().toString(),
        text: refinedSearchMessage,
        isUser: true,
        lawCategory: detectLawCategory(originalQuestion),
      };
      setMessages((prev) => [...prev, userMsg]);

      // Show loading with refined search indicator
      const loadingMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        isUser: false,
        isLoading: true,
        relatedLaws: relatedLaws, // 추천 질문의 관련 법령 전달
      };
      setMessages((prev) => [...prev, loadingMsg]);

      // 법령 재선택 후 재검색은 후속(멀티턴) 답변으로 처리
      const { msg, delay } = buildAnswerMessage(originalQuestion, { isFirst: false });
      setTimeout(() => {
        setMessages((prev) => prev.filter(m => !m.isLoading).concat(msg));
      }, delay);
    }
  }, [selectedLaws]);

  // Clear uploaded file after AI response (In-Memory management)
  useEffect(() => {
    // After AI response is generated, clear the uploaded file from memory
    const hasAIResponse = messages.some(m => !m.isUser && (m.isIntegrated || m.text));
    if (hasAIResponse && uploadedFiles.length > 0) {
      setUploadedFiles([]); // Flush memory
    }
  }, [messages]);

  // Generate integrated response data
  const generateIntegratedResponse = (userMessage: string): EnhancedResponseData => {
    return getDummyResponse(userMessage);
  };

  // Generate document content
  const generateDocument = (userMessage: string): string => {
    const integratedData = generateIntegratedResponse(userMessage);
    
    return `법 률 검 토 의 견 서


사건 개요
=========
${userMessage}


사실관계
=========
${integratedData.factAnalysis}


질의내용
=========
${integratedData.queryRedefinition}


검 의견
=========
${integratedData.reviewContent}


결론
====
${integratedData.conclusion}


참고 법령
========
${integratedData.sources.map(s => `- ${s.title}`).join('\n')}


${integratedData.aiOpinionSummary ? `AI 의견
========
${integratedData.aiOpinionSummary}


` : ''}
작성일: ${new Date().toLocaleDateString('ko-KR')}
작성자: LaborCopilot AI 노무사`;
  };

  // Handle initial message
  useEffect(() => {
    if (initialMessage && messages.length === 0) {
      const userMsg: Message = {
        id: Date.now().toString(),
        text: initialMessage,
        isUser: true,
        lawCategory: detectLawCategory(initialMessage),
      };
      setMessages([userMsg]);

      // 가드레일: 부적절/위법/범위 외 질문 차단 (휴먼피드백 미적용)
      const validation = validateQuestion(initialMessage);
      const blocked =
        questionType === "inappropriate" ||
        validation.reason === "inappropriate" ||
        validation.reason === "unethical" ||
        validation.reason === "out-of-scope";

      // 차단 질문(가드레일) → 거부 메시지. 세션 유지·카운트 제외(PRD RIS-001, CHA-004)
      if (blocked) {
        onStepChange?.(2);
        setCurrentStep(2);
        setMessages([{ ...userMsg, isError: true }, { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws } as Message]);
        setTimeout(() => {
          setMessages((prev) => prev.filter(m => !m.isLoading).concat({
            id: (Date.now() + 2).toString(),
            text: GUARDRAIL_REFUSAL,
            isUser: false,
            isError: true,
          }));
          // 세션 유지 → 다른 질문으로 재시도 가능
        }, 800);
        return;
      }

      // 최초 질문이 '상세 답변'(복잡도 중간~높음)이면 휴먼피드백 먼저 노출 (간단 답변은 미적용)
      if (classifyComplexity(initialMessage, questionType) === "detailed") {
        setMessages((prev) => [...prev, makeFeedbackMessage()]);
        return;
      }

      // 간단 답변: 로딩 → 답변
      onStepChange?.(2);
      setCurrentStep(2);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws } as Message]);
      const { msg, delay } = buildAnswerMessage(initialMessage, { isFirst: true, presetType: questionType });
      setTimeout(() => {
        setMessages((prev) => prev.filter(m => !m.isLoading).concat(msg));
        setIsTyping(false);
        onStepChange?.(3);
        setCurrentStep(3);
      }, delay);
    }
  }, [initialMessage, questionType]);

  // 휴먼피드백(사실관계 확인) 메시지 생성 — 최초 질문이 상세 답변일 때만 사용
  const makeFeedbackMessage = (): Message => ({
    id: (Date.now() + 1).toString(),
    text: "",
    isUser: false,
    needsFeedback: true,
    feedbackReason: "insufficient",
    suggestedQuestions: getSuggestedQuestions("insufficient"),
  });

  // 휴먼피드백 "계속 진행하기" → 피드백 제거 후 무조건 상세 답변 생성 (사용자 메시지 재추가 없음)
  // 휴먼피드백은 '상세 답변'에서만 노출되므로, 진행 시 항상 상세 답변으로 생성한다.
  const proceedWithAnswer = (question: string) => {
    onStepChange?.(2);
    setCurrentStep(2);
    setAnswerTrack("detailed");
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      isLoading: true,
      relatedLaws: relatedLaws,
    };
    setMessages((prev) => prev.filter((m) => !m.needsFeedback).concat(loadingMsg));
    setTimeout(() => {
      const enhancedData = generateIntegratedResponse(question);
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: "",
        isUser: false,
        isEnhancedResponse: true,
        enhancedData,
      };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(aiMsg));
      onStepChange?.(3);
      setCurrentStep(3);
    }, DELAY_DETAILED);
  };

  // 휴먼피드백 "계속 진행하기" 핸들러
  const handleRevisedQuestion = (revisedQuestion: string) => {
    proceedWithAnswer(revisedQuestion);
  };

  // 선택 주제(또는 누적 맥락)로 상세답변을 채팅에 인라인 생성.
  // isDetailUpgrade=true → 멀티턴 횟수 미포함(PRD CHA-004).
  const generateDetailedAnswerForTopic = (
    basis: string,
    topic?: { title: string; desc?: string },
  ) => {
    setShowTopicSheet(false);
    onStepChange?.(2);
    setCurrentStep(2);
    setAnswerTrack("detailed");
    const userMsg: Message = { id: Date.now().toString(), text: "상세 답변 받기", isUser: true };
    const loadingMsg: Message = { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setTimeout(() => {
      const enhancedData = generateIntegratedResponse(basis);
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: "",
        isUser: false,
        isEnhancedResponse: true,
        isDetailUpgrade: true,
        enhancedData,
        draftTopicTitle: topic?.title,
      };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(aiMsg));
      onStepChange?.(3);
      setCurrentStep(3);
    }, DELAY_DETAILED);
  };

  // 플로팅 "상세 답변 받기" (정책 확정 2026-07-03)
  //  - 플로팅 버튼은 항상 '상세 답변 받기' 단일 라벨 (변경 조건 없음)
  //  - 단일 맥락: 누적 맥락으로 바로 상세답변 생성 / 복수 맥락: [주제 선택 모달] 경유
  const requestDetailedAnswer = () => {
    if (contextType === "single") {
      const { topics } = analyzeSessionTopics();
      const t = topics[0];
      generateDetailedAnswerForTopic(getAccumulatedQuestions() || initialMessage || "", t ? { title: t.title, desc: t.desc } : undefined);
      return;
    }
    const { topics } = analyzeSessionTopics();
    setTopicCandidates(topics);
    setTopicSheetMode("detail");
    setShowTopicSheet(true);
  };

  // 최종 답변 준비 시작 시 호출되는 핸들러
  const handleAnswerPreparationStart = () => {
    console.log('[Modern Chat] 답변 준비 시작 핸들러 호출');
    // 답변 데이터를 미리 생성
    const userMessage = messages.find(m => m.isUser && !m.text.includes("AI 의견"))?.text || initialMessage || "";
    console.log('[Modern Chat] 사용자 메시지:', userMessage);
    if (userMessage) {
      const enhancedData = generateIntegratedResponse(userMessage);
      console.log('[Modern Chat] 답변 데이터 생성 완료:', enhancedData);
      
      // AI 의견은 최초 답변에서 제거 (AI 상세의견 후에만 표시)
      const dataWithoutAIOpinion = {
        ...enhancedData,
        aiOpinionSummary: undefined, // AI 의견 제거
      };
      
      setPreparingAnswerData(dataWithoutAIOpinion);
      setShowDetailSidebar(true);
      setIsInitialAnswerView(true); // 최초 답변 생성 시 설정
      console.log('[Modern Chat] 사이드바 열기 상태 설정 (AI 의견 제외)');
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // 상세 답변은 채팅 화면 안에서 인라인으로 스트리밍 표시됨 (사이드패널 자동 열기 제거)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // 첨부파일 정보 저장 (data 제외)
    const filesInfo = uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    const savedInput = inputValue;
    setInputValue("");
    setUploadedFiles([]);
    submitQuestion(savedInput, filesInfo);
  };

  const submitQuestion = (
    text: string,
    filesInfo: { name: string; size: number; type: string }[] = []
  ) => {
    if (!text.trim()) return;

    // AI 상세의견 진행 중에는 입력 불가
    const isDebateInProgress = messages.some(m => m.isDebate && !m.debateHistory);
    if (isDebateInProgress) {
      toast.info("AI 상세의견이 진행 중입니다. 잠시만 기다려주세요.");
      return;
    }

    // 멀티턴 제한 체크
    // - 횟수 초과(MAX_QUESTIONS) 또는
    // - 의견서 작성 플로우를 시작한 세션(멀티턴 불가): 동일하게 세션 전환 모달
    const aiResponseCount = getAIResponseCount();
    if (opinionFlowStarted || aiResponseCount >= MAX_QUESTIONS) {
      // 질문을 보내지 않고 세션 전환 알럿 표시
      setPendingQuestion(text);
      setPendingAttachedFiles(filesInfo);
      setShowSessionLimitModal(true);
      return;
    }

    const savedInput = text;
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      isUser: true,
      attachedFiles: filesInfo.length > 0 ? filesInfo : undefined,
    };

    const hasPriorAnswer = messages.some(
      m => !m.isUser && (m.isSimpleResponse || m.isEnhancedResponse || m.isMultiTurnResponse)
    );

    // ── 휴먼피드백 단계에서의 재제출(질문 수정 등): 휴먼피드백은 첫 질문에 1번만 ──
    // 이전 질문·피드백을 제거하고 편집 질문으로 교체한 뒤, 피드백 재노출 없이 바로 상세 답변
    if (!hasPriorAnswer) {
      const v = validateQuestion(savedInput);
      const blocked = v.reason === "inappropriate" || v.reason === "unethical" || v.reason === "out-of-scope";
      if (blocked) {
        // 가드레일 거부: 세션 유지·카운트 제외(PRD RIS-001, CHA-004)
        setMessages([{ ...userMsg, isError: true }, { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws } as Message]);
        setTimeout(() => {
          setMessages((prev) => prev.filter(m => !m.isLoading).concat({
            id: (Date.now() + 2).toString(),
            text: GUARDRAIL_REFUSAL,
            isUser: false,
            isError: true,
          }));
          // 세션 유지 → 다른 질문으로 재시도 가능
        }, 800);
        return;
      }
      setMessages([userMsg]); // 이전 질문/피드백 제거
      proceedWithAnswer(savedInput); // 상세 답변 (휴먼피드백 재노출 없음)
      return;
    }

    // ── 후속 질문(멀티턴) ──
    // 가드레일: 부적절/위법/범위 외 질문 차단
    const validation = validateQuestion(savedInput);
    const isBlocked =
      validation.reason === "inappropriate" || validation.reason === "unethical" || validation.reason === "out-of-scope";
    if (isBlocked) {
      // 거부: 세션 유지·카운트 제외 → 잔여 횟수로 멀티턴 지속 가능(PRD CHA-004)
      setMessages((prev) => [...prev, { ...userMsg, isError: true }, { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws } as Message]);
      setTimeout(() => {
        setMessages((prev) => prev.filter(m => !m.isLoading).concat({
          id: (Date.now() + 2).toString(),
          text: GUARDRAIL_REFUSAL,
          isUser: false,
          isError: true,
        }));
        // 세션 유지 (setChatEnded 하지 않음)
      }, 800);
      return;
    }

    setMessages((prev) => [...prev, userMsg]);

    // 로딩 → 멀티턴 답변
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws } as Message]);
    const { msg, delay } = buildAnswerMessage(savedInput, { isFirst: false });
    setTimeout(() => {
      setMessages((prev) => prev.filter(m => !m.isLoading).concat(msg));
      onStepChange?.(3);
      setCurrentStep(3);
    }, delay);
  };

  const handleViewOpinion = () => {
    // Could show additional details or expand all accordions
    alert("AI 노무사의 상세 의견을 확인할 수 있습니다.");
  };

  // ── 의견서 작성 플로우 (CHA-008) ───────────────────────────────
  // 누적 세션을 분석해 맥락이 여러 개인지 판단하고, 주제 후보를 추출
  const analyzeSessionTopics = (): { multi: boolean; topics: Array<{ title: string; desc: string; basis: string }> } => {
    const userQs = messages.filter(m => m.isUser && !isSystemUserText(m.text)).map(m => m.text);
    const trunc = (q: string) => (q.length > 40 ? q.slice(0, 40) + "…" : q);
    const toTopic = (q: string) => ({ title: detectLawCategory(q), desc: trunc(q), basis: q });

    // 제안 주제는 항상 2개: 서로 다른 카테고리를 우선 선별하고, 부족하면 다른 질문으로 채움
    const seenCat = new Set<string>();
    const picked: string[] = [];
    for (const q of userQs) {
      const c = detectLawCategory(q);
      if (!seenCat.has(c)) { seenCat.add(c); picked.push(q); }
      if (picked.length === 2) break;
    }
    if (picked.length < 2) {
      for (const q of userQs) {
        if (!picked.includes(q)) { picked.push(q); if (picked.length === 2) break; }
      }
    }
    const topics = picked.slice(0, 2).map(toTopic);
    return { multi: topics.length >= 2, topics };
  };

  // 의견서/상세답변 작성 진입:
  // - 최초 선택: 프로토타입에서는 주제 선택 모달을 무조건 노출 (진입점별 문구 분기)
  // - 최초 선택이 아닌 경우: 바로 의견서 작성 화면으로 전환
  // mode: 'detail'(플로팅 '상세 답변 받기') | 'opinion'(세션제한·나가기 모달의 '의견서 작성')
  // 의견서 작성 진입(세션초과 모달·외부 트리거 전용 — 플로팅에는 의견서 버튼 없음, 정책 확정 2026-07-03)
  // 선택 즉시 세션 종료(입력영역 비활성화) 후 세션 누적 기준으로 문서 생성
  const startOpinionFlow = (_mode: "detail" | "opinion" = "opinion") => {
    if (opinionFlowStarted && lastDraftTopicTitle) {
      // 재진입(이미 발행 이력): 문서 화면 재오픈
      finalizeDraftDocument(lastDraftTopicTitle || undefined);
      return;
    }
    setOpinionFlowStarted(true); // 세션 종료(후속 질문 불가)
    const { topics } = analyzeSessionTopics();
    const title = topics[0]?.title || "종합 검토";
    setLastDraftTopicTitle(title);
    finalizeDraftDocument(title);
  };

  // 주제 선택 후 — 의견서 작성용 상세답변을 채팅에 인라인 생성
  // (최초 선택 이후 해당 세션은 멀티턴 불가 → opinionFlowStarted로 잠금)
  const generateDraftBasisAnswer = (topic: { title: string; desc: string; basis: string }, entryLabel: string = "의견서 작성") => {
    setShowTopicSheet(false);
    setOpinionFlowStarted(true);
    setLastDraftTopicTitle(topic.title);
    onStepChange?.(2);
    setCurrentStep(2);
    // 사용자가 클릭한 버튼명을 질문처럼 메시지로 남기고, 응답은 상세 답변으로 표기
    const userMsg: Message = {
      id: Date.now().toString(),
      text: entryLabel,
      isUser: true,
    };
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      isLoading: true,
      relatedLaws,
    };
    setMessages((prev) => [...prev, userMsg, loadingMsg]);
    setTimeout(() => {
      const enhancedData = generateIntegratedResponse(topic.basis || topic.title);
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: "",
        isUser: false,
        isEnhancedResponse: true,
        enhancedData,
        isDraftBasis: true,
        draftTopicTitle: topic.title,
      };
      setMessages((prev) => prev.filter((m) => !m.isLoading).concat(aiMsg));
      onStepChange?.(3);
      setCurrentStep(3);
    }, DELAY_DETAILED);
  };

  // 진입점 별칭 (기존 호출부 호환): GNB·세션초과·나가기 모달 모두 의견서 플로우 시작
  const handleDraftDocument = (_messageId?: string) => {
    startOpinionFlow("opinion");
  };

  // 최종 의견서 생성 (상세답변 하단 'AI 상세의견 반영' 후 'AI 상세의견 작성' CTA에서 호출)
  const finalizeDraftDocument = (topicTitle?: string, basisOverride?: string) => {
    // 기본: 1턴부터 마지막 답변까지 누적된 세션 전체 질문 기준.
    // basisOverride: 특정 상세답변 기준 의견서(답변별 의견서 작성 버튼·주제 스트리밍 플로우)
    const allUserMessages = messages.filter(m => m.isUser && !isSystemUserText(m.text));
    const userMessage = basisOverride || allUserMessages.map(m => m.text).join("\n\n[추가 질문]\n");

    const doc = generateDocument(userMessage);
    const today = new Date();
    const formattedDate = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}.`;

    // 구조화된 의견서 데이터 생성
    const data = {
      referenceNo: `AI-LABOR-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-001`,
      date: formattedDate,
      client: "[회사명]",
      manager: "[직함 / 성명]",
      reviewType: "종합 검토",
      reviewTarget: topicTitle ? topicTitle : userMessage.substring(0, 30) + "...",
      version: "v1.0",
      facts: [
        { key: "사업장 규모", value: "[예: 상시근로자 300명]" },
        { key: "고용형태", value: "[정규/기간제/단시간/파견/도급 등]" },
        { key: "관련 규정", value: "[취업규칙/인사규정/단체협약/근로계약서 등]" },
        { key: "현재 운영", value: "[운영 방식 요약]" },
        { key: "분쟁 여부", value: "[민원/진정/소송/없음]" }
      ],
      queries: [userMessage],
      laws: [
        {
          category: "적용 법령",
          items: relatedLaws && relatedLaws.length > 0 
            ? relatedLaws.slice(0, 3)
            : ["「근로기준법」 제○조", "「근로기준법 시행령」 제○조", "기타 관련 법령(필요 시)"]
        },
        {
          category: "판례 및 행정해석",
          items: relatedLaws && relatedLaws.length > 3
            ? relatedLaws.slice(3, 5)
            : ["[관련 판례] 대법원 ○○.○○.○○. 선고 ○○다○○ 판결", "[행정해석] 고용노동부 ○○○○-○○, ○○.○○.○○."]
        }
      ],
      risks: [
        { item: "항목1", current: "[요약]", issue: "[위반/분쟁 포인트]", level: "mid" as const },
        { item: "항목2", current: "[요약]", issue: "[위반/분쟁 포인트]", level: "high" as const }
      ],
      issues: [
        {
          title: "[쟁점명]",
          standard: "[근거 법령/판례 요약]",
          judgment: "[적법/미비/위법 가능성 및 사유]",
          caution: "[절차/증빙/실무상 주의점]",
          recommendation: "[수정/운영 개선/로세스 제안]"
        }
      ],
      improvements: [
        { category: "단기 조치", action: "[즉시 수정/공지/서면합의/지급 정비 등]", priority: "High" },
        { category: "제도 개선", action: "[규정 개정/프로세스 설계/교육/점검 체계 등]", priority: "Mid" }
      ],
      conclusion: "종합적으로 볼 때, 본 사안은 [리스크 수준]으로 평가됩니다. 특히 [핵심 리스크 포인트]는 진정/소송 등으로 확대될 수 있으므로, [권고 조치]를 우선 적용하는 것을 권고드립니다.",
      riskSummary: [
        { area: "임금", risk: "high" as const, urgency: "즉시" },
        { area: "근로시간/휴게", risk: "mid" as const, urgency: "단기" },
        { area: "휴일/휴가", risk: "mid" as const, urgency: "단기" },
        { area: "징계/해고", risk: "high" as const, urgency: "즉시" },
        { area: "기타", risk: "low" as const, urgency: "모니터링" }
      ]
    };
    
    setDocumentContent(doc);
    setDocumentData(data);
    setShowDocPreview(true);
    
    // Step 3: 결과 확인 완료 -> Step 4: 의견서 작성
    onStepChange?.(4);
    setCurrentStep(4);
  };

  // AI 상세의견: 토론 오버레이 열기
  const openAIDebate = (messageId: string) => {
    setAiDebateTargetId(messageId);
    setShowAIDebate(true);
  };

  // AI 의견 반영 → 해당 상세답변에 hasAIOpinion 표시 (인라인 AI 의견 요약 노출)
  const handleReflectAIOpinion = () => {
    setMessages((prev) => prev.map((m) =>
      m.id === aiDebateTargetId ? { ...m, hasAIOpinion: true } : m
    ));
    toast.success("AI 의견이 답변에 반영되었습니다.");
  };

  // AI 의견 반영 삭제
  const handleDeleteAIOpinion = () => {
    setMessages((prev) => prev.map((m) =>
      m.id === aiDebateTargetId ? { ...m, hasAIOpinion: false } : m
    ));
    setShowAIDebate(false);
    toast.success("AI 의견 반영이 삭제되었습니다.");
  };

  // Handle AI Opinion Request (Dual Persona Debate) - 레거시(인라인)
  const handleRequestAIOpinion = (messageId: string) => {
    // 1. Add user message "AI 의견"
    const userAIOpinionMsg: Message = {
      id: Date.now().toString(),
      text: "AI 의견",
      isUser: true,
    };
    setMessages((prev) => [...prev, userAIOpinionMsg]);

    // 2. Add debate message (토론 과정 표시)
    const debateMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      isDebate: true,
    };
    setMessages((prev) => [...prev, debateMsg]);
    setPendingDebateMessageId(messageId);
  };

  // Handle Debate Complete
  const handleDebateComplete = (summary: string, originalMessageId: string, debateHistory: Array<{ persona: "conservative" | "progressive"; message: string; }>) => {
    // Store summary and debate history
    setDebateSummary(summary);
    setPendingDebateMessageId(originalMessageId);
    
    // Update the debate message with the history (keep it in chat)
    setMessages((prev) => prev.map(msg => {
      if (msg.isDebate && msg.id === originalMessageId) {
        return {
          ...msg,
          debateHistory: debateHistory, // 토론 히스토리 저장
        };
      }
      return msg;
    }));
    
    // Show modal to ask if user wants to apply
    setShowDebateResultModal(true);
  };

  // Handle AI Opinion Apply
  const handleApplyAIOpinion = () => {
    // 이전 답변을 업데이트하는 대신 새로운 답변 메시를 추가
    const originalQuestion = messages.find(m => m.isUser && !m.text.includes("AI 의견"))?.text || "";
    const originalEnhancedData = messages.find(m => m.isEnhancedResponse)?.enhancedData;
    const debateMessage = messages.find(m => m.isDebate);
    
    if (!originalEnhancedData || !debateMessage?.debateHistory) return;
    
    // debateHistory에서 페르소나별 결론 추출
    const conservativeMessages = debateMessage.debateHistory.filter(m => m.persona === "conservative");
    const progressiveMessages = debateMessage.debateHistory.filter(m => m.persona === "progressive");
    
    const proConclusion = progressiveMessages.length > 0 
      ? progressiveMessages[progressiveMessages.length - 1].message 
      : "진보적 관점에서 업무상 재해로 인정하는 것이 타당합니다.";
    
    const conConclusion = conservativeMessages.length > 0
      ? conservativeMessages[conservativeMessages.length - 1].message
      : "보수적 관점에서 면밀한 검토가 필요합니다.";
    
    // 새로운 답변 생성 with AI Opinion
    const updatedEnhancedData = {
      ...originalEnhancedData,
      aiOpinionSummary: {
        integratedConclusion: debateSummary,
        proConclusion: proConclusion,
        conConclusion: conConclusion,
      },
    };
    
    // 새로운 AI 답 메시지 추가
    const newAIResponseMsg: Message = {
      id: Date.now().toString(),
      text: "",
      isUser: false,
      isEnhancedResponse: true,
      enhancedData: updatedEnhancedData,
      hasAIOpinion: true,
    };
    
    setMessages((prev) => [...prev, newAIResponseMsg]);
    
    toast.success("AI 의견이 반영된 답변이 생성되었습니다");
    setShowDebateResultModal(false);
  };

  const handleCompleteDocument = () => {
    setShowDocPreview(false);
    setShowCompleteModal(true);
  };

  const handleFinalComplete = () => {
    console.log('[Chat] handleFinalComplete 호출됨');
    console.log('[Chat] showDetailSidebar:', showDetailSidebar);
    console.log('[Chat] preparingAnswerData:', preparingAnswerData ? 'exists' : 'null');
    console.log('[Chat] autoCloseSidebar (before):', autoCloseSidebar);
    
    // 문서 저장 완료 알림
    toast.success('의견서가 성공적으로 저장되었습니다! 🎉');
    
    // 사이드바가 열려 있으면 5초 자동 닫기 활성화
    if (showDetailSidebar && preparingAnswerData) {
      console.log('[Chat] 의견서 저장 완료 - 사이드바 자동 닫기 활성화');
      setAutoCloseSidebar(true);
      console.log('[Chat] autoCloseSidebar (after):', true);
    } else {
      console.log('[Chat] 조건 불일치 - 자동 닫기 활성화 안됨');
      if (!showDetailSidebar) console.log('[Chat] 이유: showDetailSidebar = false');
      if (!preparingAnswerData) console.log('[Chat] 이: preparingAnswerData = null');
    }
    
    // 모달은 나중에 닫기 (상태 업데이트 후)
    setTimeout(() => {
      setShowCompleteModal(false);
      console.log('[Chat] 모달 닫기 완료');
    }, 100);
    
    onCompleteDocument?.();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 멀티턴: 최초 질문 이후에는 파일 첨부 불가 (첨부는 최초 1회만)
    const userMessageCount = messages.filter(m => m.isUser).length;
    if (userMessageCount >= 1) {
      toast.error('파일 첨부는 최초 질문 시 1회만 가능합니다.');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    // Validate file types: PDF, DOCX, HWP
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/x-hwp', // .hwp
      'application/haansofthwp', // .hwp alternative
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.hwp')) {
      toast.error('지원되지 않는 파일 형식입니다. PDF, DOCX, HWP 파일만 업로드 가능합니다.');
      return;
    }

    // 보안 안내: 파일은 상담 세션 내에서만 활용되며 영구 저장되지 않습니다
    toast.info('보안 안내: 해당 파일은 상담 세션 내에서만 활용되며 영구 저장되지 않습니다.', {
      duration: 5000,
    });

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const fileData = e.target?.result;
      
      if (fileData) {
        // 2. Store in In-Memory (not permanent storage)
        // This data will be flushed after answer is generated
        setUploadedFiles(prev => [...prev, { 
          name: file.name, 
          size: file.size, 
          type: file.type, 
          data: fileData 
        }]);
        toast.success(`${file.name} 파일이 업로드되었습니다.`);
      }
    };

    // Read file based on type
    if (file.type === 'application/pdf' || file.name.endsWith('.docx') || file.name.endsWith('.hwp')) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsDataURL(file);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setUploadedFiles([]); // Flush from memory immediately
  };

  const handleStopResponse = () => {
    // Remove loading message
    setMessages((prev) => prev.filter(m => !m.isLoading));
    toast.info("답변 생성이 중단되었습니다.");
  };
  
  // 메인화면 이동 핸들러
  const handleNavigateToMain = () => {
    // 모든 메시지 및 상태 초기화
    setMessages([]);
    setInputValue("");
    setUploadedFiles([]);
    setShowDetailSidebar(false);
    setPreparingAnswerData(null);
    setCurrentStep(1);
    
    // 부모 컴포넌트에 메시지 상태 알림
    if (onMessagesChange) {
      onMessagesChange(false);
    }
    
    toast.success("메인화면으로 돌아갑니다.");
  };
  
  // 법령 재선택 핸들러
  const handleRefineSearch = () => {
    // 법령 선택 팝업만 열기 (확인 모달 없이)
    onOpenLawSelector();
  };

  // 법령 클릭 핸들러 → 출처 및 탐색기록 패널 오픈
  const handleLawClick = (lawName: string) => {
    // 해당 법령을 포함한 메시지의 전체 sources 찾기
    const msgWithSource = messages.find((m) =>
      m.enhancedData?.sources.some(
        (s) => s.title === lawName || s.title.includes(lawName)
      )
    );
    const sources = msgWithSource?.enhancedData?.sources ?? [];
    setSelectedSourceTitle(lawName);
    setPanelSources(sources);
    setShowSourcesPanel(true);
  };

  // Handle leave with confirmation
  const handleLeaveWithConfirm = (action: () => void) => {
    // Check if there's an ongoing conversation
    const hasConversation = messages.length > 0 && messages.some(m => !m.isUser);
    
    if (hasConversation) {
      setPendingLeaveAction(() => action);
      setShowLeaveConfirmModal(true);
    } else {
      action();
    }
  };

  // 메시지 상태 변경 콜백 호출
  useEffect(() => {
    if (onMessagesChange) {
      onMessagesChange(messages.length > 0);
    }
  }, [messages, onMessagesChange]);


  // 외부에서 의견서 작성 트리거 처리
  useEffect(() => {
    if (requestDraftDocument) {
      handleDraftDocument();
      onDraftDocumentHandled?.();
    }
  }, [requestDraftDocument]);

  // 세션 제한 모달은 n+1번째 질문을 "제출"할 때만 노출 (submitQuestion 내부에서 처리).
  // 답변 완료 직후 자동 노출하지 않도록 messages 감시 트리거는 제거.

  // 첫 질문 흐름 (가드레일 → 복잡도 분류 → 휴먼피드백/간단답변). 사용자 메시지는 호출 측에서 이미 추가됨
  const runFirstQuestionFlow = (question: string, forceDetailed = false) => {
    const validation = validateQuestion(question);
    const blocked = validation.reason === "inappropriate" || validation.reason === "unethical";

    if (blocked) {
      onStepChange?.(2);
      setCurrentStep(2);
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws } as Message]);
      setTimeout(() => {
        setMessages((prev) => prev.filter(m => !m.isLoading).concat({
          id: (Date.now() + 2).toString(),
          text: "죄송합니다. 해당 질문은 답변이 어렵습니다. 노무·세법 관련 합법적인 범위 내의 질문을 부탁드립니다.",
          isUser: false,
        }));
        setChatEnded(true);
      }, 800);
      return;
    }

    // 상세 답변이면 휴먼피드백 먼저 (새 세션 이어가기 등은 강제 상세 분류)
    if (forceDetailed || classifyComplexity(question) === "detailed") {
      setMessages((prev) => [...prev, makeFeedbackMessage()]);
      return;
    }

    // 간단 답변: 로딩 → 답변
    onStepChange?.(2);
    setCurrentStep(2);
    setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), text: "", isUser: false, isLoading: true, relatedLaws } as Message]);
    const { msg, delay } = buildAnswerMessage(question, { isFirst: true });
    setTimeout(() => {
      setMessages((prev) => prev.filter(m => !m.isLoading).concat(msg));
      onStepChange?.(3);
      setCurrentStep(3);
    }, delay);
  };

  // 세션 제한 모달 "이어서 질문하기" → 새 채팅 세션으로 리셋 후 입력 질문을 첫 질문으로 처리
  const handleRetryQuestion = () => {
    setShowSessionLimitModal(false);
    if (!pendingQuestion) return;

    // 새 세션: 기존 대화 초기화 (선택 법령은 상위에서 유지)
    setAnswerTrack(null);
    setChatEnded(false);
    setOpinionFlowStarted(false);
    setLastDraftTopicTitle("");
    setInputValue("");
    setUploadedFiles([]);
    const userMsg: Message = {
      id: Date.now().toString(),
      text: pendingQuestion,
      isUser: true,
      attachedFiles: pendingAttachedFiles.length > 0 ? pendingAttachedFiles : undefined,
    };
    setMessages([userMsg]);

    const q = pendingQuestion;
    setPendingQuestion("");
    setPendingAttachedFiles([]);
    // 마지막 질문을 새 채팅의 첫 질문으로 — 상세답변으로 분류하여 프로세스 이어가기
    runFirstQuestionFlow(q, true);
  };

  // If showing document preview, render DocumentView instead
  if (showDocPreview) {
    return (
      <DocumentView
        onBack={() => setShowDocPreview(false)}
        onComplete={handleCompleteDocument}
        showCompleteButton={true}
        data={documentData}
      />
    );
  }

  // AI 상세의견 진행 중인지 확인
  // AI 상세의견 선택 시 채팅 입력창 비활성화 처리
  const isDebateInProgress = messages.some(m => m.isDebate && !m.debateHistory);

  // 답변 생성 중인지 확인
  const isAnswerLoading = messages.some(m => m.isLoading);

  // 입력 비활성화 조건: 채팅 종료(가드레일) OR 토론 진행 중 OR 답변 생성 중 OR 스트리밍 출력 중
  // 의견서 작성 버튼 선택 이후 후속 질문 불가 — 입력영역 비활성화 (정책 리뷰 2026-07-03)
  const isInputDisabled = chatEnded || isDebateInProgress || isAnswerLoading || isStreaming || opinionFlowStarted;

  // 파일 첨부 비활성화: 최초 질문 이후 (첨부는 최초 1회만)
  const isFileUploadDisabled = chatEnded || messages.filter(m => m.isUser).length >= 1;

  // 비활성화 사유에 따른 placeholder 텍스트
  const getPlaceholder = (): string => {
    if (chatEnded) return "답변이 제한되어 상담이 종료되었습니다.";
    if (opinionFlowStarted) return "의견서 작성으로 세션이 종료되었습니다. 새 채팅에서 질문해 주세요.";
    if (isDebateInProgress) return "AI 상세의견 진행 중...";
    if (isStreaming) return "답변 출력 중...";
    if (isAnswerLoading) return "답변 생성 중...";
    if (uploadedFiles.length > 0) return "첨부된 파일에 대해 궁금한 점을 질문해 주세요...";
    return "추가 질문을 입력하세요...";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Chat Messages Area — 배경은 App 루트 그라데이션을 그대로 노출 (메인 화면과 동일) */}
      <div className="flex-1 relative z-10 px-6 overflow-hidden">
        <div className="max-w-3xl mx-auto h-full flex flex-col">
          {/* 내부에서만 스크롤 가능 */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20">
                <p className="text-lg">대화를 시작해보세요</p>
              </div>
            )}

            {messages.map((message, index) => {
              // 현재 메시지의 턴 계산 (실제 질문만 카운트 — '의견서 작성'/'AI 의견' 시스템 메시지 제외)
              const isSystemUserMsg = isSystemUserText(message.text);
              const userMessagesUpToNow = messages.slice(0, index + 1).filter(m => m.isUser && !isSystemUserText(m.text) && !m.isError).length;
              const remainingQuestions = MAX_QUESTIONS - userMessagesUpToNow;
              // 잔여 질문횟수 안내 숨김: 시스템 메시지 / 의견서 작성 플로우 시작(멀티턴 잠금) / 에러 턴(횟수 미소진)
              const hideRemaining = isSystemUserMsg || opinionFlowStarted || message.isError;

              return (
                <div key={message.id}>
                  {message.isUser && (
                    <UserMessageBubble
                      message={message.text}
                      attachedFiles={message.attachedFiles}
                      currentTurn={hideRemaining ? undefined : userMessagesUpToNow}
                      remainingQuestions={hideRemaining ? undefined : remainingQuestions}
                      maxQuestions={MAX_QUESTIONS}
                    />
                  )}
                  {message.isLoading && <ProgressiveLoadingBubble relatedLaws={message.relatedLaws} onStop={handleStopResponse} onNavigateToMain={handleNavigateToMain} />}
                {/* 휴먼피드백 (최초 질문이 상세 답변일 때만) */}
                {message.needsFeedback && message.feedbackReason && (
                  <HumanFeedbackRequest
                    reason={message.feedbackReason}
                    originalQuestion={messages.find(m => m.isUser)?.text || ""}
                    onSubmitRevision={handleRevisedQuestion}
                    suggestedQuestions={message.suggestedQuestions}
                    onQuestionSelect={(question) => setInputValue(question)}
                  />
                )}
                {/* 가드레일 차단 등 일반 텍스트 응답 */}
                {!message.isUser && !message.isLoading && !message.needsFeedback && !message.isEnhancedResponse && !message.isSimpleResponse && !message.isMultiTurnResponse && !message.isDebate && !message.isInvalidQuestion && !message.relatedLaws && message.text && (
                  <ChatBubble message={message.text} isUser={false} />
                )}
                {/* 빠른 답변 카드 */}
                {message.isSimpleResponse && message.enhancedData && (
                  <SimpleResponseCard
                    question={messages.find(m => m.isUser)?.text || ""}
                    answer={{
                      items: [
                        {
                          text: message.enhancedData.conclusion,
                          laws: []
                        }
                      ]
                    }}
                    relatedLaws={message.enhancedData.sources.map((source) => ({
                      id: source.title,
                      name: source.title,
                      type: source.type,
                      content: source.content
                    }))}
                    onLawClick={handleLawClick}
                    structured={(message.enhancedData as any).simpleAnswer}
                  />
                )}
                {/* 멀티턴(대화형) 답변 */}
                {message.isMultiTurnResponse && message.enhancedData && (() => {
                  const userQs = messages.filter(m => m.isUser && !isSystemUserText(m.text)).map(m => m.text);
                  return (
                    <MultiTurnResponse
                      request={{
                        question: userQs[userQs.length - 1] ?? initialMessage ?? "",
                        priorQuestions: userQs.slice(0, -1),
                        enhancedData: message.enhancedData,
                      }}
                      onLawClick={handleLawClick}
                      onStreamingChange={setIsStreaming}
                      onError={() => markMessageError(message.id)}
                      stream
                    />
                  );
                })()}
                {message.isEnhancedResponse && message.enhancedData && (() => {
                  // 이 상세답변의 기준 질의(직전 실제 사용자 질문) — 답변별 의견서 작성에 사용
                  const priorUser = [...messages.slice(0, index)].reverse().find(m => m.isUser && !isSystemUserText(m.text));
                  const basisQ = priorUser?.text || initialMessage || "";
                  const topicTitle = message.draftTopicTitle || detectLawCategory(basisQ);
                  return (
                  <InlineDetailedAnswer
                    conclusion={message.enhancedData.conclusion}
                    factAnalysis={message.enhancedData.factAnalysis}
                    queryContent={message.enhancedData.queryRedefinition}
                    reviewContent={message.enhancedData.reviewContent}
                    sources={message.enhancedData.sources}
                    aiOpinion={message.enhancedData.aiOpinionSummary}
                    stream
                    onStreamingChange={setIsStreaming}
                    onSourceClick={handleLawClick}
                    reflected={message.hasAIOpinion || false}
                    onOpenDebate={() => openAIDebate(message.id)}
                    onWriteOpinion={() => {
                      // 답변별 의견서 작성: 해당 상세답변 기준으로 즉시 문서 생성 + 세션 종료 (정책 확정 2026-07-03)
                      setOpinionFlowStarted(true);
                      setLastDraftTopicTitle(topicTitle);
                      finalizeDraftDocument(topicTitle, basisQ);
                    }}
                  />
                  );
                })()}
                {message.isDebate && (
                  <DualPersonaDebate
                    question={messages.find(m => m.isUser)?.text || ""}
                    initialConclusion={messages.find(m => m.isEnhancedResponse)?.enhancedData?.conclusion || ""}
                    onDebateComplete={(summary, debateHistory) => handleDebateComplete(summary, message.id, debateHistory)}
                  />
                )}
                {message.isInvalidQuestion && message.invalidReason && (
                  <InvalidQuestionCard
                    reason={message.invalidReason}
                    originalQuestion={messages.find(m => m.isUser)?.text || ""}
                    suggestedQuestions={message.suggestedQuestions}
                    onSelectQuestion={handleSuggestedQuestionSelect}
                  />
                )}
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* 의견서 작성 - Floating Pill (답변 중단 버튼과 동일한 노출 방식)
          라벨 분기:
          - 최초 답변이 간단답변(상세답변 아직 없음) → "상세 답변 받기"
          - 최초 답변이 상세답변 이거나, 의견서 플로우로 상세답변을 받은 뒤 → "의견서 작성" */}
      {(() => {
        const hasMultiTurn = messages.some(m => m.isMultiTurnResponse && m.enhancedData);
        // 플로팅 버튼 정책 (확정 2026-07-03):
        //  - 라벨은 항상 '상세 답변 받기' (변경 조건 없음)
        //  - 멀티턴 답변 이후에만 노출. 의견서 작성으로 세션 종료 시 미노출
        //  - 의견서 작성은 각 상세답변 카드의 버튼으로만 진입
        const showFloating = hasMultiTurn && !opinionFlowStarted && !isAnswerLoading && !isStreaming && !isDebateInProgress && !showDocPreview;
        if (!showFloating) return null;
        const floatingLabel = "상세 답변 받기";
        const handleFloatingClick = requestDetailedAnswer;
        return (
          <div className="fixed bottom-28 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <button
              onClick={handleFloatingClick}
              className="pointer-events-auto flex items-center gap-1.5 rounded-full pl-4 pr-5 py-3 shadow-xl text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
              style={{ background: '#3182F6' }}
            >
              <FileText className="w-4 h-4" />
              {floatingLabel}
            </button>
          </div>
        );
      })()}

      {/* Input Area - Sticky Bottom (대화 상세에서는 파일 첨부 불가) */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl shadow-sm flex flex-col">
            {/* Input Row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={getPlaceholder()}
                disabled={isInputDisabled}
                className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isInputDisabled}
                className="w-10 h-10 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
              >
                <Send className="w-4.5 h-4.5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Document Complete Modal */}
      <DocumentCompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        content={documentContent}
        onComplete={handleFinalComplete}
      />

      {/* Security Alert Dialog */}
      <AlertDialog open={showSecurityAlert} onOpenChange={setShowSecurityAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>📄 파일 업로드 보안 안내</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p className="text-foreground font-medium">
                해당 파일은 상담 세션 내에서만 활용되며, 답변 완료 후 즉시 파기됩니다.
              </p>
              <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
                <p className="font-semibold mb-2">보안 정책:</p>
                <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                  <li>파일은 서버 영구 저장소(Disk)가 아닌 <strong>In-Memory</strong>로만 처리됩니다</li>
                  <li>세션 종료 또는 답변 생성 시 <strong>메모리에서 즉시 삭제(Flush)</strong>됩니다</li>
                  <li>지원 파일 형식: PDF, DOCX, HWP</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction 
              onClick={() => setShowSecurityAlert(false)}
              className="bg-primary hover:bg-primary/90"
            >
              확인했습니다
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* AI Debate Result Modal */}
      <AIDebateResultModal
        isOpen={showDebateResultModal}
        onClose={() => setShowDebateResultModal(false)}
        summary={debateSummary}
        onApply={handleApplyAIOpinion}
      />

      {/* Chat Leave Confirm Modal */}
      <ChatLeaveConfirmModal
        isOpen={showLeaveConfirmModal}
        onClose={() => setShowLeaveConfirmModal(false)}
        onConfirm={pendingLeaveAction}
        onDraftDocument={() => {
          // 모드에 따라 자동으로 처리 (messageId 없으면 기본 동작)
          handleDraftDocument();
        }}
      />

      {/* Session Limit Modal */}
      <SessionLimitModal
        isOpen={showSessionLimitModal}
        onClose={() => setShowSessionLimitModal(false)}
        onContinueNewSession={handleRetryQuestion}
        onDraftDocument={() => {
          setShowSessionLimitModal(false);
          // 모드에 따라 자동으로 처리 (messageId 없으면 기본 동작)
          handleDraftDocument();
        }}
        onEndConsultation={() => {
          setShowSessionLimitModal(false);
          onCompleteDocument?.();
        }}
        questionCount={getAIResponseCount()}
        maxQuestions={MAX_QUESTIONS}
      />

      {/* 출처 및 탐색기록 패널 (사이드 패널은 출처·탐색기록 전용) */}
      {showSourcesPanel && (
        <SourcesAndHistoryPanel
          isOpen={showSourcesPanel}
          onClose={() => setShowSourcesPanel(false)}
          sources={panelSources}
          initialSelectedTitle={selectedSourceTitle}
        />
      )}

      {/* AI 상세의견 토론 오버레이 */}
      {showAIDebate && (() => {
        const target = messages.find(m => m.id === aiDebateTargetId);
        const ai = target?.enhancedData?.aiOpinionSummary;
        const isObj = ai && typeof ai === "object";
        const proPoint = isObj ? (ai as any).proConclusion : "법리에 비추어 형식적 요건과 객관적 증빙이 충분해야 인정이 가능하며, 입증이 미흡하면 인정이 어렵습니다.";
        const conPoint = isObj ? (ai as any).conConclusion : "실질적인 사실관계가 인정된다면 형식과 무관하게 인정 가능성이 높습니다. 현실 정황을 함께 살펴야 합니다.";
        const summary = isObj ? (ai as any).integratedConclusion : (typeof ai === "string" ? ai : (target?.enhancedData?.conclusion || ""));
        return (
          <AIOpinionDebatePanel
            isOpen={showAIDebate}
            onClose={() => setShowAIDebate(false)}
            question={messages.find(m => m.isUser)?.text || initialMessage || ""}
            proPoint={proPoint}
            conPoint={conPoint}
            summary={summary}
            reflected={!!target?.hasAIOpinion}
            onReflect={handleReflectAIOpinion}
            onDelete={handleDeleteAIOpinion}
          />
        );
      })()}

      {/* 의견서 작성 — 주제 선택 바텀시트 (여러 맥락) */}
      <OpinionTopicBottomSheet
        isOpen={showTopicSheet}
        onClose={() => setShowTopicSheet(false)}
        topics={topicCandidates}
        mode={topicSheetMode}
        onSelect={(topic) => {
          setShowTopicSheet(false);
          // 선택 주제로 상세답변 생성 (플로팅 '상세 답변 받기' — 복수 맥락 경유)
          generateDetailedAnswerForTopic(topic.basis || topic.title, { title: topic.title, desc: topic.desc });
        }}
      />

    </div>
  );
}
