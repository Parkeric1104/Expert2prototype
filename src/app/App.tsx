import { useState, useEffect } from "react";
import { TopHeader } from "@/app/components/top-header";
import { ModernHomeView } from "@/app/components/modern-home-view";
import { ModernChatInterface } from "@/app/components/modern-chat-interface";
import { PolicyManagementView } from "@/app/components/policy-management-view";
import { EmbeddingCorrectionView, EmbeddingCorrectionPolicy } from "@/app/components/embedding-correction-view";
import { LawSelectionModal } from "@/app/components/law-selection-modal";
import { EnhancedChatHistoryModal } from "@/app/components/enhanced-chat-history-modal";
import { HistorySidebarPanel } from "@/app/components/history-sidebar-panel";
import { ChatLeaveConfirmModal } from "@/app/components/chat-leave-confirm-modal";
import { Toaster } from "@/app/components/ui/sonner";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "chat" | "policy" | "embedding">("home");
  const [chatQuery, setChatQuery] = useState<string>("");
  const [selectedLaws, setSelectedLaws] = useState<string[]>([]);
  const [relatedLaws, setRelatedLaws] = useState<string[]>([]);
  const [questionType, setQuestionType] = useState<string | undefined>(undefined);
  const [showLawModal, setShowLawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [isRefiningSearch, setIsRefiningSearch] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAdmin] = useState<boolean>(true);
  const [hasChatMessages, setHasChatMessages] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<EmbeddingCorrectionPolicy | null>(null);
  const [pendingPoliciesCount, setPendingPoliciesCount] = useState<number>(0);
  const [chatMode, setChatMode] = useState<"search" | "opinion">("search");
  const [requestDraftDocument, setRequestDraftDocument] = useState(false);

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

  const handleStartChat = (query: string, laws: string[], promptRelatedLaws?: string[], promptQuestionType?: string, mode?: "search" | "opinion") => {
    setChatQuery(query);
    setSelectedLaws(laws);
    setRelatedLaws(promptRelatedLaws || []); // 추천 질문의 관련 법령 저장
    setQuestionType(promptQuestionType); // 질문 유형 저장
    setChatMode(mode || "search"); // 모드 설정 (기본값: 검색 모드)
    setCurrentView("chat");
    setCurrentStep(1); // 질문 입력 단계
  };

  const handleNewChat = () => {
    setChatQuery("");
    setSelectedLaws([]);
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

  const handleOpenPolicyUpload = () => {
    setCurrentView("policy");
  };

  const handleViewChatHistory = (chatId: string) => {
    // 채팅 이력 보기 (읽기 전용)
    console.log("Viewing chat history:", chatId);
    // 여기서는 실제로 해당 채팅을 불러와서 읽기 전용으로 표시
    // 현재는 콘솔 로그만 출력
    setShowSidebar(false);
  };

  const handleOpenEmbedding = (policy: EmbeddingCorrectionPolicy) => {
    setSelectedPolicy(policy);
    setCurrentView("embedding");
  };

  const handleBackFromEmbedding = () => {
    setSelectedPolicy(null);
    setCurrentView("policy");
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
    if (hasChatMessages && currentView === "chat") {
      setShowLeaveConfirmModal(true);
      setPendingNavigationAction(() => action);
    } else {
      action();
    }
  };

  const handleLeaveConfirm = () => {
    if (pendingNavigationAction) {
      pendingNavigationAction();
      setPendingNavigationAction(null);
    }
    setShowLeaveConfirmModal(false);
  };

  const handleLeaveCancel = () => {
    setShowLeaveConfirmModal(false);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Header – embedding 상세 화면에서는 미노출 */}
      {currentView !== "embedding" && (
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
          pendingPoliciesCount={isAdmin ? pendingPoliciesCount : 0}
          isSidebarOpen={showSidebar}
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
        onOpenPolicyList={() => {
          if (currentView === "chat" && hasChatMessages) {
            handleNavigation(handleOpenPolicyUpload);
          } else {
            handleOpenPolicyUpload();
          }
          setShowSidebar(false);
        }}
        onViewChatHistory={handleViewChatHistory}
        pendingPoliciesCount={isAdmin ? pendingPoliciesCount : 0}
      />

      {/* Main Content */}
      {currentView === "home" && (
        <ModernHomeView
          onStartChat={handleStartChat}
          onOpenLawSelector={handleOpenLawSelector}
          selectedLaws={selectedLaws}
        />
      )}

      {currentView === "chat" && (
        <ModernChatInterface
          initialMessage={chatQuery}
          selectedLaws={selectedLaws}
          onOpenLawSelector={handleOpenLawSelector}
          onStepChange={handleStepChange}
          onCompleteDocument={handleCompleteDocument}
          onMessagesChange={setHasChatMessages}
          relatedLaws={relatedLaws}
          questionType={questionType}
          chatMode={chatMode}
          requestDraftDocument={requestDraftDocument}
          onDraftDocumentHandled={() => setRequestDraftDocument(false)}
        />
      )}

      {currentView === "policy" && (
        <PolicyManagementView
          isAdmin={isAdmin}
          onOpenEmbedding={handleOpenEmbedding}
        />
      )}

      {currentView === "embedding" && selectedPolicy && (
        <EmbeddingCorrectionView
          policy={selectedPolicy}
          onBack={handleBackFromEmbedding}
        />
      )}

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

      {/* Toast Notifications */}
      <Toaster />

      {/* Leave Confirm Modal - 모드별 버튼 구성 상이 */}
      <ChatLeaveConfirmModal
        isOpen={showLeaveConfirmModal}
        onClose={() => setShowLeaveConfirmModal(false)}
        onConfirm={handleLeaveConfirm}
        onDraftDocument={chatMode === "opinion" && hasChatMessages ? () => {
          setShowLeaveConfirmModal(false);
          setRequestDraftDocument(true);
        } : undefined}
      />
    </div>
  );
}
