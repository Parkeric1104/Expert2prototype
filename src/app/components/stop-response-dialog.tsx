import { AlertTriangle, StopCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

interface StopResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onNavigateToMain?: () => void; // 메인화면 이동 핸들러 추가
}

export function StopResponseDialog({
  isOpen,
  onClose,
  onConfirm,
  onNavigateToMain,
}: StopResponseDialogProps) {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        className="max-w-md [&>button]:hidden"
        onInteractOutside={(e) => {
          // 외부 클릭 방지
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // ESC 키 방지
          e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            답변 생성을 중단하시겠습니까?
          </DialogTitle>
          <DialogDescription className="sr-only">
            답변 생성을 중단하면 현재까지 작성된 내용은 표시되지 않으며, 이미 처리된 작업에 대한 크레딧은 소모될 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-3">
          <p className="text-sm text-foreground leading-relaxed">
            답변 생성을 중단하면 현재까지 작성된 내용은 표시되지 않습니다.
          </p>

          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mb-1">
                  중요 안내
                </p>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  답변 생성을 중단하더라도 이미 처리된 작업에 대한 <strong>크레딧은 소모</strong>될 수 있습니다.
                  API 요청이 서버에서 진행 중이므로 비용이 발생할 수 있음을 유의해주세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            계속 진행
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onClose();
              // 메인화면으로 이동
              if (onNavigateToMain) {
                onNavigateToMain();
              }
            }}
            className="gap-2"
          >
            <StopCircle className="w-4 h-4" />
            답변 중단
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}