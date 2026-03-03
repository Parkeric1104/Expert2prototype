import { Scale, CheckCircle2, X } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

interface AIDebateResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  summary?: string;
}

export function AIDebateResultModal({
  isOpen,
  onClose,
  onApply,
  summary = "AI 심층 분석이 완료되었습니다. 다양한 관점에서 검토된 의견을 답변에 반영하시겠습니까?",
}: AIDebateResultModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <DialogTitle className="text-lg font-bold">AI 심층 분석 완료</DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed pt-2">
            {summary}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 px-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground mb-1">
                AI 의견 반영 시
              </h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• 다양한 관점에서 검토된 의견이 답변에 추가됩니다</li>
                <li>• 기존 답변은 유지되며 AI 의견이 추가 섹션으로 표시됩니다</li>
                <li>• 답변을 복사할 때 AI 의견도 함께 포함됩니다</li>
              </ul>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X className="w-4 h-4" />
            닫기
          </Button>
          <Button
            type="button"
            onClick={() => {
              onApply();
              onClose();
            }}
            className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
          >
            <CheckCircle2 className="w-4 h-4" />
            답변에 반영하기
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}