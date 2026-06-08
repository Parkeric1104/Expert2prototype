import { AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
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

interface ChatLeaveConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onDraftDocument?: () => void;
  title?: string;
  description?: string;
}

export function ChatLeaveConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  onDraftDocument,
  title = "메인으로 이동하면 현재 대화 내용이 모두 삭제됩니다.",
  description = "이동하시겠습니까?",
}: ChatLeaveConfirmModalProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader className="items-center text-center">
          {/* 경고 아이콘 */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center mb-4 mx-auto">
            <AlertTriangle className="w-8 h-8 text-white" strokeWidth={2.5} />
          </div>
          
          {/* 제목 */}
          <AlertDialogTitle className="text-lg font-bold text-center leading-relaxed">
            {title}
            <br />
            {description}
          </AlertDialogTitle>
          
          {/* 설명 - 의견서 작성 버튼이 있을 때만 표시 */}
          {onDraftDocument && (
            <AlertDialogDescription className="text-sm text-muted-foreground text-center pt-2">
              *대화 내용은 '의견서 작성'을 통해 문서로 저장할 수 있습니다.
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>
        
        <AlertDialogFooter className="flex-row gap-2 sm:justify-center">
          {/* 취소 버튼 */}
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 sm:flex-initial"
          >
            취소
          </Button>
          
          {/* 의견서 작성 버튼 */}
          {onDraftDocument && (
            <Button
              variant="outline"
              onClick={() => {
                onDraftDocument();
                onClose();
              }}
              className="flex-1 sm:flex-initial"
            >
              의견서 작성
            </Button>
          )}
          
          {/* 확인 버튼 */}
          <Button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 sm:flex-initial bg-indigo-600 hover:bg-indigo-700"
          >
            확인
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}