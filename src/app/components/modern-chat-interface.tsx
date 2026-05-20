import { AnswerDetailSidebar } from "@/app/components/answer-detail-sidebar";
import { LawDetailSidebar } from "@/app/components/law-detail-sidebar";
import { useState, useRef, useEffect } from "react";
import { ChatBubble } from "@/app/components/chat-bubble";
import { UserMessageBubble } from "@/app/components/user-message-bubble";
import { ProgressiveLoadingBubble } from "@/app/components/progressive-loading";
import { ModernAIResponse } from "@/app/components/modern-ai-response";
import { SimpleResponseCard } from "@/app/components/simple-response-card";
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
  isEnhancedResponse?: boolean;
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
}

interface ModernChatInterfaceProps {
  initialMessage?: string;
  selectedLaws: string[];
  onOpenLawSelector: () => void;
  onStepChange?: (step: number) => void;
  onCompleteDocument?: () => void;
  onMessagesChange?: (hasMessages: boolean) => void; // 메시지 상태 변경 콜백 추가
  relatedLaws?: string[]; // 추천 질문의 관련 법령 추가
  questionType?: string; // 질문 유형 추가
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

// 멀티턴 제한 상수 (최대 6회)
const MAX_QUESTIONS = 6;

export function ModernChatInterface({ 
  initialMessage, 
  selectedLaws, 
  onOpenLawSelector, 
  onStepChange,
  onCompleteDocument,
  onMessagesChange, // 추가
  relatedLaws, // 추가
  questionType, // 추가
}: ModernChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showDocPreview, setShowDocPreview] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [documentContent, setDocumentContent] = useState("");
  const [documentData, setDocumentData] = useState<any>(null); // 의견서 조화 데이터
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
  
  // 세션 제한 관련 상태
  const [showSessionLimitModal, setShowSessionLimitModal] = useState(false);
  const [pendingQuestion, setPendingQuestion] = useState("");
  const [pendingAttachedFiles, setPendingAttachedFiles] = useState<Array<{ name: string; size: number; type: string; }>>([]);
  
  // 답변 상세 사이드바 관련 상태
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [preparingAnswerData, setPreparingAnswerData] = useState<EnhancedResponseData | null>(null);
  const [isInitialAnswerView, setIsInitialAnswerView] = useState(false); // 최초 답변 생성 시 사이드바인지 여부
  const [autoCloseSidebar, setAutoCloseSidebar] = useState(false); // 사이드바 자동 닫기 플래그
  
  // 법령 상세 사이드바 관련 상태
  const [showLawDetailSidebar, setShowLawDetailSidebar] = useState(false);
  const [selectedLawName, setSelectedLawName] = useState<string>("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI 답변 횟수 계산 (실제 답변만 카운트)
  const getAIResponseCount = (): number => {
    return messages.filter(m => 
      !m.isUser && 
      !m.isLoading && 
      (m.isEnhancedResponse || (m.relatedLaws && m.relatedLaws.length > 0))
    ).length;
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

    setTimeout(() => {
      const enhancedData = generateIntegratedResponse(question);
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: "",
        isUser: false,
        isEnhancedResponse: true,
        enhancedData: enhancedData,
      };
      setMessages((prev) => prev.filter(m => !m.isLoading).concat(aiMsg));
      
      // Step 2: 법령 분석 완료 -> Step 3: 결과 확인
      onStepChange?.(3);
      setCurrentStep(3);
    }, 16000); // 16초로 변경
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

      // Generate response with refined laws (동일한 원래 질문 사용)
      setTimeout(() => {
        const enhancedData = generateIntegratedResponse(originalQuestion);
        const aiMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: "",
          isUser: false,
          isEnhancedResponse: true,
          enhancedData: enhancedData,
        };
        setMessages((prev) => prev.filter(m => !m.isLoading).concat(aiMsg));
      }, 16000); // 법령 재선택도 16초 분석 시간 적용
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

