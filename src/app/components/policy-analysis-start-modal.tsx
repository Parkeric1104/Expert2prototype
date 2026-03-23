import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

interface PolicyAnalysisStartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PolicyAnalysisStartModal({ 
  isOpen, 
  onClose,
}: PolicyAnalysisStartModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[600px] p-10 flex flex-col bg-card border-border"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>문서 분석 시작</DialogTitle>
          <DialogDescription>
            등록하신 문서의 AI 분석을 시작합니다.
          </DialogDescription>
        </DialogHeader>

        {/* 제목 및 내용 */}
        <div className="flex flex-col space-y-4 mb-6">
          <h2 className="text-2xl font-bold text-foreground">
            등록하신 문서 분석을 시작합니다
          </h2>
          <div className="text-sm text-muted-foreground leading-relaxed space-y-2">
            <p>등록하신 문서의 AI 분석 및 변환 작업을 진행하고 있습니다.</p>
            <p>분석이 완료되면 별도로 안내에 드릴 예정입니다.</p>
            <p>최종 확인 이후 사내 정책 문서로 등록이 됩니다.</p>
          </div>
        </div>

        {/* 확인 버튼 */}
        <div className="flex justify-end">
          <Button
            onClick={onClose}
            className="px-8 h-11 text-base font-semibold"
            size="lg"
          >
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
