import { useState, useEffect } from "react";
import { track } from "@/app/utils/track";
import { FunnelDebugPanel } from "@/app/components/funnel-debug-panel";
import { NoticeView } from "@/app/components/notice-view";
import { EmergencyPopup } from "@/app/components/emergency-popup";
import { getEmergency, getUnreadCount } from "@/app/data/service-content";
import { TopHeader } from "@/app/components/top-header";
import { ModernHomeView } from "@/app/components/modern-home-view";
import { ModernChatInterface } from "@/app/components/modern-chat-interface";
import { PolicyManagementView } from "@/app/components/policy-management-view";
import { EmbeddingCorrectionView, EmbeddingCorrectionPolicy } from "@/app/components/embedding-correction-view";
import { LaborCalculatorView } from "@/app/components/labor-calculator-view";
import { LawSelectionModal } from "@/app/components/law-selection-modal";
import { EnhancedChatHistoryModal } from "@/app/components/enhanced-chat-history-modal";
import { HistorySidebarPanel } from "@/app/components/history-sidebar-panel";
import { ChatLeaveConfirmModal } from "@/app/components/chat-leave-confirm-modal";
import { ServiceFeedbackModal } from "@/app/components/service-feedback-modal";
import { POLICY_NUDGE_PENDING_KEY, POLICY_NUDGE_DISMISS_KEY } from "@/app/components/policy-register-inline-cta";
import { Toaster } from "@/app/components/ui/sonner";
import { getHistorySession, ChatHistorySession } from "@/app/data/chat-history";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "chat" | "policy" | "embedding" | "calculator" | "notice">("home");
  const [chatQuery, setChatQuery] = useState<string>("");
  const [selectedLaws, setSelectedLaws] = useState<string[]>([]);
  const [relatedLaws, setRelatedLaws] = useState<string[]>([]);
  const [questionType, setQuestionType] = useState<string | undefined>(undefined);
  const [contextType, setContextType] = useState<string | undefined>(undefined); // 추천질문 프로세스 유형: 멀티턴 맥락 수 (single/multi)
  const [showLawModal, setShowLawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isRefiningSearch, setIsRefiningSearch] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAdmin] = useState<boolean>(true);
  // 체험판 여부 (체험판에서는 답변 평가 미제공, 질문 10회 제한) — 실제로는 사용자 플랜 정보에서 주입
  const [isTrial, setIsTrial] = useState<boolean>(false);
  const [trialCount, setTrialCount] = useState<number>(0);
  const [oneAiBannerDismissed, setOneAiBannerDismissed] = useState<boolean>(false);
  const TRIAL_MAX = 10;
  const TRIAL_COMPANY = "더존비즈온";
  const [hasChatMessages, setHasChatMessages] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [showServiceFeedback, setShowServiceFeedback] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<EmbeddingCorrectionPolicy | null>(null);
  const [pendingPoliciesCount, setPendingPoliciesCount] = useState<number>(0);
  // 퍼널 검증 패널 — URL에 ?funnel 있을 때만 노출(비개발자 검증용)
  const [showFunnelPanel, setShowFunnelPanel] = useState<boolean>(
    () => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("funnel")
  );
  // 공지사항 — 페이지 전환 방식(전체보기)
  const handleOpenNotices = () => {
    setCurrentView("notice");
  };
  // 공지 팝업(중앙) — content.active 자동 노출(단, '다시 보지 않기' 시 억제) / 데모 ?emergency는 강제
  const [showEmergency, setShowEmergency] = useState<boolean>(() => {
    if (typeof window === "undefined") return getEmergency().active;
    const params = new URLSearchParams(window.location.search);
    if (params.has("emergency")) return true; // 데모 강제 노출
    const e = getEmergency();
    // '다시 보지 않기'는 팝업(id)+리비전 단위 — BO에서 수정/재활성화 시 리비전 증가로 재노출(POP-003)
    if (localStorage.getItem("notice_popup_hidden_rev") === `${e.popupId ?? "static"}:${e.revision ?? 0}`) return false;
    return e.active;
  });
  const [requestDraftDocument, setRequestDraftDocument] = useState(false);
  const [historySession, setHistorySession] = useState<ChatHistorySession | null>(null); // 채팅 이력 보기(전체화면 복원)

  // pending 정책 개수 확인 (테스트용: 3개)
  useEffect(() => {
    if (isAdmin) {
      // 실제로는 localStorage나 API에서 가져옴
      // const completedPolicies = JSON.parse(localStorage.getItem("completedPolicies") || "[]");
      // setPendingPoliciesCount(completedPolicies.length);
      
      // 테스트용: 3개 고정
      setPendingPoliciesCount(3);
    }
  }, [isAdmin]);

  const handleStartChat = (query: string, laws: string[], promptRelatedLaws?: string[], promptQuestionType?: string, promptContextType?: string) => {
    setHistorySession(null); // 새 질문 시작 시 이력 보기 해제
    setChatQuery(query);
    setSelectedLaws(laws);
    setRelatedLaws(promptRelatedLaws || []); // 추천 질문의 관련 법령 저장
    setQuestionType(promptQuestionType); // 질문 유형 저장
    setContextType(promptContextType); // 프로세스 유형: 멀티턴 맥락 수 (single/multi)
    setCurrentView("chat");
    setCurrentStep(1); // 질문 입력 단계
    if (isTrial) setTrialCount((c) => Math.min(c + 1, TRIAL_MAX)); // 체험판 질문 카운트(10회 제한)
  };

  const handleNewChat = () => {
    setChatQuery("");
    setSelectedLaws([]);
    setHistorySession(null);
    setCurrentView("home");
    setCurrentStep(1);
  };

  const handleConfirmLaws = (laws: string[]) => {
    setSelectedLaws(laws);
    // If we're in chat view and refining search, trigger a new search
    if (currentView === "chat" && isRefiningSearch) {
      setIsRefiningSearch(false);
      // The chat interface will handle the refined search
    }
  };

  const handleOpenLawSelector = () => {
    if (currentView === "chat") {
      setIsRefiningSearch(true);
    }
    setShowLawModal(true);
  };

  const handleStepChange = (step: number) => {
    setCurrentStep(step);
  };

  const handleCompleteDocument = () => {
    // 메인 화면으로 이동
    handleNewChat();
  };

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
  };

  const handleToggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  // 퍼널 S1: 정책 등록 자격(관리자 여부) — 세션 진입 시 1회
  useEffect(() => {
    track("S1_eligibility", { isAdmin });
  }, [isAdmin]);

  const handleOpenPolicyUpload = (source: string = "unknown") => {
    track("S3_enter", { source }); // 퍼널 S3: 정책 관리 화면 진입(진입점별)
    setCurrentView("policy");
  };

  const handleViewChatHistory = (chatId: string) => {
    // 채팅 이력 보기 → 채팅 전체 화면으로 전환하여 이전 대화 그대로 복원 (읽기 전용)
    const session = getHistorySession(chatId);
    if (!session) return;
    setHistorySession(session);
    setChatQuery("");
    setSelectedLaws([]);
    setContextType(undefined);
    setQuestionType(undefined);
    setCurrentView("chat");
    setCurrentStep(3);
    setShowSidebar(false);
  };

  const handleOpenEmbedding = (policy: EmbeddingCorrectionPolicy) => {
    setSelectedPolicy(policy);
    setCurrentView("embedding");
  };

  const handleBackFromEmbedding = () => {
    setSelectedPolicy(null);
    setCurrentView("policy");
    track("S7_register_complete"); // 퍼널 S7: 정책 등록(검수 저장 후 완료)
    // 정책 저장 완료 시 pending 카운트 감소
    setPendingPoliciesCount((prev) => Math.max(0, prev - 1));
  };

  const handleReviewCompletedPolicies = () => {
    setCurrentView("policy");
  };

  const handleLogoClick = () => {
    handleNavigation(handleNewChat);
  };

  const handleSelectChat = (chatId: string) => {
    // 실제로는 chatId로 해당 대화를 불러옴
    console.log("Selected chat:", chatId);
    // For demo, just show a placeholder
  };

  const handleOpenManual = () => {
    console.log("사용자 매뉴얼 열기");
    // 실제 구현에서는 매뉴얼 페이지나 모달을 엽니다
  };

  const handleNavigation = (action: () => void) => {
    // 채팅이력 보기(읽기 전용)는 잃을 대화가 없어 확인 알럿 미노출 → 바로 이동
    if (hasChatMessages && currentView === "chat" && !historySession) {
      setShowLeaveConfirmModal(true);
      setPendingNavigationAction(() => action);
    } else {
      action();
    }
  };

  // CHA-012: 답변 완료 상태에서 세션 종료 시 평가 노출 여부 판단
  // - 체험판 미제공 / 1일 최대 1회 / 대화 세션 3회당 1회
  const shouldShowFeedbackOnLeave = (): boolean => {
    if (isTrial) return false;            // 체험판 미제공
    if (!hasChatMessages) return false;   // 답변 완료 상태에서만

    try {
      const today = new Date().toISOString().slice(0, 10);

      // 종료된 대화 세션 수 누적
      const sessionCount = Number(localStorage.getItem("feedbackSessionCount") || "0") + 1;
      localStorage.setItem("feedbackSessionCount", String(sessionCount));

      // 대화 세션 3회당 1회
      if (sessionCount % 3 !== 0) return false;

      // 1일 최대 1회
      if (localStorage.getItem("feedbackLastShownDate") === today) return false;

      localStorage.setItem("feedbackLastShownDate", today);
      return true;
    } catch {
      return false;
    }
  };

  // 메인 진입 시 규정등록 배너가 뜰 예정인지 (규정등록 배너 > 피드백 팝업 우선순위)
  const willShowPolicyNudge = (): boolean => {
    try {
      return (
        localStorage.getItem(POLICY_NUDGE_PENDING_KEY) === "1" &&
        localStorage.getItem(POLICY_NUDGE_DISMISS_KEY) !== "1"
      );
    } catch {
      return false;
    }
  };

  const handleLeaveConfirm = () => {
    if (pendingNavigationAction) {
      pendingNavigationAction();
      setPendingNavigationAction(null);
    }
    setShowLeaveConfirmModal(false);
    // 규정등록 배너가 우선 — 배너가 뜰 예정이면 피드백 팝업은 이번엔 노출하지 않음
    // (shouldShowFeedbackOnLeave는 카운터를 소모하므로 단축평가로 호출 자체를 건너뜀)
    if (!willShowPolicyNudge() && shouldShowFeedbackOnLeave()) {
      setShowServiceFeedback(true);
    }
  };

  const handleLeaveCancel = () => {
    setShowLeaveConfirmModal(false);
  };

  return (
    <div
      className="flex flex-col h-screen overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 35%, #EBF1FF 100%)",
      }}
    >
      {/* Top Header – embedding·calculator·notice 화면에서는 미노출(자체 헤더 사용, 공지 상세는 몰입형) */}
      {currentView !== "embedding" && currentView !== "calculator" && currentView !== "notice" && (
        <TopHeader
          variant={currentView === "chat" ? "chat" : currentView === "policy" ? "policy" : "home"}
          onNavigateToMain={() => handleNavigation(handleNewChat)}
          onNewChat={() => handleNavigation(handleNewChat)}
          onOpenHistory={handleOpenHistory}
          onOpenPolicyUpload={() => {
            if (currentView === "chat" && hasChatMessages) {
              handleNavigation(handleOpenPolicyUpload);
            } else {
              handleOpenPolicyUpload();
            }
          }}
          onLogoClick={handleLogoClick}
          onToggleSidebar={handleToggleSidebar}
          onOpenNtsDirectory={() =>
            window.open(
              "https://nts.go.kr/nts/cm/cntnts/cntntsView.do?mi=6740&cntntsId=8140",
              "_blank",
              "noopener,noreferrer"
            )
          }
          onOpenManual={() =>
            window.open(
              "https://www.figma.com/deck/1ZXPBZL2hOhbLcfZiKLBH6",
              "_blank",
              "noopener,noreferrer"
            )
          }
          pendingPoliciesCount={isAdmin ? pendingPoliciesCount : 0}
          isSidebarOpen={showSidebar}
          isTrial={isTrial}
          companyName={TRIAL_COMPANY}
          trialCount={trialCount}
          trialMax={TRIAL_MAX}
        />
      )}

      {/* 체험판 ONE AI 프로모션 배너 — 홈: 카드 / 채팅: 콤팩트 필 (디자인 정합) */}
      {isTrial && !oneAiBannerDismissed && currentView === "home" && (
        <div className="fixed bottom-5 right-5 z-40 w-[300px] rounded-2xl shadow-xl p-5 text-white"
          style={{ background: "linear-gradient(135deg, #5784FF 0%, #8B5CF6 100%)" }}
        >
          <button
            onClick={() => setOneAiBannerDismissed(true)}
            aria-label="닫기"
            className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-white/80 hover:bg-white/15 transition-colors"
          >
            ✕
          </button>
          <p className="text-2xl font-extrabold tracking-tight">ONE AI</p>
          <p className="mt-2 text-sm leading-relaxed text-white/90" style={{ wordBreak: "keep-all" }}>
            더존의 비즈니스 핵심 솔루션과 융합된 ONE AI로 업무 혁신을 경험해 보세요.
          </p>
          <button
            onClick={() => window.open("https://www.douzone.com", "_blank", "noopener,noreferrer")}
            className="mt-4 w-full py-2.5 rounded-xl bg-white text-primary text-sm font-bold hover:bg-white/90 transition-colors"
          >
            문의하기
          </button>
        </div>
      )}
      {isTrial && !oneAiBannerDismissed && currentView !== "home" && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full shadow-xl pl-5 pr-2 py-2 text-white"
          style={{ background: "linear-gradient(135deg, #5784FF 0%, #8B5CF6 100%)" }}
        >
          <span className="text-sm font-semibold whitespace-nowrap">ONE AI로 업무 혁신 경험해보기</span>
          <button
            onClick={() => window.open("https://www.douzone.com", "_blank", "noopener,noreferrer")}
            className="px-4 py-1.5 rounded-full bg-white text-primary text-sm font-bold hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            문의하기
          </button>
        </div>
      )}

      {/* 퍼널 검증 패널 (?funnel) */}
      {showFunnelPanel && <FunnelDebugPanel onClose={() => setShowFunnelPanel(false)} />}

      {/* 서비스 오류 긴급 팝업 (전역 최우선) */}
      {showEmergency && (
        <EmergencyPopup
          onClose={() => setShowEmergency(false)}
          onDontShowAgain={() => {
            setShowEmergency(false);
            const e = getEmergency();
            try { localStorage.setItem("notice_popup_hidden_rev", `${e.popupId ?? "static"}:${e.revision ?? 0}`); } catch { /* noop */ }
          }}
        />
      )}


      {/* History Sidebar Panel */}
      <HistorySidebarPanel
        isOpen={showSidebar}
        onClose={() => setShowSidebar(false)}
        onNewChat={() => {
          handleNavigation(handleNewChat);
          setShowSidebar(false);
        }}
        onOpenManual={handleOpenManual}
        onOpenNotices={() => {
          setShowSidebar(false);
          if (currentView === "chat" && hasChatMessages) {
            handleNavigation(handleOpenNotices);
          } else {
            handleOpenNotices();
          }
        }}
        unreadNoticeCount={getUnreadCount()}
        onOpenPolicyList={() => {
          if (currentView === "chat" && hasChatMessages) {
            handleNavigation(() => handleOpenPolicyUpload("sidebar"));
          } else {
            handleOpenPolicyUpload("sidebar");
          }
          setShowSidebar(false);
        }}
        onViewChatHistory={handleViewChatHistory}
        pendingPoliciesCount={isAdmin ? pendingPoliciesCount : 0}
        isTrial={isTrial}
        onToggleTrial={() => {
          setIsTrial((v) => !v);
          setTrialCount(0);
          setOneAiBannerDismissed(false);
          setShowSidebar(false);
          handleNewChat();
        }}
      />

      {/* Main Content */}
      {currentView === "home" && (
        <ModernHomeView
          onStartChat={handleStartChat}
          onOpenLawSelector={handleOpenLawSelector}
          selectedLaws={selectedLaws}
          onClearLaws={() => setSelectedLaws([])}
          onOpenPolicyManagement={() => handleOpenPolicyUpload("home_nudge")}
          onOpenCalculator={() => setCurrentView("calculator")}
          onOpenNoticePopup={() => setShowEmergency(true)}
        />
      )}

      {currentView === "chat" && (
        <ModernChatInterface
          key={historySession ? `history-${historySession.id}` : "live"}
          initialMessage={chatQuery}
          historySession={historySession ?? undefined}
          selectedLaws={selectedLaws}
          onOpenLawSelector={handleOpenLawSelector}
          onStepChange={handleStepChange}
          onCompleteDocument={handleCompleteDocument}
          onMessagesChange={setHasChatMessages}
          relatedLaws={relatedLaws}
          questionType={questionType}
          contextType={contextType}
          requestDraftDocument={requestDraftDocument}
          onDraftDocumentHandled={() => setRequestDraftDocument(false)}
          isTrial={isTrial}
        />
      )}

      {currentView === "policy" && (
        <PolicyManagementView
          isAdmin={isAdmin}
          onOpenEmbedding={handleOpenEmbedding}
          isTrial={isTrial}
        />
      )}

      {currentView === "embedding" && selectedPolicy && (
        <EmbeddingCorrectionView
          policy={selectedPolicy}
          onBack={handleBackFromEmbedding}
        />
      )}

      {currentView === "calculator" && (
        <LaborCalculatorView onBack={() => setCurrentView("home")} />
      )}

      {currentView === "notice" && <NoticeView onBack={() => setCurrentView("home")} />}

      {/* Law Selection Modal */}
      <LawSelectionModal
        isOpen={showLawModal}
        onClose={() => setShowLawModal(false)}
        selectedLaws={selectedLaws}
        onConfirm={handleConfirmLaws}
      />

      {/* Chat History Modal */}
      <EnhancedChatHistoryModal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        onSelectChat={handleSelectChat}
      />

      {/* 서비스 평가 모달 (채팅 세션 종료 시) */}
      <ServiceFeedbackModal
        isOpen={showServiceFeedback}
        onClose={() => setShowServiceFeedback(false)}
      />

      {/* Toast Notifications */}
      <Toaster />

      {/* Leave Confirm Modal — 의견서 작성 버튼 미노출 (정책: 의견서 진입점은 상세답변 카드
          버튼으로 단일화. 상세답변 n개 시 어떤 답변 기준인지 모호 + 오조작 시 세션 종료 비용) */}
      <ChatLeaveConfirmModal
        isOpen={showLeaveConfirmModal}
        onClose={() => setShowLeaveConfirmModal(false)}
        onConfirm={handleLeaveConfirm}
      />
    </div>
  );
}
