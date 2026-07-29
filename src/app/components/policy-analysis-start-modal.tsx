import { CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/app/components/ui/dialog";

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
        className="sm:max-w-[420px] p-8 flex flex-col bg-card border-border"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>문서 분석 시작</DialogTitle>
          <DialogDescription>
            등록하신 문서의 AI 분석을 시작합니다.
          </DialogDescription>
        </DialogHeader>

        {/* 디자인 정합: 초록 체크 + 중앙정렬 + 불릿 박스 */}
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-foreground">
            등록하신 문서 분석을 시작합니다
          </h2>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed" style={{ wordBreak: "keep-all" }}>
            등록하신 문서의 AI 분석 및 변환 작업을 진행하고 있습니다.
          </p>

          <div className="mt-5 w-full rounded-lg bg-muted/60 px-4 py-3 text-left text-xs text-muted-foreground space-y-1.5">
            <p>· 분석이 완료되면 별도로 안내해 드릴 예정입니다.</p>
            <p>· 최종 확인 이후 사내 정책 문서로 등록이 됩니다.</p>
          </div>

          <button
            onClick={onClose}
            className="mt-6 px-8 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            확인
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
