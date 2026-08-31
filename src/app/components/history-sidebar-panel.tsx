import { useState, useEffect } from "react";
import {
  Calendar,
  MessageSquare,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  MessageSquarePlus,
  BookOpen,
  Bell,
  FileStack,
  Eye,
  Trash2,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { track } from "@/app/utils/track";
import { toast } from "sonner";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { TrialBlockModal } from "@/app/components/trial-block-modal";
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
import { CHAT_HISTORY } from "@/app/data/chat-history";

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
  // 고정(도킹)형 접펼침 — 오버레이 open/close가 아니라 상시 노출 + 접힘(레일)/펼침 전환.
  collapsed: boolean;
  onToggleCollapse: () => void;
  onNewChat?: () => void;
  onOpenManual?: () => void;
  onOpenNotices?: () => void;
  unreadNoticeCount?: number;
  onOpenPolicyList?: () => void;
  onViewChatHistory?: (chatId: string) => void;
  pendingPoliciesCount?: number;
  isTrial?: boolean;
  onToggleTrial?: () => void;
}

export function HistorySidebarPanel({
  collapsed,
  onToggleCollapse,
  onNewChat,
  onOpenManual,
  onOpenNotices,
  unreadNoticeCount = 0,
  onOpenPolicyList,
  onViewChatHistory,
  pendingPoliciesCount = 0,
  isTrial = false,
  onToggleTrial,
}: HistorySidebarPanelProps) {
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // 채팅 이력 — 공용 더미(추천질문 4유형별) 기반. 카드 표시용으로 매핑
  const initialChatHistory: ChatHistoryItem[] = CHAT_HISTORY.map((h) => ({
    id: h.id,
    title: h.title,
    initialQuestion: h.initialQuestion,
    finalAnswer: { summary: h.summary, fullDetails: "", laws: h.laws },
    date: h.date,
    category: h.category,
    hasDocument: h.hasDocument,
    documentName: h.documentName,
  }));

  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>(initialChatHistory);
  const [showTrialBlock, setShowTrialBlock] = useState(false); // 체험판: ONEFFICE 목록보기 차단

  // 퍼널 S2: 사이드패널이 펼쳐져 '노무 정책 문서 관리' 진입점이 실제 노출될 때 집계
  useEffect(() => {
    if (!collapsed) track("S2_impression", { source: "sidebar" });
  }, [collapsed]);

  const toggleExpand = (chatId: string) => {
    setExpandedChat(expandedChat === chatId ? null : chatId);
  };

  // 채팅 이력보기: 채팅 전체 화면으로 전환하여 이전 대화 그대로 복원 (2026-07-06)
  const handleViewHistory = (chatId: string) => {
    onViewChatHistory?.(chatId);
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

  // ── 접힘(레일) 모드 ─────────────────────────────────────────────
  if (collapsed) {
    return (
      <aside className="flex-shrink-0 w-16 h-full bg-card border-r border-border flex flex-col items-center transition-all duration-300">
        {/* 펼치기 토글 */}
        <div className="w-full flex items-center justify-center py-3 border-b border-border">
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="h-9 w-9 p-0"
            aria-label="사이드패널 펼치기"
            title="사이드패널 펼치기"
          >
            <PanelLeftOpen className="w-5 h-5" />
          </Button>
        </div>

        {/* 아이콘 액션 */}
        <div className="w-full flex flex-col items-center gap-1 py-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={onNewChat}
            className="h-10 w-10 p-0 text-primary"
            aria-label="새 채팅"
            title="새 채팅"
          >
            <MessageSquarePlus className="w-5 h-5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => (isTrial ? setShowTrialBlock(true) : onOpenManual?.())}
            className="h-10 w-10 p-0"
            aria-label="ONEFFICE 목록보기"
            title="ONEFFICE 목록보기"
          >
            <BookOpen className="w-5 h-5" />
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenPolicyList}
            className="relative h-10 w-10 p-0"
            aria-label="노무 정책 문서 관리"
            title="노무 정책 문서 관리"
          >
            <FileStack className="w-5 h-5" />
            {pendingPoliciesCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full">
                {pendingPoliciesCount > 9 ? "9+" : pendingPoliciesCount}
              </span>
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="h-10 w-10 p-0"
            aria-label="채팅 히스토리 보기"
            title="채팅 히스토리 보기"
          >
            <MessageSquare className="w-5 h-5" />
          </Button>
        </div>

        {/* 하단: 공지사항 */}
        <div className="mt-auto w-full flex items-center justify-center py-3 border-t border-border">
          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenNotices}
            className="relative h-10 w-10 p-0"
            aria-label="공지사항"
            title="공지사항"
          >
            <Bell className="w-5 h-5" />
            {unreadNoticeCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
            )}
          </Button>
        </div>

        {/* 체험판: ONEFFICE 목록보기 미제공 */}
        <TrialBlockModal isOpen={showTrialBlock} onClose={() => setShowTrialBlock(false)} />
      </aside>
    );
  }

  // ── 펼침 모드 ───────────────────────────────────────────────────
  return (
    <aside className="flex-shrink-0 w-80 h-full bg-card border-r border-border flex flex-col transition-all duration-300">
      {/* Header with Action Buttons */}
      <div className="flex-shrink-0 border-b border-border">
        {/* Title + collapse toggle */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-lg font-bold text-foreground">메뉴</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={onToggleCollapse}
            className="h-8 w-8 p-0"
            aria-label="사이드패널 접기"
            title="사이드패널 접기"
          >
            <PanelLeftClose className="w-4 h-4" />
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
            onClick={() => (isTrial ? setShowTrialBlock(true) : onOpenManual?.())}
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
                {pendingPoliciesCount > 99 ? "99+" : pendingPoliciesCount}
              </span>
            )}
          </Button>

          {/* 체험판 전환/종료 */}
          {onToggleTrial && (
            <Button
              onClick={onToggleTrial}
              variant="outline"
              className="w-full justify-start gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isTrial ? "체험판 종료" : "체험판으로 전환"}</span>
            </Button>
          )}
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
          {/* 체험판: 채팅 내역 저장 안 됨 — 문구만 노출 */}
          {isTrial ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                <MessageCircle className="w-7 h-7 text-muted-foreground/60" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>
                체험판에서는 채팅 내역이 저장되지 않습니다.
              </p>
            </div>
          ) : (
          <div className="p-3 space-y-2">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all bg-card"
              >
                {/* Accordion Header — 카드 전체 클릭으로 펼침/접힘 (화살표 버튼 병행) */}
                <div
                  className="p-3 cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onClick={() => toggleExpand(chat.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleExpand(chat.id); } }}
                  aria-expanded={expandedChat === chat.id}
                >
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
                      onClick={(e) => { e.stopPropagation(); toggleExpand(chat.id); }}
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
                    {/* 질문 전체 노출 (답변 영역은 채팅 이력보기에서 확인) */}
                    <div className="bg-background/60 rounded p-2">
                      <p className="text-xs text-muted-foreground mb-1">질문</p>
                      <p className="text-xs text-foreground">
                        {chat.initialQuestion}
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
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <MessageCircle className="w-7 h-7 text-muted-foreground/60" />
                </div>
                <p className="text-sm font-medium text-foreground">저장된 채팅이 없습니다.</p>
                <p className="text-xs text-muted-foreground mt-1">새로운 채팅을 시작해보세요.</p>
              </div>
            )}
          </div>
          )}
        </ScrollArea>
      </div>

      {/* 하단 고정: 공지사항 메뉴 → 전체 페이지 전환 */}
      <button
        onClick={onOpenNotices}
        className="flex-shrink-0 w-full flex items-center gap-2 px-4 py-3.5 border-t border-border text-sm text-foreground/80 hover:text-foreground hover:bg-muted/60 transition-colors"
      >
        <span className="relative flex-shrink-0">
          <Bell className="w-4 h-4" />
          {unreadNoticeCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
          )}
        </span>
        <span className="font-medium">공지사항</span>
        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
      </button>

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

      {/* 체험판: ONEFFICE 목록보기 미제공 */}
      <TrialBlockModal isOpen={showTrialBlock} onClose={() => setShowTrialBlock(false)} />
    </aside>
  );
}