      // questionType이 있으면 해당 타입에 맞는 답변 생성
      if (questionType) {
        // 프로토타입 질문인 경우 questionType에 따라 분기
        if (questionType === "simple") {
          // 간단한 답변 - Simple Response Card
          onStepChange?.(2);
          setCurrentStep(2);

          const loadingMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            isLoading: true,
            relatedLaws: relatedLaws,
          };
          setMessages((prev) => [...prev, loadingMsg]);

          setTimeout(() => {
            const simpleMsg: Message = {
              id: (Date.now() + 2).toString(),
              text: "",
              isUser: false,
              relatedLaws: relatedLaws || [],
            };
            setMessages((prev) => prev.filter(m => !m.isLoading).concat(simpleMsg));
            setIsTyping(false);
            onStepChange?.(3);
            setCurrentStep(3);
          }, 2000);
        } else if (questionType === "normal") {
          // 정상 질문 - 일반 AI 답변 생성
          onStepChange?.(2);
          setCurrentStep(2);

          const loadingMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            isLoading: true,
            relatedLaws: relatedLaws,
          };
          setMessages((prev) => [...prev, loadingMsg]);

          setTimeout(() => {
            const enhancedData = generateIntegratedResponse(initialMessage);
            const aiMsg: Message = {
              id: (Date.now() + 2).toString(),
              text: "",
              isUser: false,
              isEnhancedResponse: true,
              enhancedData: enhancedData,
            };
            setMessages((prev) => prev.filter(m => !m.isLoading).concat(aiMsg));
            setIsTyping(false);
            onStepChange?.(3);
            setCurrentStep(3);
          }, 16000); // 16초로 변경
        } else if (questionType === "insufficient") {
          // 정보 부족 - 휴먼 피드백 요청
          const feedbackMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            needsFeedback: true,
            feedbackReason: "insufficient",
            suggestedQuestions: getSuggestedQuestions("insufficient"),
          };
          setMessages((prev) => [...prev, feedbackMsg]);
        } else if (questionType === "meaningless") {
          // 의미없는 질문 - 휴먼 피드백 요청 (invalid)
          const feedbackMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            needsFeedback: true,
            feedbackReason: "invalid",
            suggestedQuestions: getSuggestedQuestions("meaningless"),
          };
          setMessages((prev) => [...prev, feedbackMsg]);
        } else if (questionType === "out-of-scope") {
          // 범위 밖 질문 - 휴먼 피드백 요청 (invalid)
          const feedbackMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            needsFeedback: true,
            feedbackReason: "invalid",
            suggestedQuestions: getSuggestedQuestions("out-of-scope"),
          };
          setMessages((prev) => [...prev, feedbackMsg]);
        } else if (questionType === "inappropriate") {
          // 부적절한 질문 - 휴먼 피드백 요청 (inappropriate)
          const feedbackMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            needsFeedback: true,
            feedbackReason: "inappropriate",
            suggestedQuestions: getSuggestedQuestions("unethical"),
          };
          setMessages((prev) => [...prev, feedbackMsg]);
        }
        return; // questionType이 있으면 검증 로직 우회
      }

      // questionType이 없으면 기존 검증 로직 실행
      const validation = validateQuestion(initialMessage);

      // If question needs human feedback, show feedback request
      if (!validation.isValid) {
        // Check if it's insufficient (needs clarification) or other issues
        if (validation.reason === "insufficient" || validation.reason === "meaningless" || validation.reason === "out-of-scope" || validation.reason === "inappropriate" || validation.reason === "unethical") {
          let feedbackReason: "invalid" | "insufficient" | "inappropriate" = "insufficient";
          
          if (validation.reason === "meaningless" || validation.reason === "out-of-scope") {
            feedbackReason = "invalid";
          } else if (validation.reason === "inappropriate" || validation.reason === "unethical") {
            feedbackReason = "inappropriate";
          } else if (validation.reason === "insufficient") {
            feedbackReason = "insufficient";
          }
          
          const feedbackMsg: Message = {
            id: (Date.now() + 1).toString(),
            text: "",
            isUser: false,
            needsFeedback: true,
            feedbackReason: feedbackReason,
            suggestedQuestions: getSuggestedQuestions(validation.reason),
          };
          setMessages((prev) => [...prev, feedbackMsg]);
          return;  // Don't proceed with AI response
        }
      }

      // Step 1: 질문 입력 완료 -> Step 2: 법령 분석 시작
      onStepChange?.(2);
      setCurrentStep(2);

      // Show loading state first
      const loadingMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        isUser: false,
        isLoading: true,
        relatedLaws: relatedLaws, // 추천 질문의 련 법령 전달
      };
      setMessages((prev) => [...prev, loadingMsg]);

      // After 16 seconds, replace with integrated response
      setTimeout(() => {
        const enhancedData = generateIntegratedResponse(initialMessage);
        const aiMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: "",
          isUser: false,
          isEnhancedResponse: true,
          enhancedData: enhancedData,
        };
        setMessages((prev) => prev.filter(m => !m.isLoading).concat(aiMsg));
        setIsTyping(false);
        
        // Step 2: 법령 분석 완료 -> Step 3: 결과 확인
        onStepChange?.(3);
        setCurrentStep(3);
      }, 16000); // 16초로 변경
    }
  }, [initialMessage, questionType]);

  // Handle revised question from feedback
  const handleRevisedQuestion = (revisedQuestion: string) => {
    // Same as handleSubmit, but starts a new conversation
    const userMsg: Message = {
      id: Date.now().toString(),
      text: revisedQuestion,
      isUser: true,
      lawCategory: detectLawCategory(revisedQuestion),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Show loading
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      isLoading: true,
      relatedLaws: relatedLaws, // 추천 질문의 관련 법령 전달
    };
    setMessages((prev) => [...prev, loadingMsg]);

    // Step 1: 질문 입력 완료 -> Step 2: 법령 분석 시작
    onStepChange?.(2);
    setCurrentStep(2);

    setTimeout(() => {
      const enhancedData = generateIntegratedResponse(revisedQuestion);
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: "",
        isUser: false,
        isEnhancedResponse: true,
        enhancedData: enhancedData,
      };
      setMessages((prev) => prev.filter(m => !m.isLoading).concat(aiMsg));
      
      // Step 2: 법령 분석 완료 -> Step 3: 결과 확인
      onStepChange?.(3);
      setCurrentStep(3);
    }, 16000); // 16초로 변경
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
      
      // AI 의견은 최초 답변에서 제거 (AI 심층분석 후에만 표시)
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // AI 심층분석 진행 중에는 입력 불가
    const isDebateInProgress = messages.some(m => m.isDebate && !m.debateHistory);
    if (isDebateInProgress) {
      toast.info("AI 심층분석이 진행 중입니다. 잠시만 기다려주세요.");
      return;
    }

    // 멀티턴 제한 체크
    const aiResponseCount = getAIResponseCount();
    if (aiResponseCount >= MAX_QUESTIONS) {
      // 질문을 보내지 않고 세션 전환 알럿 표시
      const filesInfo = uploadedFiles.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
      }));
      
      setPendingQuestion(inputValue);
      setPendingAttachedFiles(filesInfo);
      setShowSessionLimitModal(true);
      return;
    }

    // 첨부파일 정보 저장 (data 제외)
    const filesInfo = uploadedFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    const userMsg: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      attachedFiles: filesInfo.length > 0 ? filesInfo : undefined,
    };
    const savedInput = inputValue;
    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    
    // 메시지 발송 후 첨부파일 삭제
    setUploadedFiles([]);

    // Show loading
    const loadingMsg: Message = {
      id: (Date.now() + 1).toString(),
      text: "",
      isUser: false,
      isLoading: true,
      relatedLaws: relatedLaws, // 추천 질문의 관련 법령 전달
    };
    setMessages((prev) => [...prev, loadingMsg]);

    setTimeout(() => {
      const enhancedData = generateIntegratedResponse(savedInput);
      const aiMsg: Message = {
        id: (Date.now() + 2).toString(),
        text: "",
        isUser: false,
        isEnhancedResponse: true,
        enhancedData: enhancedData,
      };
      setMessages((prev) => prev.filter(m => !m.isLoading).concat(aiMsg));
    }, 16000); // 후속 질문도 최초 질문과 동일한 16초 분석 시간 적용
  };

  const handleViewOpinion = () => {
    // Could show additional details or expand all accordions
    alert("AI 노무사의 상세 의견을 확인할 수 있습니다.");
  };

  const handleDraftDocument = (userMessage: string) => {
    const doc = generateDocument(userMessage);
    const today = new Date();
    const formattedDate = `${today.getFullYear()}. ${String(today.getMonth() + 1).padStart(2, '0')}. ${String(today.getDate()).padStart(2, '0')}.`;
    
    // 구조화된 의견서 데이 생성
    const data = {
      referenceNo: `AI-LABOR-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}-001`,
      date: formattedDate,
      client: "[회사명]",
      manager: "[직함 / 성명]",
      reviewType: detectReviewType(userMessage),
      reviewTarget: userMessage.substring(0, 30) + "...",
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

  // Handle AI Opinion Request (Dual Persona Debate)
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

  // 법령 클릭 핸들러
  const handleLawClick = (lawName: string) => {
    setSelectedLawName(lawName);
    setShowLawDetailSidebar(true);
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

  // 세션 제한 확인
  useEffect(() => {
    const aiResponseCount = getAIResponseCount();
    if (aiResponseCount >= MAX_QUESTIONS) {
      setShowSessionLimitModal(true);
    }
  }, [messages]);

  // 세션 제한 모달에서 질문 재시도
  const handleRetryQuestion = () => {
    if (pendingQuestion) {
      const userMsg: Message = {
        id: Date.now().toString(),
        text: pendingQuestion,
        isUser: true,
        attachedFiles: pendingAttachedFiles,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputValue("");
      
      // 메시지 발송 후 첨부파일 삭제
      setUploadedFiles([]);

      // Show loading
      const loadingMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "",
        isUser: false,
        isLoading: true,
        relatedLaws: relatedLaws, // 추천 질문의 관련 법령 전달
      };
      setMessages((prev) => [...prev, loadingMsg]);

      setTimeout(() => {
        const enhancedData = generateIntegratedResponse(pendingQuestion);
        const aiMsg: Message = {
          id: (Date.now() + 2).toString(),
          text: "",
          isUser: false,
          isEnhancedResponse: true,
          enhancedData: enhancedData,
        };
        setMessages((prev) => prev.filter(m => !m.isLoading).concat(aiMsg));
      }, 16000); // 세션 제한 모달 질문도 16초 분석 시간 적용
    }
    setShowSessionLimitModal(false);
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

  // AI 심층분석 진행 중인지 확인
  // AI 심층분석 선택 시 채팅 입력창 비활성화 처리
  const isDebateInProgress = messages.some(m => m.isDebate && !m.debateHistory);
  
  // 답변 생성 중이거나 휴먼 피드백 요청 중인지 확인
  const isAnswerLoading = messages.some(m => m.isLoading);
  const hasActiveFeedback = messages.some(m => m.needsFeedback);
  
  // 입력 비활성화 조건: 토론 진행 중 OR 답변 생성 중
  const isInputDisabled = isDebateInProgress || isAnswerLoading;
  
  // 비활성화 사유에 따른 placeholder 텍스트
  const getPlaceholder = (): string => {
    if (isDebateInProgress) return "AI 심층분석 진행 중...";
    if (isAnswerLoading) return "답변 생성 중...";
    if (uploadedFiles.length > 0) return "첨부된 파일에 대해 궁금한 점을 질문해 주세요...";
    return "추가 질문을 입력하세요...";
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* 배경 아이콘 레이어 - 메인 화면과 동일 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {FLOATING_ICONS.map((item, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: item.x,
              top: item.y,
              animation: `float ${item.duration}s ease-in-out ${item.delay}s infinite`,
            }}
          >
            <item.Icon 
              className="text-primary"
              style={{
                width: item.size,
                height: item.size,
                opacity: item.opacity,
              }}
            />
          </div>
        ))}
      </div>

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-15px) rotate(3deg);
          }
        }
      `}</style>

      {/* Chat Messages Area */}
      <div className="flex-1 relative z-10 px-6 overflow-hidden">
        {/* 고정 흰색 배경 컨테이너 - 상단/하단과 이어짐 */}
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-950 shadow-lg h-full flex flex-col">
          {/* 내부에서만 스크롤 가능 */}
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground mt-20">
                <p className="text-lg">대화를 시작해보세요</p>
              </div>
            )}

            {messages.map((message, index) => {
              // 현재 메시지의 턴 계산 (사용자 메시지만 카운트)
              const userMessagesUpToNow = messages.slice(0, index + 1).filter(m => m.isUser).length;
              const remainingQuestions = MAX_QUESTIONS - userMessagesUpToNow;

              return (
                <div key={message.id}>
                  {message.isUser && (
                    <UserMessageBubble 
                      message={message.text} 
                      attachedFiles={message.attachedFiles}
                      currentTurn={userMessagesUpToNow}
                      remainingQuestions={remainingQuestions}
                      maxQuestions={MAX_QUESTIONS}
                    />
                  )}
                  {message.isLoading && <ProgressiveLoadingBubble relatedLaws={message.relatedLaws} onStop={handleStopResponse} onAnswerPreparationStart={handleAnswerPreparationStart} onNavigateToMain={handleNavigateToMain} />}
                {message.needsFeedback && message.feedbackReason && (
                  <HumanFeedbackRequest
                    reason={message.feedbackReason}
                    originalQuestion={messages.find(m => m.isUser)?.text || ""}
                    onSubmitRevision={handleRevisedQuestion}
                    suggestedQuestions={message.suggestedQuestions}
                    onQuestionSelect={(question) => setInputValue(question)}
                  />
                )}
                {!message.isUser && !message.isLoading && !message.needsFeedback && !message.isEnhancedResponse && !message.isDebate && !message.isInvalidQuestion && message.relatedLaws && (
                  <SimpleResponseCard
                    question={messages.find(m => m.isUser)?.text || ""}
                    answer={{
                      items: [
                        {
                          text: "법인세법은 대한민국의 법인에 대한 소득에 관하여 과세하는 것을 목적으로 하는 법입니다.",
                          laws: ["법인세법 제1조"]
                        },
                        {
                          text: "법인세법에서는 \"내국법인\", \"외국법인\", \"비영리법인\" 등 용어의 정의를 명확하게 하고 있습니다.",
                          laws: ["법인세법 제2조"]
                        },
                        {
                          text: "법인세를 납부할 의무자는 내국법인과 국내원천소득이 있는 외국법인입니다.",
                          laws: ["법인세법 제3조"]
                        },
                        {
                          text: "과세 대상 소득의 범위, 사업연도, 과세표준, 남부세액 등 세법적인 기준과 절차를 규정하고 있습니다.",
                          laws: ["법인세법 제4조", "법인세법 제6조", "법인세법 제13조", "법인세법 제8조"]
                        },
                        {
                          text: "또한, 법인세 부과와 관련된 질문 조사, 손금산입, 병 시 결손금 공제 제한 등 세부적인 절차를 세밀하게 규정하고 있습니다.",
                          laws: ["법인세법 제122조", "법인세법 제25조", "법인세법 제45조"]
                        }
                      ]
                    }}
                    relatedLaws={message.relatedLaws.map((law, idx) => ({
                      id: `제${idx + 1}조`,
                      name: law
                    }))} 
                    onLawClick={handleLawClick}
                  />
                )}
                {message.isEnhancedResponse && message.enhancedData && (
                  <ModernAIResponse
                    conclusion={message.enhancedData.conclusion}
                    factAnalysis={message.enhancedData.factAnalysis}
                    queryContent={message.enhancedData.queryRedefinition}
                    reviewContent={message.enhancedData.reviewContent}
                    sources={message.enhancedData.sources}
                    aiOpinion={message.hasAIOpinion ? message.enhancedData.aiOpinionSummary : undefined}
                    disclaimer="AI 의견은 참고용이며 부정확한 정보가 포함될 수 있습니다. 중요한 결정은 전문가 상담을 권드립니다."
                    onRefineSearch={handleRefineSearch}
                    onDraftDocument={() => handleDraftDocument(messages.find(m => m.isUser)?.text || "")}
                    onRequestAIOpinion={() => handleRequestAIOpinion(message.id)}
                    hasAIOpinion={message.hasAIOpinion || false}
                    questionSummary={generateQuestionSummary(messages.find(m => m.isUser)?.text || "")}
                    onOpenDetailView={() => {
                      setPreparingAnswerData(message.enhancedData || null);
                      setShowDetailSidebar(true);
                      setIsInitialAnswerView(false); // 상세 답변 보기는 최초 답변이 아님
                      console.log('[Chat] 상세 답변 보기 열기 (타이핑 효과 없음)');
                    }}
                  />
                )}
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

      {/* Input Area - Sticky Bottom */}
      <div className="border-t border-border bg-card/80 backdrop-blur-sm">
        <div className="max-w-3xl mx-auto px-6 py-4">
          {/* Input Form with Files Inside */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl shadow-sm flex flex-col">
            {/* File Upload Preview (inside input area) */}
            {uploadedFiles.length > 0 && (
              <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-full"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        const newFiles = uploadedFiles.filter((_, i) => i !== index);
                        setUploadedFiles(newFiles);
                      }}
                      className="flex-shrink-0 w-4 h-4 bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5 text-indigo-700 dark:text-indigo-200" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* File upload guide message */}
            {uploadedFiles.length > 0 && (
              <div className="mx-4 mb-1 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
                  파일 첨부 시 <span className="font-semibold">노무 관련 질문</span>으로 라우팅됩니다.
                  <br />세법 관련 질문은 파일을 제거한 후 질문해 주세요.
                </p>
              </div>
            )}

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
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".pdf,.docx,.hwp"
                className="hidden"
                multiple
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isInputDisabled}
                className="w-9 h-9 bg-muted hover:bg-muted/80 rounded-full transition-colors flex items-center justify-center flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                title="파일 업로드 (PDF, DOCX, HWP)"
              >
                <Paperclip className="w-4.5 h-4.5" />
              </button>
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
          const userMessage = messages.find(m => m.isUser)?.text || "";
          if (userMessage) {
            handleDraftDocument(userMessage);
          }
        }}
      />

      {/* Session Limit Modal */}
      <SessionLimitModal
        isOpen={showSessionLimitModal}
        onClose={() => setShowSessionLimitModal(false)}
        onContinueNewSession={() => {
          // 새 세션 시작: 페이지 리셋하고 질문 자동 전송
          window.location.reload();
          // TODO: 페이지 로드 후 pendingQuestion을 입력창에 자동으로 넣고 전송
        }}
        onDraftDocument={() => {
          setShowSessionLimitModal(false);
          const userMessage = messages.find(m => m.isUser)?.text || "";
          if (userMessage) {
            handleDraftDocument(userMessage);
          }
        }}
        onEndConsultation={() => {
          setShowSessionLimitModal(false);
          onCompleteDocument?.();
        }}
        questionCount={getAIResponseCount()}
        maxQuestions={MAX_QUESTIONS}
      />

      {/* Answer Detail Sidebar */}
      {preparingAnswerData && (
        <AnswerDetailSidebar
          isOpen={showDetailSidebar}
          onClose={() => {
            console.log('[Chat] 사이드바 닫기 - autoCloseSidebar 플래그 초기화');
            setShowDetailSidebar(false);
            setAutoCloseSidebar(false); // 플래그 초기화
          }}
          conclusion={preparingAnswerData.conclusion}
          factAnalysis={preparingAnswerData.factAnalysis}
          queryContent={preparingAnswerData.queryRedefinition}
          reviewContent={preparingAnswerData.reviewContent}
          sources={preparingAnswerData.sources}
          aiOpinion={preparingAnswerData.aiOpinionSummary}
          questionSummary={messages.find(m => m.isUser)?.text || initialMessage}
          isInitialAnswer={isInitialAnswerView} // 최초 답변 생성 시 사이드바인지 여부
        />
      )}

      {/* Law Detail Sidebar */}
      {showLawDetailSidebar && (
        <LawDetailSidebar
          isOpen={showLawDetailSidebar}
          onClose={() => setShowLawDetailSidebar(false)}
          lawName={selectedLawName}
        />
      )}
    </div>
  );
}