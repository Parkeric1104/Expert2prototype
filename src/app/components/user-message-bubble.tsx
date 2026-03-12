import { FileText } from "lucide-react";

interface UploadedFile {
  name: string;
  size: number;
  type: string;
}

interface UserMessageBubbleProps {
  message: string;
  attachedFiles?: UploadedFile[];
  remainingQuestions?: number; // 잔여 질문 횟수
  currentTurn?: number; // 현재 턴 수
  maxQuestions?: number; // 최대 질문 횟수 (동적 계산을 위해 추가)
}

export function UserMessageBubble({ message, attachedFiles, remainingQuestions, currentTurn, maxQuestions = 6 }: UserMessageBubbleProps) {
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // 잔여 횟수 메시지 생성
  // 노출 조건: 마지막 3회 (MAX_QUESTIONS - 2 이상일 때)
  const getRemainingMessage = (): string | null => {
    if (currentTurn === undefined || remainingQuestions === undefined) {
      return null;
    }

    // 마지막 3회부터 표시 (잔여 2, 1, 0)
    const showThreshold = maxQuestions - 2;
    if (currentTurn < showThreshold) {
      return null;
    }

    if (remainingQuestions === 0) {
      return "이 채팅의 마지막 질문입니다.";
    }

    return `이 채팅에서 ${remainingQuestions}번 더 질문할 수 있어요.`;
  };

  const remainingMessage = getRemainingMessage();

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

          {/* 잔여 질문 횟수 메시지 표시 */}
          {remainingMessage && (
            <div className="mt-2 text-xs opacity-80">
              {remainingMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}