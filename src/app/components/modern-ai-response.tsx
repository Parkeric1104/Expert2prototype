import { useState } from "react";
import {
  Scale, FileText, BookOpen,
  AlertCircle, Sparkles, ArrowRight, Check
} from "lucide-react";
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
  const [showDetailSidebar, setShowDetailSidebar] = useState(false);

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

      {/* Action Buttons - 한 줄 pill 배치 (의견서 작성 모드에서만 표시) */}
      {showActionButtons && (
        <div className="mb-6">
          <div className="h-px" style={{ background: '#F2F4F6' }} />
          <div className="pt-3 flex items-center gap-2">
            {/* 법령 재선택 */}
            {onRefineSearch && !hasAIOpinion && (
              <button
                onClick={onRefineSearch}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ background: '#F2F4F6', color: '#4E5968', border: '1px solid #E5E8EB' }}
              >
                <BookOpen className="w-3.5 h-3.5" />
                법령 재선택
              </button>
            )}

            {/* 의견서 작성 */}
            {onDraftDocument && (
              <button
                onClick={onDraftDocument}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ background: '#E8F3FF', color: '#1B64DA', border: '1px solid #C2DCFF' }}
              >
                <FileText className="w-3.5 h-3.5" />
                의견서 작성
              </button>
            )}

            {/* AI 심층분석 */}
            {onRequestAIOpinion && !hasAIOpinion && (
              <button
                onClick={onRequestAIOpinion}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80 active:scale-95"
                style={{ background: '#F3F0FF', color: '#6B47ED', border: '1px solid #DDD6FE' }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI 심층분석
              </button>
            )}
          </div>
        </div>
      )}

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
