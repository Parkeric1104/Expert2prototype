import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Button } from "@/app/components/ui/button";
import { CheckCircle2, X } from "lucide-react";

interface SessionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueNewSession: () => void; // "이어서 질문하기"
  onEndConsultation: () => void; // "상담 종료"
  questionCount: number;
  maxQuestions: number;
}

export function SessionLimitModal({
  isOpen,
  onClose,
  onContinueNewSession,
  onEndConsultation,
  questionCount,
  maxQuestions,
}: SessionLimitModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md max-sm:max-w-[calc(100%-2rem)]">
        {/* 우측 상단 닫기 */}
        <button
          onClick={onClose}
          aria-label="닫기"
          className="absolute right-4 top-4 w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        <AlertDialogHeader>
          <AlertDialogTitle className="text-lg font-bold text-foreground pr-8">
            새 채팅에서 이어서 질문할까요?
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3.5 text-sm">
              <p className="text-muted-foreground" style={{ wordBreak: "keep-all" }}>
                방금 입력하신 질문으로 새 채팅에서 바로 대화가 시작됩니다.
              </p>

              <div className="space-y-2 pt-0.5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80" style={{ wordBreak: "keep-all" }}>현재 대화의 답변은 히스토리에 안전하게 저장됩니다.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <span className="text-foreground/80" style={{ wordBreak: "keep-all" }}>선택하신 법령 설정은 그대로 적용됩니다.</span>
                </div>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* 하단: 채팅 종료(좌, 텍스트) · 채팅 내용 보기 / 새 채팅에서 시작하기(우) — 디자인 정합 */}
        <AlertDialogFooter className="flex-row items-center justify-between gap-2 sm:justify-between">
          <Button
            onClick={onEndConsultation}
            variant="ghost"
            className="text-muted-foreground hover:text-foreground px-2"
          >
            채팅 종료
          </Button>

          <div className="flex gap-2">
            {/* 채팅 내용 보기 — 팝업만 닫고 현재 채팅 확인 */}
            <Button onClick={onClose} variant="outline">
              채팅 내용 보기
            </Button>
            {/* Primary: 새 채팅에서 시작하기 (Blue 500) */}
            <Button
              onClick={onContinueNewSession}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              새 채팅에서 시작하기
            </Button>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}