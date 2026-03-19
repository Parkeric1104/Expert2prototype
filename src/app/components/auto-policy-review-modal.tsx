import { useState, useEffect } from "react";
import { FileText, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";

const SNOOZE_KEY = "snoozePolicyReview";

interface AutoPolicyReviewModalProps {
  onReview: () => void;
}

export function AutoPolicyReviewModal({ onReview }: AutoPolicyReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // 메인 화면 진입 시 스누즈 만료 여부 체크
  useEffect(() => {
    const snoozeUntil = localStorage.getItem(SNOOZE_KEY);
    const now = Date.now();
    if (!snoozeUntil || now > parseInt(snoozeUntil, 10)) {
      setIsOpen(true);
    }
  }, []);

  const handleSnooze = () => {
    localStorage.setItem(SNOOZE_KEY, (Date.now() + 60 * 60 * 1000).toString());
    setIsOpen(false);
  };

  const handleReview = () => {
    setIsOpen(false);
    onReview();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="sm:max-w-[400px] p-0 flex flex-col bg-white"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-blue-600" />
            </div>
            <DialogTitle className="text-base font-bold text-gray-900">
              정책 분석 완료 안내
            </DialogTitle>
          </div>
          <p className="text-sm text-gray-500 leading-relaxed pl-10">
            업로드하신 문서의 분석이 완료되었습니다.
            <br />
            검토를 완료해야 사내 정책으로 등록됩니다.
          </p>
        </DialogHeader>

        {/* 문서명 */}
        <div className="mx-6 mb-4 flex items-center gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
          <span className="text-sm font-medium text-gray-700 truncate">
            2024 더존비즈온 취업규칙 개정안.pdf
          </span>
        </div>

        <DialogFooter className="px-6 pb-5 flex items-center justify-between sm:justify-between gap-2">
          <Button
            variant="ghost"
            onClick={handleSnooze}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 text-sm font-normal px-2"
          >
            <Clock className="w-3.5 h-3.5 mr-1" />
            1시간 동안 보지 않기
          </Button>
          <Button
            onClick={handleReview}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm px-5"
          >
            검토하기
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
