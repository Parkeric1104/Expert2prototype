import { useState } from "react";
import { 
  Scale, FileText, BookOpen, 
  Copy, CheckCheck, ThumbsUp, ThumbsDown, Share2,
  AlertCircle, Sparkles, ArrowRight, Check
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { AnswerDetailSidebar } from "@/app/components/answer-detail-sidebar";
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
}: ModernAIResponseProps) {
  const [copied, setCopied] = useState(false);
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);

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

  const handleOpenDetail = () => {
    setShowDetailSidebar(true);
  };

  return (
    <>
      <div className="flex justify-start mb-6">
        {/* 답변 컨테이너 */}
        <div className="max-w-[650px] flex flex-col gap-2">
          {/* 답변 버블 */}
          <div className="rounded-2xl px-5 py-3.5 bg-muted/50 text-foreground">
            {/* 분석 완료 메시지 */}
            <div className="mb-3 pb-3 border-b border-border/50">
              <div className="flex items-center gap-2 mb-1">
                <Check className="w-4 h-4 text-green-500" />
                <p className="text-xs text-muted-foreground font-medium">
                  질문 분석이 완료되었습니다
                </p>
              </div>
            </div>

            {/* 결론 */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1.5">
                <Scale className="w-4 h-4 text-indigo-500" />
                <h3 className="text-sm font-bold text-foreground">결론</h3>
              </div>
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                {conclusion}
              </p>
            </div>

            {/* 상세 답변 보기 버튼 */}
            <Button
              onClick={handleOpenDetail}
              variant="outline"
              size="sm"
              className="w-full gap-2 mt-2 border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
            >
              <BookOpen className="w-4 h-4" />
              <span className="text-xs font-semibold">상세 답변 보기</span>
              <ArrowRight className="w-4 h-4" />
            </Button>

            {/* Disclaimer */}
            {disclaimer && (
              <div className="mt-3 pt-3 border-t border-border/50">
                <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    {disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons - 메시지 밖 영역 */}
      <div className="mb-6 flex flex-wrap gap-2">
        {onRefineSearch && (
          <Button
            onClick={onRefineSearch}
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 text-xs border-border bg-background hover:bg-muted"
          >
            <BookOpen className="w-3.5 h-3.5" />
            법령 재선택
          </Button>
        )}
        {onDraftDocument && (
          <Button
            onClick={onDraftDocument}
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 text-xs border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary"
          >
            <FileText className="w-3.5 h-3.5" />
            의견서 작성
          </Button>
        )}
        {onRequestAIOpinion && !hasAIOpinion && (
          <Button
            onClick={onRequestAIOpinion}
            variant="outline"
            size="sm"
            className="gap-1.5 h-9 text-xs border-purple-300 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI 심층분석
          </Button>
        )}
      </div>

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