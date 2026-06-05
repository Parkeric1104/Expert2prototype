import { useState } from "react";
import {
  Scale, FileText, BookOpen,
  Copy, CheckCheck, ThumbsUp, ThumbsDown,
  AlertCircle, Sparkles, ArrowRight, Check
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { AnswerDetailSidebar } from "@/app/components/answer-detail-sidebar";
import { OpinionFeedbackModal } from "@/app/components/opinion-feedback-modal";
import { toast } from "sonner";

interface Source {
  type: "법령" | "해석례" | "판례";
  title: string;
  url?: string;
  description?: string;
  content?: string;
}

interface AIOpinionSummary {
  integratedConclusion: string; // 통합 결론
  proConclusion: string; // 찬성 측 결론
  conConclusion: string; // 반대 측 결론
}

interface ModernAIResponseProps {
  conclusion: string;
  factAnalysis: string;
  queryContent: string;
  reviewContent: string;
  sources: Source[];
  aiOpinion?: AIOpinionSummary | string; // 기존 string 타입도 지원
  disclaimer?: string;
  onRefineSearch?: () => void;
  onDraftDocument?: () => void;
  onRequestAIOpinion?: () => void;
  hasAIOpinion?: boolean;
  questionSummary?: string; // 질문 요약 추가
  onOpenDetailView?: () => void; // 상세 답변 보기 콜백 추가
  showActionButtons?: boolean; // 액션 버튼 표시 여부 (검색 모드 vs 의견서 작성 모드)
}

export function ModernAIResponse({
  conclusion,
  factAnalysis,
  queryContent,
  reviewContent,
  sources,
  aiOpinion,
  disclaimer,
  onRefineSearch,
  onDraftDocument,
  onRequestAIOpinion,
  hasAIOpinion = false,
  questionSummary,
  onOpenDetailView,
  showActionButtons = true, // 기본값은 true (의견서 작성 모드)
}: ModernAIResponseProps) {
  const [copied, setCopied] = useState(false);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);
  const [thumbFeedback, setThumbFeedback] = useState<"up" | "down" | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleCopy = () => {
    let fullText = `
결론
${conclusion}

사실관계
${factAnalysis}

질의내용
${queryContent}

검토내용
${reviewContent}
    `.trim();

    if (aiOpinion) {
      if (typeof aiOpinion === "string") {
        fullText += `\n\nAI 의견\n${aiOpinion}`;
      } else {
        fullText += `
\n\nAI 의견
- 통합 결론: ${aiOpinion.integratedConclusion}
- 찬성 측 결론: ${aiOpinion.proConclusion}
- 반대 측 결론: ${aiOpinion.conConclusion}
        `;
      }
    }
    
    // Try modern Clipboard API first, with fallback to legacy method
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(fullText)
        .then(() => {
          setCopied(true);
          toast.success("답변이 클립보드에 복사되었습니다");
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error("Clipboard API failed:", err);
          // Fallback to legacy method
          fallbackCopyTextToClipboard(fullText);
        });
    } else {
      // Fallback for older browsers
      fallbackCopyTextToClipboard(fullText);
    }
  };

  const fallbackCopyTextToClipboard = (text: string) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        setCopied(true);
        toast.success("답변이 클립보드에 복사되었습니다");
        setTimeout(() => setCopied(false), 2000);
      } else {
        toast.error("복사에 실패했습니다. 텍스트를 선택하여 수동으로 복사해주세요.");
      }
    } catch (err) {
      console.error('Fallback: Could not copy text', err);
      toast.error("복사에 실패했습니다. 텍스트를 선택하여 수동으로 복사해주세요.");
    }
    
    document.body.removeChild(textArea);
  };

  const handleShare = () => {
    toast.info("공유 기능은 곧 제공될 예정입니다");
  };

  const handleThumbsUp = () => {
    setThumbFeedback("up");
    setShowFeedbackModal(true);
  };

  const handleThumbsDown = () => {
    setThumbFeedback("down");
    setShowFeedbackModal(true);
  };

  const handleFeedbackComplete = () => {
    setShowFeedbackModal(false);
  };

  const handleOpenDetail = () => {
    if (onOpenDetailView) {
      onOpenDetailView();
    } else {
      setShowDetailSidebar(true);
    }
  };

  return (
    <>
      <div className="flex justify-start mb-6">
        {/* 답변 컨테이너 - Toss Style Card */}
        <div
          className="max-w-[650px] flex flex-col gap-2 rounded-[20px] px-6 py-5"
          style={{
            background: '#FFFFFF',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.04)',
          }}
        >
          {/* 답변 콘텐츠 */}
          <div className="text-foreground">
            {/* 분석 완료 메시지 */}
            <div className="mb-4 pb-3" style={{ borderBottom: '1px solid #FAFAFB' }}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-green-500" />
                <p className="text-xs font-medium" style={{ color: '#8B95A1' }}>
                  질문 분석이 완료되었습니다
                </p>
              </div>
            </div>

            {/* 결론 */}
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <Scale className="w-4 h-4" style={{ color: '#3182F6' }} />
                <h3 className="text-sm font-bold" style={{ color: '#191F28' }}>결론</h3>
              </div>
              <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: '#191F28', lineHeight: '1.6' }}>
                {conclusion}
              </p>
            </div>

            {/* 상세 답변 보기 버튼 - Toss Style */}
            <button
              onClick={handleOpenDetail}
              className="w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                background: '#F2F4F6',
                color: '#4E5968',
              }}
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-sm font-bold">상세 답변 보기</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Disclaimer - Toss Style */}
            {disclaimer && (
              <div className="mt-4 pt-3" style={{ borderTop: '1px solid #FAFAFB' }}>
                <div className="flex items-start gap-2 p-3 rounded-xl" style={{ background: '#FFF9E6' }}>
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
                  <p className="text-xs leading-relaxed" style={{ color: '#92400E' }}>
                    {disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - Toss Style Card Integration (의견서 작성 모드에서만 표시) */}
      {showActionButtons && (
        <div className="mb-6">
          {/* Toss Style Divider */}
          <div className="h-px" style={{ background: '#FAFAFB' }} />

          {/* Action Button Zone */}
          <div className="pt-4 flex items-center justify-between">
            {/* Left: Action Buttons */}
            <div className="flex items-center gap-3">
              {/* 법령 재선택 버튼 */}
              {onRefineSearch && !hasAIOpinion && (
                <button
                  onClick={onRefineSearch}
                  className="flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-70"
                  style={{ color: '#4E5968' }}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  법령 재선택
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              {/* AI 심층분석 버튼 */}
              {onRequestAIOpinion && !hasAIOpinion && (
                <button
                  onClick={onRequestAIOpinion}
                  className="flex items-center gap-1.5 text-sm font-medium transition-all hover:opacity-70"
                  style={{ color: '#4E5968' }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI 심층분석
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Right: Primary Action + Feedback */}
            <div className="flex items-center gap-3">
              {/* 피드백 버튼 */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleThumbsUp}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    thumbFeedback === "up"
                      ? "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                  aria-label="도움이 됐어요"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleThumbsDown}
                  className={`p-1.5 rounded-lg text-xs transition-all ${
                    thumbFeedback === "down"
                      ? "bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400"
                      : "text-muted-foreground hover:bg-muted/50"
                  }`}
                  aria-label="아쉬워요"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 의견서 작성 버튼 - Toss Primary Action */}
              {onDraftDocument && (
                <button
                  onClick={onDraftDocument}
                  className="px-4 py-2 rounded-lg text-sm font-bold transition-all hover:opacity-90"
                  style={{
                    background: '#E8F3FF',
                    color: '#1B64DA',
                  }}
                >
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    의견서 작성
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 피드백 모달 */}
      <OpinionFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        onComplete={handleFeedbackComplete}
      />

      {/* Answer Detail Sidebar */}
      <AnswerDetailSidebar
        isOpen={showDetailSidebar}
        onClose={() => setShowDetailSidebar(false)}
        conclusion={conclusion}
        factAnalysis={factAnalysis}
        queryContent={queryContent}
        reviewContent={reviewContent}
        sources={sources}
        aiOpinion={aiOpinion}
        questionSummary={questionSummary}
      />
    </>
  );
}