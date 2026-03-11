import { FileText } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface UserMessageBubbleProps {
  message: string;
  attachedFiles?: UploadedFile[];
}

export function UserMessageBubble({ message, attachedFiles }: UserMessageBubbleProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex justify-end mb-6">
      <div className="max-w-[650px] flex flex-col gap-2">
        {/* 사용자 메시지 버블 */}
        <div className="rounded-2xl px-5 py-3.5 bg-indigo-600 text-white">
          {/* 첨부파일 표시 */}
          {attachedFiles && attachedFiles.length > 0 && (
            <div className="mb-3 pb-3 border-b border-indigo-500/30">
              <div className="flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/30 border border-indigo-400/40 rounded-lg"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate max-w-[180px]">
                        {file.name}
                      </span>
                      <span className="text-xs opacity-80">
                        {formatFileSize(file.size)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 메시지 내용 */}
          <p className="text-sm leading-relaxed whitespace-pre-line">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
