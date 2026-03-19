import { useState } from "react";
import { ArrowLeft, Database, FileText, Hash, Edit3, Save, CheckCircle2, BookOpen } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";

interface EmbeddingChunk {
  id: string;
  article: string;
  content: string;
  tokens: number;
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

const getMockChunks = (_policyId: string): EmbeddingChunk[] => [
  {
    id: "c1",
    article: "제1조(목적)",
    content: "본 규칙은 회사 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.",
    tokens: 104,
  },
  {
    id: "c2",
    article: "제2조(적용범위)",
    content: "직원의 취업에 관하여 법령 또는 근로계약 등에서 별도로 정한 사항 외에는 본 규칙이 정하는 바에 따른다.",
    tokens: 112,
  },
  {
    id: "c3",
    article: "제3조(사원의 정의)",
    content: '본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다.',
    tokens: 78,
  },
  {
    id: "c4",
    article: "제4조(채용)",
    content: "회사는 필요에 따라 공개채용 또는 특별채용의 방법으로 사원을 채용한다.",
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

// 원문 문서 목 데이터
const MOCK_ORIGINAL_DOCUMENT = `2024 더존비즈온 취업규칙 개정안

제1장 총 칙

제1조(목적)
본 규칙은 주식회사 더존비즈온(이하 "회사"라 한다) 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.

제2조(적용범위)
직원의 취업에 관하여 법령 또는 근로계약 등에서 별도로 정한 사항 외에는 본 규칙이 정하는 바에 따른다.

제3조(사원의 정의)
본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다.

제2장 채용 및 수습

제4조(채용)
회사는 필요에 따라 공개채용 또는 특별채용의 방법으로 사원을 채용한다.

제5조(채용 시 제출서류)
채용이 결정된 자는 회사가 정하는 기간 내에 다음 각 호의 서류를 제출하여야 한다.
  1. 이력서
  2. 최종학교 졸업증명서
  3. 기타 회사가 요구하는 서류

제6조(수습기간)
신규 채용된 사원에 대하여는 채용일로부터 3개월 간을 수습기간으로 한다. 단, 경력자의 경우 수습기간을 단축하거나 면제할 수 있다.

제7조(근로계약)
회사는 사원을 채용할 때에 다음 각 호의 사항을 명시한 근로계약서를 작성하고 교부하여야 한다.
  1. 임금
  2. 소정근로시간
  3. 휴일
  4. 연차 유급휴가
  5. 취업의 장소와 종사하여야 할 업무에 관한 사항

제3장 복무

제8조(복무의무)
사원은 다음 각 호의 사항을 준수하여야 한다.
  1. 업무에 관한 지시사항을 성실히 이행할 것
  2. 업무상 지득한 기밀을 외부에 누설하지 않을 것
  3. 회사의 명예를 훼손하는 행위를 하지 않을 것
  4. 직무 이외의 업무를 위하여 회사 시설 및 비품을 무단으로 사용하지 않을 것`;

export function EmbeddingCorrectionView({ policy, onBack }: EmbeddingCorrectionViewProps) {
  const [chunks, setChunks] = useState(() => getMockChunks(policy.id));
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const startEditing = (chunkId: string, currentContent: string) => {
    setEditingChunkId(chunkId);
    setEditContent(currentContent);
  };

  const saveEditing = (chunkId: string) => {
    setChunks(chunks.map((c) => (c.id === chunkId ? { ...c, content: editContent } : c)));
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

      {/* ── 상단 헤더 ── */}
      <div className="border-b border-border bg-white px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="gap-1.5 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Button>
            <div className="w-px h-5 bg-gray-200" />
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              임베딩 데이터 수정
            </h1>
            <span className="text-sm text-muted-foreground truncate max-w-[240px]">{policy.name}</span>
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

      {/* ── 상단 고정 메타데이터 바 ── */}
      <div className="border-b border-border bg-white px-6 py-3 flex-shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium text-gray-700">카테고리</span>
            <span className="ml-1 px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold">
              {policy.category}
            </span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-medium text-gray-700">분할 단위</span>
            <span className="ml-1 font-semibold text-gray-800">조문</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium text-gray-700">총 청크</span>
            <span className="ml-1 font-semibold text-gray-800">{chunks.length}개 (전체 42개)</span>
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500">
            <span className="font-medium text-gray-700">벡터 토큰량</span>
            <span className="ml-1 font-semibold text-gray-800">12,500 Tokens</span>
          </span>
        </div>
      </div>

      {/* ── 좌우 분할 메인 영역 ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* 좌측: 원문 문서 뷰어 */}
        <div className="w-1/2 flex flex-col border-r border-border bg-white overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2 flex-shrink-0 bg-gray-50">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">원문 문서</span>
            <span className="ml-auto text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">
              PDF
            </span>
          </div>
          <div className="flex-1 overflow-y-auto px-8 py-6">
            <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
              {MOCK_ORIGINAL_DOCUMENT}
            </pre>
          </div>
        </div>

        {/* 우측: 임베딩 청크 수정 */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50">
          <div className="px-5 py-3 border-b border-gray-200 flex items-center gap-2 flex-shrink-0 bg-gray-50">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">임베딩 청크</span>
            <span className="ml-auto text-xs text-gray-400">{chunks.length}개 조문</span>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {chunks.map((chunk, index) => (
              <div
                key={chunk.id}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm"
              >
                {/* 청크 헤더 */}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">#{index + 1}</span>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-sm font-bold border border-blue-100">
                      {chunk.article}
                    </span>
                    <span className="text-xs text-gray-400">{chunk.tokens} tokens</span>
                  </div>

                  {editingChunkId !== chunk.id ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-blue-600 h-7 px-2"
                      onClick={() => startEditing(chunk.id, chunk.content)}
                    >
                      <Edit3 className="w-3.5 h-3.5 mr-1" /> 수정
                    </Button>
                  ) : (
                    <div className="flex gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2"
                        onClick={() => setEditingChunkId(null)}
                      >
                        취소
                      </Button>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 h-7 px-2"
                        onClick={() => saveEditing(chunk.id)}
                      >
                        <Save className="w-3.5 h-3.5 mr-1" /> 저장
                      </Button>
                    </div>
                  )}
                </div>

                {/* 청크 내용 */}
                {editingChunkId === chunk.id ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[80px] text-sm p-3 border-blue-300 focus-visible:ring-blue-500 bg-blue-50/30"
                    autoFocus
                  />
                ) : (
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
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
