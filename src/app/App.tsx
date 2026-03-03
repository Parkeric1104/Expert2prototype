import { useState } from "react";
import { TopHeader } from "@/app/components/top-header";
import { ModernHomeView } from "@/app/components/modern-home-view";
import { ModernChatInterface } from "@/app/components/modern-chat-interface";
import { PolicyManagementView } from "@/app/components/policy-management-view";
import { LawSelectionModal } from "@/app/components/law-selection-modal";
import { EnhancedChatHistoryModal } from "@/app/components/enhanced-chat-history-modal";
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
  const [currentView, setCurrentView] = useState<"home" | "chat" | "policy">("home");
  const [chatQuery, setChatQuery] = useState<string>("");
  const [selectedLaws, setSelectedLaws] = useState<string[]>([]);
  const [relatedLaws, setRelatedLaws] = useState<string[]>([]); // 추천 질문의 관련 법령
  const [questionType, setQuestionType] = useState<string | undefined>(undefined); // 질문 유형 추가
  const [showLawModal, setShowLawModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isRefiningSearch, setIsRefiningSearch] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1); // 진행 단계: 1-4
  const [isAdmin] = useState<boolean>(true); // 관리자 권한 (실제로는 인증 시스템에서 가져옴)
  const [hasChatMessages, setHasChatMessages] = useState(false); // 채팅 메시지 존재 여부
  const [showLeaveConfirmModal, setShowLeaveConfirmModal] = useState(false);
  const [pendingNavigationAction, setPendingNavigationAction] = useState<(() => void) | null>(null);

  const handleStartChat = (query: string, laws: string[], promptRelatedLaws?: string[], promptQuestionType?: string) => {
    setChatQuery(query);
    setSelectedLaws(laws);
    setRelatedLaws(promptRelatedLaws || []); // 추천 질문의 관련 법령 저장
    setQuestionType(promptQuestionType); // 질문 유형 저장
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

  const handleOpenPolicyUpload = () => {
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
      {/* Top Header */}
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