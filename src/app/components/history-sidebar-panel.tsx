import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  FileText,
  MessageSquarePlus,
  BookOpen,
  FileStack,
  Eye,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";

interface ChatHistoryItem {
  id: string;
  title: string;
  initialQuestion: string;
  finalAnswer: {
    summary: string;
    fullDetails: string;
    laws: string[];
  };
  date: string;
  category: string;
  hasDocument: boolean;
  documentName?: string;
}

interface HistorySidebarPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat?: () => void;
  onOpenManual?: () => void;
  onOpenPolicyList?: () => void;
  onViewChatHistory?: (chatId: string) => void;
  pendingPoliciesCount?: number;
}

export function HistorySidebarPanel({
  isOpen,
  onClose,
  onNewChat,
  onOpenManual,
  onOpenPolicyList,
  onViewChatHistory,
  pendingPoliciesCount = 0
}: HistorySidebarPanelProps) {
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Mock chat history data (간략화된 버전)
  const initialChatHistory: ChatHistoryItem[] = [
    {
      id: "1",
      title: "구내식당 이동 중 사고 업무상 재해 검토",
      initialQuestion: "점심시간에 회사 구내식당으로 이동하던 중 계단에서 미끄러져 발목을 다쳤습니다...",
      finalAnswer: {
        summary: "해당 사고는 사업주의 지배·관리 하에 있다고 볼 수 있는 '구내식당 이동' 중 발생하였으므로...",
        fullDetails: "",
        laws: ["산업재해보상보험법 제37조"],
      },
      date: "2026-02-24",
      category: "산업재해 · 안전보건",
      hasDocument: true,
      documentName: "구내식당_사고_법률검토의견서.pdf",
    },
    {
      id: "2",
      title: "수습기간 만료 통보의 정당성 검토",
      initialQuestion: "입사 3개월 수습기간 만료 직전에 '업무 능력 부족'을 이유로...",
      finalAnswer: {
        summary: "수습기간 만료 통보는 실질적으로 해고에 해당하므로...",
        fullDetails: "",
        laws: ["근로기준법 제23조"],
      },
      date: "2026-02-23",
      category: "해고 · 징계",
      hasDocument: true,
      documentName: "수습기간_해고_법률검토의견서.pdf",
    },
    {
      id: "3",
      title: "주 52시간 근로시간 위반 여부 분석",
      initialQuestion: "우리 회사는 주 60시간 정도 근무하고 있습니다...",
      finalAnswer: {
        summary: "주 52시간을 초과하는 근로는 근로기준법 위반입니다...",
        fullDetails: "",
        laws: ["근로기준법 제50조"],
      },
      date: "2026-02-22",
      category: "근로시간 · 휴게",
      hasDocument: false,
    },
    {
      id: "4",
      title: "연차휴가 미사용 수당 계산 방법",
      initialQuestion: "퇴직 예정인데 연차 10일을 사용하지 못했습니다...",
      finalAnswer: {
        summary: "미사용 연차휴가에 대해서는 통상임금으로 계산한 수당을...",
        fullDetails: "",
        laws: ["근로기준법 제60조"],
      },
      date: "2026-02-21",
      category: "휴가 · 휴직",
      hasDocument: true,
      documentName: "연차수당_계산_법률검토의견서.pdf",
    },
  ];

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(initialChatHistory);

  // ESC 키로 패널 닫기 (REQ-06)
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const toggleExpand = (chatId: string) => {
    setExpandedChat(expandedChat === chatId ? null : chatId);
  };

  const handleViewHistory = (chatId: string) => {
    if (onViewChatHistory) {
      onViewChatHistory(chatId);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    const target = chatHistory.find((c) => c.id === deleteTargetId);
    setChatHistory((prev) => prev.filter((c) => c.id !== deleteTargetId));
    if (expandedChat === deleteTargetId) setExpandedChat(null);
    setDeleteTargetId(null);
    toast.success(`"${target?.title ?? "대화"}" 히스토리가 삭제되었습니다.`);
  };

  const deleteTarget = chatHistory.find((c) => c.id === deleteTargetId);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border z-50 flex flex-col shadow-lg">
        {/* Header with Action Buttons */}
        <div className="flex-shrink-0 border-b border-border">
          {/* Close button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="text-lg font-bold text-foreground">메뉴</h2>
            <Button
              size="sm"
              variant="ghost"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="p-3 space-y-2">
            <Button
              onClick={onNewChat}
              className="w-full justify-start gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>새 채팅</span>
            </Button>

            <Button
              onClick={onOpenManual}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>ONEFFICE 목록보기</span>
            </Button>

            <Button
              onClick={onOpenPolicyList}
              variant="outline"
              className="w-full justify-start gap-2 relative"
            >
              <FileStack className="w-4 h-4" />
              <span>노무 정책 문서 관리</span>
              {pendingPoliciesCount > 0 && (
                <span className="ml-auto min-w-[20px] h-5 px-1.5 flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full">
                  {pendingPoliciesCount > 99 ? '99+' : pendingPoliciesCount}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Chat History List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-border">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              채팅 히스토리
            </h3>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-2">
              {chatHistory.map((chat) => (
                <div
                  key={chat.id}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all bg-card"
                >
                  {/* Accordion Header */}
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{chat.date}</span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground leading-snug">
                          {chat.title}
                        </h4>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleExpand(chat.id)}
                        className="h-7 w-7 p-0 flex-shrink-0"
                        aria-label={expandedChat === chat.id ? "접기" : "펼치기"}
                      >
                        {expandedChat === chat.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Accordion Content */}
                  {expandedChat === chat.id && (
                    <div className="border-t border-border p-3 space-y-3 bg-muted/20">
                      {/* 질문 전체 노출 */}
                      <div className="bg-background/60 rounded p-2">
                        <p className="text-xs text-muted-foreground mb-1">질문</p>
                        <p className="text-xs text-foreground">
                          {chat.initialQuestion}
                        </p>
                      </div>

                      {/* 결론 전체 노출 */}
                      <div className="bg-background/60 rounded p-2">
                        <p className="text-xs text-muted-foreground mb-1">결론</p>
                        <p className="text-xs text-foreground">
                          {chat.finalAnswer.summary}
                        </p>
                      </div>

                      {/* 삭제 / 채팅 이력보기 버튼 */}
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteTargetId(chat.id)}
                          className="gap-2 text-xs h-8 text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                          aria-label="대화 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          삭제
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewHistory(chat.id)}
                          className="flex-1 gap-2 text-xs h-8"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          채팅 이력보기
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {chatHistory.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">저장된 히스토리가 없습니다.</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>대화를 삭제할까요?</AlertDialogTitle>
            <AlertDialogDescription style={{ wordBreak: "keep-all" }}>
              {deleteTarget ? `"${deleteTarget.title}"` : "선택한 대화"} 히스토리가 삭제됩니다.
              삭제된 대화는 복구할 수 없습니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
