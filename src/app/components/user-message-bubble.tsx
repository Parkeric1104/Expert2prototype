import { useState } from "react";
import { FileText, Pencil, ArrowUp, ChevronLeft } from "lucide-react";

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
  editable?: boolean; // 휴먼피드백 대기 중 원 질문 수정 허용 (최종 답변 생성 전까지만)
  onEditQuestion?: (newText: string) => void; // 수정 완료 → 기존 피드백 초기화 후 프로세스 재시작
}

export function UserMessageBubble({ message, attachedFiles, remainingQuestions, currentTurn, maxQuestions = 7, editable, onEditQuestion }: UserMessageBubbleProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message);

  const startEdit = () => { setDraft(message); setEditing(true); };
  const submitEdit = () => {
    const t = draft.trim();
    if (!t) return;
    setEditing(false);
    onEditQuestion?.(t);
  };
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
      <div className="max-w-[650px] flex flex-col gap-2 items-end">
        {editing ? (
          /* 원 질문 인라인 수정 — 수정 완료 시 프로세스를 처음부터 다시 실행 */
          <div className="w-[520px] max-w-full rounded-2xl border border-indigo-200 bg-card shadow-sm p-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditing(false)}
                aria-label="수정 취소"
                className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                취소
              </button>
              <textarea
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitEdit(); } }}
                rows={1}
                className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                style={{ maxHeight: 120 }}
              />
              <button
                onClick={submitEdit}
                disabled={!draft.trim()}
                aria-label="수정한 질문으로 다시 질문하기"
                className="h-10 w-10 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-muted-foreground">수정하면 이전 되묻기는 초기화되고 처음부터 다시 진행돼요.</p>
          </div>
        ) : (
          <>
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

            {/* 질문 수정 — 휴먼피드백 대기 중(최종 답변 전)만 노출 */}
            {editable && (
              <button
                onClick={startEdit}
                className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary transition-colors px-1"
              >
                <Pencil className="w-3.5 h-3.5" />
                질문 수정
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}