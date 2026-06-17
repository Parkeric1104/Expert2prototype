import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import { MessageCircle, FileText, LogOut, X } from "lucide-react";

interface SessionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueNewSession: () => void; // "이어서 질문하기"
  onDraftDocument: () => void; // "의견서 작성"
  onEndConsultation: () => void; // "상담 종료"
  questionCount: number;
  maxQuestions: number;
}

export function SessionLimitModal({
  isOpen,
  onClose,
  onContinueNewSession,
  onDraftDocument,
  onEndConsultation,
  questionCount,
  maxQuestions,
}: SessionLimitModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        {/* 우측 상단 닫기 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold text-foreground flex items-center gap-2 pr-8">
            <MessageCircle className="w-5 h-5 text-indigo-600" />
            입력하신 질문으로 새 채팅을 시작합니다.
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-lg">
                <div className="text-foreground font-medium mb-3">
                  더 정확하고 심층적인 검토를 위해 새로운 채팅으로 전환합니다.
                </div>
                <div className="text-indigo-700 dark:text-indigo-300 text-xs font-medium bg-indigo-100 dark:bg-indigo-900/30 px-3 py-2 rounded">
                  💬 방금 입력하신 질문으로 새로운 채팅창에서 즉시 대화가 시작됩니다.
                </div>
              </div>

              <div className="text-muted-foreground text-xs space-y-1">
                <div className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>현재 채팅의 답변은 히스토리에 안전하게 저장됩니다.</span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-indigo-600 mt-0.5">✓</span>
                  <span>선택하신 법령 설정은 그대로 적용됩니다.</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="flex-col sm:flex-col gap-2">
          {/* Primary: Continue with new session */}
          <Button
            onClick={onContinueNewSession}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            이어서 질문하기
          </Button>

          <div className="flex gap-2 w-full">
            {/* Secondary: Draft document */}
            <Button
              onClick={onDraftDocument}
              variant="outline"
              className="flex-1"
            >
              <FileText className="w-4 h-4 mr-2" />
              의견서 작성
            </Button>

            {/* Secondary: End consultation */}
            <Button
              onClick={onEndConsultation}
              variant="outline"
              className="flex-1"
            >
              <LogOut className="w-4 h-4 mr-2" />
              상담 종료
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}