import { useState } from "react";
import { TopHeader } from "@/app/components/top-header";
import { ModernHomeView } from "@/app/components/modern-home-view";
import { ModernChatInterface } from "@/app/components/modern-chat-interface";
import { PolicyManagementView } from "@/app/components/policy-management-view";
import { LawSelectionModal } from "@/app/components/law-selection-modal";
import { EnhancedChatHistoryModal } from "@/app/components/enhanced-chat-history-modal";
import { AutoPolicyReviewModal } from "@/app/components/auto-policy-review-modal";
import {
  EmbeddingCorrectionView,
  type EmbeddingCorrectionPolicy,
} from "@/app/components/embedding-correction-view";
import { Toaster } from "@/app/components/ui/sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "chat" | "policy" | "embedding">("home");
  const [chatQuery, setChatQuery] = useState<string>("");
  const [selectedLaws, setSelectedLaws] = useState<string[]>([]);
  const [relatedLaws, setRelatedLaws] = useState<string[]>([]);
  const [questionType, setQuestionType] = useState<string | undefined>(undefined);
  const [showLawModal, setShowLawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRefiningSearch, setIsRefiningSearch] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isAdmin] = useState<boolean>(true);
  const [hasChatMessages, setHasChatMessages] = useState(false);
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);

  // AutoPolicyReviewModal에서 등록 완료된 정책 ID 목록
  const [reviewCompleteIds, setReviewCompleteIds] = useState<string[]>([]);

  // EmbeddingCorrectionView에서 볼 정책 정보
  const [embeddingPolicy, setEmbeddingPolicy] = useState<EmbeddingCorrectionPolicy | null>(null);

  const handleStartChat = (query: string, laws: string[], promptRelatedLaws?: string[], promptQuestionType?: string) => {
    setChatQuery(query);
    setSelectedLaws(laws);
    setRelatedLaws(promptRelatedLaws || []);
    setQuestionType(promptQuestionType);
    setCurrentView("chat");
    setCurrentStep(1);
  };

  const handleNewChat = () => {
    setChatQuery("");
    setSelectedLaws([]);
    setCurrentView("home");
    setCurrentStep(1);
  };

  const handleConfirmLaws = (laws: string[]) => {
    setSelectedLaws(laws);
    if (currentView === "chat" && isRefiningSearch) {
      setIsRefiningSearch(false);
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
    handleNewChat();
  };

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
  };

  const handleOpenPolicyUpload = () => {
    setCurrentView("policy");
  };

  const handleLogoClick = () => {
    handleNavigation(handleNewChat);
  };

  const handleSelectChat = (chatId: string) => {
    console.log("Selected chat:", chatId);
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

  // AutoPolicyReviewModal: 검토 완료 및 사내 정책 등록 완료 처리
  const handlePolicyRegistered = (policyId: string) => {
    setReviewCompleteIds((prev) => [...prev, policyId]);
  };

  // PolicyManagementView: 임베딩 수정 페이지로 이동
  const handleNavigateToEmbedding = (policy: EmbeddingCorrectionPolicy) => {
    setEmbeddingPolicy(policy);
    setCurrentView("embedding");
  };

  // EmbeddingCorrectionView: 목록으로 돌아가기
  const handleBackFromEmbedding = () => {
    setEmbeddingPolicy(null);
    setCurrentView("policy");
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Top Header - embedding 뷰에서는 숨김 */}
      {currentView !== "embedding" && (
        <TopHeader
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
        />
      )}

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
        />
      )}

      {currentView === "policy" && (
        <PolicyManagementView
          isAdmin={isAdmin}
          reviewCompleteIds={reviewCompleteIds}
          onNavigateToEmbedding={handleNavigateToEmbedding}
        />
      )}

      {currentView === "embedding" && embeddingPolicy && (
        <EmbeddingCorrectionView
          policy={embeddingPolicy}
          onBack={handleBackFromEmbedding}
        />
      )}

      {/* AutoPolicyReviewModal: 홈 또는 정책 관리 화면 진입 시 자동 팝업 */}
      {(currentView === "home" || currentView === "policy") && (
        <AutoPolicyReviewModal onPolicyRegistered={handlePolicyRegistered} />
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

      {/* Leave Confirm Modal */}
      <AlertDialog open={showLeaveConfirmModal} onOpenChange={setShowLeaveConfirmModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>대화를 나가시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              현재 대화를 나가면 작성 중인 내용이 저장되지 않습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleLeaveConfirm}>나가기</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
