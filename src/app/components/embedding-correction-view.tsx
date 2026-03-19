import { useState } from "react";
import { ArrowLeft, Database, FileText, Hash, Edit3, Save, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";

interface EmbeddingChunk {
  id: string;
  article: string;
  content: string;
  tokens: number;
  hasIssue?: boolean;
}

export interface EmbeddingCorrectionPolicy {
  id: string;
  name: string;
  category: string;
}

interface EmbeddingCorrectionViewProps {
  policy: EmbeddingCorrectionPolicy;
  onBack: () => void;
}

// 문서별 목 청크 데이터 (실제 환경에서는 API 응답)
const getMockChunks = (policyId: string): EmbeddingChunk[] => [
  {
    id: "c1",
    article: "제1조(목적)",
    content:
      "본 규칙은 회사 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.",
    tokens: 104,
  },
  {
    id: "c2",
    article: "제2조(적용범위)",
    content:
      "직원의 취업에 관하여 법령 또는 근로계약 등에서 별도로 정한 사항 외에는 본 규칙이 정하는 바에 따른다.",
    tokens: 112,
  },
  {
    id: "c3",
    article: "제3조(사원의 정의)",
    content:
      '본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다. ※ 파싱 오류 가능성 — 원본 대조 필요',
    tokens: 78,
    hasIssue: true,
  },
  {
    id: "c4",
    article: "제4조(채용)",
    content:
      "회사는 필요에 따라 공개채용 또는 특별채용의 방법으로 사원을 채용한다.",
    tokens: 95,
  },
  {
    id: "c5",
    article: "제5조(채용 시 제출서류)",
    content:
      "채용이 결정된 자는 회사가 정하는 기간 내에 다음 각 호의 서류를 제출하여야 한다. 1. 이력서 2. 최종학교 졸업증명서 3. 기타 회사가 요구하는 서류",
    tokens: 138,
  },
  {
    id: "c6",
    article: "제6조(수습기간)",
    content:
      "신규 채용된 사원에 대하여는 채용일로부터 3개월 간을 수습기간으로 한다. 단, 경력자의 경우 수습기간을 단축하거나 면제할 수 있다.",
    tokens: 121,
  },
];

export function EmbeddingCorrectionView({ policy, onBack }: EmbeddingCorrectionViewProps) {
  const [chunks, setChunks] = useState(() => getMockChunks(policy.id));
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const issueCount = chunks.filter((c) => c.hasIssue).length;

  const startEditing = (chunkId: string, currentContent: string) => {
    setEditingChunkId(chunkId);
    setEditContent(currentContent);
  };

  const saveEditing = (chunkId: string) => {
    setChunks(
      chunks.map((c) =>
        c.id === chunkId ? { ...c, content: editContent, hasIssue: false } : c
      )
    );
    setEditingChunkId(null);
    toast.success("청크 내용이 수정되었습니다.");
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("임베딩 데이터가 업데이트되었습니다. AI 검색에 즉시 반영됩니다.");
      onBack();
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">
      {/* 헤더 */}
      <div className="border-b border-border bg-white px-6 py-4 flex-shrink-0">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1.5 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Button>
          </div>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                임베딩 데이터 수정
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">{policy.name}</p>
              {issueCount > 0 && (
                <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1 font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  파싱 오류 가능성이 있는 청크가 {issueCount}개 있습니다. 원본과 대조 후 수정해주세요.
                </p>
              )}
            </div>
            <Button
              onClick={handleSaveAll}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 flex-shrink-0"
            >
              <CheckCircle2 className="w-4 h-4" />
              {isSaving ? "저장 중..." : "수정 완료"}
            </Button>
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-4">
          {/* 메타데이터 카드 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-500" />
              문서 파싱 정보
            </h3>
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">카테고리</span>
                <span className="text-sm font-semibold text-gray-800">{policy.category}</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">분할 단위</span>
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-gray-400" /> 조문
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">총 청크 수</span>
                <span className="text-sm font-semibold text-gray-800">{chunks.length}개 (전체 42개)</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">벡터 토큰량</span>
                <span className="text-sm font-semibold text-gray-800">12,500 Tokens</span>
              </div>
            </div>
          </div>

          {/* 청크 리스트 */}
          <div className="space-y-3">
            {chunks.map((chunk, index) => (
              <div
                key={chunk.id}
                className={`bg-white border rounded-xl p-5 shadow-sm transition-colors ${
                  chunk.hasIssue
                    ? "border-amber-300 bg-amber-50/30"
                    : "border-gray-200"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-sm font-bold border border-blue-100">
                      {chunk.article}
                    </span>
                    <span className="text-xs text-gray-400">{chunk.tokens} tokens</span>
                    {chunk.hasIssue && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-medium border border-amber-200">
                        <AlertTriangle className="w-3 h-3" />
                        검토 필요
                      </span>
                    )}
                  </div>

                  {editingChunkId !== chunk.id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-blue-600 h-8"
                      onClick={() => startEditing(chunk.id, chunk.content)}
                    >
                      <Edit3 className="w-4 h-4 mr-1.5" /> 수정
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => setEditingChunkId(null)}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 h-8"
                        onClick={() => saveEditing(chunk.id)}
                      >
                        <Save className="w-4 h-4 mr-1.5" /> 저장
                      </Button>
                    </div>
                  )}
                </div>

                {editingChunkId === chunk.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] text-sm p-3 border-blue-300 focus-visible:ring-blue-500 bg-blue-50/30"
                    autoFocus
                  />
                ) : (
                  <div
                    className={`text-sm leading-relaxed p-3 rounded-lg border ${
                      chunk.hasIssue
                        ? "text-amber-900 bg-amber-50 border-amber-200"
                        : "text-gray-700 bg-gray-50 border-gray-100"
                    }`}
                  >
                    {chunk.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
