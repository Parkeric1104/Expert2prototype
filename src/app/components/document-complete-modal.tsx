import { useState } from "react";
import { X, Download, Share2, FileText } from "lucide-react";

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
  const [documentName, setDocumentName] = useState("법률검토의견서");
  const [fileFormat, setFileFormat] = useState<"pdf" | "word" | "hwp">("pdf");

  if (!isOpen) return null;

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${documentName}.${fileFormat === "word" ? "docx" : fileFormat}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: documentName,
        text: content,
      }).catch(() => {
        // User cancelled - silently ignore
      });
    } else {
      // Fallback: copy to clipboard
      copyToClipboard(content);
    }
  };

  const copyToClipboard = (text: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(
          () => {
            alert("문서 내용이 클립보드에 복사되었습니다.");
          },
          () => {
            fallbackCopyToClipboard(text);
          }
        );
      } else {
        fallbackCopyToClipboard(text);
      }
    } catch (err) {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text: string) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-999999px";
    textarea.style.top = "-999999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand("copy");
      alert("문서 내용이 클립보드에 복사되었습니다.");
    } catch (err) {
      alert("클립보드 복사에 실패했습니다.");
    }
    document.body.removeChild(textarea);
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  return (
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
              className="w-full px-4 py-2.5 bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="문서명을 입력하세요"
            />
          </div>

          {/* 저장 유형 선택 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">저장 유형</label>
            <div className="grid grid-cols-3 gap-2">
              {(["pdf", "word", "hwp"] as const).map((format) => (
                <button
                  key={format}
                  onClick={() => setFileFormat(format)}
                  className={`px-4 py-2.5 rounded-lg border-2 font-medium text-sm transition-all ${
                    fileFormat === format
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-foreground border-border hover:border-primary/50"
                  }`}
                >
                  {format === "pdf" ? "PDF" : format === "word" ? "Word" : "HWP"}
                </button>
              ))}
            </div>
          </div>

          {/* 공유하기 / 다운로드 버튼 */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleShare}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium text-sm"
            >
              <Share2 className="w-4 h-4" />
              공유하기
            </button>
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium text-sm"
            >
              <Download className="w-4 h-4" />
              다운로드
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
          >
            닫기
          </button>
          <button
            onClick={handleComplete}
            className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            작성완료하기
          </button>
        </div>
      </div>
    </div>
  );
}
