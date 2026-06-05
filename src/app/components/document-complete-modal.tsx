import { useState } from "react";
import { X, FileText } from "lucide-react";
import { OpinionFeedbackModal } from "@/app/components/opinion-feedback-modal";

interface DocumentCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void; // 작성완료하기 버튼 클릭 시 메인으로 이동
  content: string;
}

export function DocumentCompleteModal({
  isOpen,
  onClose,
  onComplete,
  content,
}: DocumentCompleteModalProps) {
  const [documentName, setDocumentName] = useState("260303_AI노무의견서");
  const [fileFormat, setFileFormat] = useState<"oneffice" | "pdf" | "word">("oneffice");
  const [showFeedback, setShowFeedback] = useState(false);

  if (!isOpen && !showFeedback) return null;

  const handleDownload = () => {
    console.log('[DocumentCompleteModal] 저장하기 버튼 클릭');

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentName}.${fileFormat === "word" ? "docx" : fileFormat === "pdf" ? "pdf" : "txt"}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('[DocumentCompleteModal] 다운로드 완료 - 피드백 모달 표시');
    // 저장 후 피드백 모달 표시
    setShowFeedback(true);
  };

  const handleFeedbackComplete = () => {
    setShowFeedback(false);
    onComplete();
  };

  return (
    <>
      {/* Document Save Modal */}
      {isOpen && !showFeedback && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-foreground">의견서 저장 및 공유</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-5">
              {/* 문서명 입력 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">문서명</label>
                <input
                  type="text"
                  value={documentName}
                  onChange={(e) => setDocumentName(e.target.value)}
                  className="w-full px-4 py-3 bg-muted border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="문서명을 입력하세요"
                />
              </div>

              {/* 저장 유형 선택 */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-foreground">저장 유형</label>
                <div className="grid grid-cols-3 gap-3">
                  {([{ value: "oneffice", label: "ONEFFICE" }, { value: "pdf", label: "PDF" }, { value: "word", label: "Word" }] as const).map((format) => (
                    <button
                      key={format.value}
                      onClick={() => setFileFormat(format.value)}
                      className={`px-4 py-3 rounded-2xl border-2 font-semibold text-base transition-all ${
                        fileFormat === format.value
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-foreground border-border hover:border-primary/50"
                      }`}
                    >
                      {format.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-border flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-card border-2 border-border rounded-2xl text-foreground hover:bg-muted transition-colors font-semibold text-base"
              >
                닫기
              </button>
              <button
                onClick={handleDownload}
                className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90 transition-colors font-semibold text-base"
              >
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal — 저장 완료 후 노출 */}
      <OpinionFeedbackModal
        isOpen={showFeedback}
        onClose={handleFeedbackComplete}
        onComplete={handleFeedbackComplete}
      />
    </>
  );
}
