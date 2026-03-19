import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft, Database, FileText, Hash, Edit3, Save,
  CheckCircle2, BookOpen, Trash2, Merge, Scissors,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";
import { toast } from "sonner";

// ── 타입 ──────────────────────────────────────────────
interface EmbeddingChunk {
  id: string;
  article: string;
  content: string;
  tokens: number;
  docPage: number; // 원문 문서 페이지 번호
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

// ── 목 데이터 ─────────────────────────────────────────
const CHUNKS_PER_PAGE = 4;

const ALL_MOCK_CHUNKS: EmbeddingChunk[] = [
  // Page 1
  { id: "c1", article: "제1조(목적)", content: "본 규칙은 회사 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.", tokens: 104, docPage: 1 },
  { id: "c2", article: "제2조(적용범위)", content: "직원의 취업에 관하여 법령 또는 근로계약 등에서 별도로 정한 사항 외에는 본 규칙이 정하는 바에 따른다.", tokens: 112, docPage: 1 },
  { id: "c3", article: "제3조(사원의 정의)", content: '본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다.', tokens: 78, docPage: 1 },
  { id: "c4", article: "제4조(채용)", content: "회사는 필요에 따라 공개채용 또는 특별채용의 방법으로 사원을 채용한다.", tokens: 95, docPage: 1 },
  // Page 2
  { id: "c5", article: "제5조(채용 시 제출서류)", content: "채용이 결정된 자는 회사가 정하는 기간 내에 다음 각 호의 서류를 제출하여야 한다. 1. 이력서 2. 최종학교 졸업증명서 3. 기타 회사가 요구하는 서류", tokens: 138, docPage: 2 },
  { id: "c6", article: "제6조(수습기간)", content: "신규 채용된 사원에 대하여는 채용일로부터 3개월 간을 수습기간으로 한다. 단, 경력자의 경우 수습기간을 단축하거나 면제할 수 있다.", tokens: 121, docPage: 2 },
  { id: "c7", article: "제7조(근로계약)", content: "회사는 사원을 채용할 때에 다음 각 호의 사항을 명시한 근로계약서를 작성하고 교부하여야 한다. 1. 임금 2. 소정근로시간 3. 휴일 4. 연차 유급휴가", tokens: 145, docPage: 2 },
  { id: "c8", article: "제8조(복무의무)", content: "사원은 업무에 관한 지시사항을 성실히 이행하고, 업무상 지득한 기밀을 외부에 누설하지 않으며, 회사의 명예를 훼손하는 행위를 하지 않아야 한다.", tokens: 132, docPage: 2 },
  // Page 3
  { id: "c9", article: "제9조(출퇴근)", content: "사원은 정해진 출근시간 전에 출근하여 업무 준비를 완료하고, 퇴근 시에는 사용한 기기 및 시설을 정리하여야 한다.", tokens: 110, docPage: 3 },
  { id: "c10", article: "제10조(근무시간)", content: "사원의 소정 근무시간은 1일 8시간, 1주 40시간으로 한다. 단, 업무의 특성에 따라 근무시간을 조정할 수 있다.", tokens: 118, docPage: 3 },
  { id: "c11", article: "제11조(휴게시간)", content: "사원은 근무시간 중 1시간의 휴게시간을 가진다. 휴게시간은 자유롭게 사용할 수 있다.", tokens: 89, docPage: 3 },
  { id: "c12", article: "제12조(초과근무)", content: "초과근무는 부서장의 사전 승인을 받아야 하며, 초과근무 수당은 관련 법령에 따라 지급한다.", tokens: 97, docPage: 3 },
];

// ── 원문 문서 페이지별 목 데이터 ──────────────────────
const MOCK_DOC_PAGES: Record<number, string> = {
  1: `2024 더존비즈온 취업규칙 개정안\n\n제1장 총 칙\n\n제1조(목적)\n본 규칙은 주식회사 더존비즈온(이하 "회사"라 한다) 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.\n\n제2조(적용범위)\n직원의 취업에 관하여 법령 또는 근로계약 등에서 별도로 정한 사항 외에는 본 규칙이 정하는 바에 따른다.\n\n제3조(사원의 정의)\n본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다.\n\n제2장 채용 및 수습\n\n제4조(채용)\n회사는 필요에 따라 공개채용 또는 특별채용의 방법으로 사원을 채용한다.`,
  2: `제5조(채용 시 제출서류)\n채용이 결정된 자는 회사가 정하는 기간 내에 다음 각 호의 서류를 제출하여야 한다.\n  1. 이력서\n  2. 최종학교 졸업증명서\n  3. 기타 회사가 요구하는 서류\n\n제6조(수습기간)\n신규 채용된 사원에 대하여는 채용일로부터 3개월 간을 수습기간으로 한다. 단, 경력자의 경우 수습기간을 단축하거나 면제할 수 있다.\n\n제7조(근로계약)\n회사는 사원을 채용할 때에 다음 각 호의 사항을 명시한 근로계약서를 작성하고 교부하여야 한다.\n  1. 임금\n  2. 소정근로시간\n  3. 휴일\n  4. 연차 유급휴가\n  5. 취업의 장소와 종사하여야 할 업무에 관한 사항\n\n제3장 복무\n\n제8조(복무의무)\n사원은 다음 각 호의 사항을 준수하여야 한다.\n  1. 업무에 관한 지시사항을 성실히 이행할 것\n  2. 업무상 지득한 기밀을 외부에 누설하지 않을 것\n  3. 회사의 명예를 훼손하는 행위를 하지 않을 것`,
  3: `제4장 근무시간\n\n제9조(출퇴근)\n사원은 정해진 출근시간 전에 출근하여 업무 준비를 완료하고, 퇴근 시에는 사용한 기기 및 시설을 정리하여야 한다.\n\n제10조(근무시간)\n사원의 소정 근무시간은 1일 8시간, 1주 40시간으로 한다. 단, 업무의 특성에 따라 근무시간을 조정할 수 있다.\n\n제11조(휴게시간)\n사원은 근무시간 중 1시간의 휴게시간을 가진다. 휴게시간은 자유롭게 사용할 수 있다.\n\n제12조(초과근무)\n초과근무는 부서장의 사전 승인을 받아야 하며, 초과근무 수당은 관련 법령에 따라 지급한다.`,
};

const TOTAL_DOC_PAGES = Object.keys(MOCK_DOC_PAGES).length;

// ── 헬퍼: 텍스트 내 article 키워드 강조 ────────────────
function highlightArticle(text: string, article: string | null) {
  if (!article) return text;
  // article에서 조항 번호만 추출 (예: "제1조")
  const match = article.match(/제\d+조/);
  if (!match) return text;
  return text; // 하이라이트는 CSS로 처리
}

// ── 메인 컴포넌트 ──────────────────────────────────────
export function EmbeddingCorrectionView({ policy, onBack }: EmbeddingCorrectionViewProps) {
  const [chunks, setChunks] = useState<EmbeddingChunk[]>(ALL_MOCK_CHUNKS);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null);
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [mergeTargetId, setMergeTargetId] = useState<string | null>(null);

  const docRef = useRef<HTMLDivElement>(null);
  const articleRefs = useRef<Record<string, HTMLSpanElement | null>>({});

  const totalPages = Math.ceil(chunks.length / CHUNKS_PER_PAGE);
  const pageChunks = chunks.slice((currentPage - 1) * CHUNKS_PER_PAGE, currentPage * CHUNKS_PER_PAGE);

  // 선택된 청크의 docPage
  const selectedChunk = chunks.find((c) => c.id === selectedChunkId);
  const activePage = selectedChunk?.docPage ?? pageChunks[0]?.docPage ?? 1;

  // 청크 선택 시 원문 해당 구절 스크롤
  useEffect(() => {
    if (selectedChunkId && articleRefs.current[selectedChunkId]) {
      articleRefs.current[selectedChunkId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [selectedChunkId]);

  // ── 청크 조작 ────────────────────────────────────────
  const startEditing = (chunkId: string, content: string) => {
    setEditingChunkId(chunkId);
    setEditContent(content);
  };

  const saveEditing = (chunkId: string) => {
    setChunks((prev) => prev.map((c) => (c.id === chunkId ? { ...c, content: editContent } : c)));
    setEditingChunkId(null);
    toast.success("청크 내용이 수정되었습니다.");
  };

  const deleteChunk = (chunkId: string) => {
    setChunks((prev) => prev.filter((c) => c.id !== chunkId));
    if (selectedChunkId === chunkId) setSelectedChunkId(null);
    toast.success("청크가 삭제되었습니다.");
  };

  const mergeChunk = (chunkId: string) => {
    const idx = chunks.findIndex((c) => c.id === chunkId);
    if (idx < 0 || idx >= chunks.length - 1) {
      toast.error("병합할 다음 청크가 없습니다.");
      return;
    }
    const curr = chunks[idx];
    const next = chunks[idx + 1];
    const merged: EmbeddingChunk = {
      ...curr,
      content: `${curr.content}\n\n${next.content}`,
      tokens: curr.tokens + next.tokens,
    };
    setChunks((prev) => {
      const copy = [...prev];
      copy.splice(idx, 2, merged);
      return copy;
    });
    setMergeTargetId(null);
    toast.success(`${curr.article}와 ${next.article}이 병합되었습니다.`);
  };

  const splitChunk = (chunkId: string) => {
    const idx = chunks.findIndex((c) => c.id === chunkId);
    if (idx < 0) return;
    const curr = chunks[idx];
    const mid = Math.floor(curr.content.length / 2);
    const splitPoint = curr.content.indexOf(" ", mid);
    if (splitPoint < 0) {
      toast.error("분해 가능한 위치를 찾지 못했습니다.");
      return;
    }
    const part1 = curr.content.slice(0, splitPoint).trim();
    const part2 = curr.content.slice(splitPoint).trim();
    const newChunks: EmbeddingChunk[] = [
      { ...curr, id: `${curr.id}-a`, content: part1, tokens: Math.ceil(curr.tokens / 2) },
      { ...curr, id: `${curr.id}-b`, article: `${curr.article}(분해)`, content: part2, tokens: Math.floor(curr.tokens / 2) },
    ];
    setChunks((prev) => {
      const copy = [...prev];
      copy.splice(idx, 1, ...newChunks);
      return copy;
    });
    toast.success(`${curr.article}이 2개로 분해되었습니다.`);
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success("분석 데이터가 저장되었습니다.");
      onBack();
    }, 800);
  };

  // ── 원문 렌더링: 선택 청크 키워드 하이라이트 ────────────
  const renderDocPage = (pageText: string) => {
    if (!selectedChunk) {
      return <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{pageText}</pre>;
    }
    const keyword = selectedChunk.article.match(/제\d+조/)?.[0];
    if (!keyword) {
      return <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">{pageText}</pre>;
    }
    const parts = pageText.split(new RegExp(`(${keyword})`, "g"));
    return (
      <pre className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap font-sans">
        {parts.map((part, i) =>
          part === keyword ? (
            <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">
              {part}
            </mark>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </pre>
    );
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gray-50">

      {/* ── 상단 헤더 ── */}
      <div className="border-b border-border bg-white px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="gap-1.5 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              목록으로 돌아가기
            </Button>
            <div className="w-px h-5 bg-gray-200" />
            <h1 className="text-base font-bold text-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-primary" />
              문서 분석 상세 결과
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

      {/* ── 상단 고정 메타데이터 ── */}
      <div className="border-b border-border bg-white px-6 py-2.5 flex-shrink-0 shadow-sm">
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
            <span className="font-medium text-gray-700">총 청크</span>
            <span className="ml-1 font-semibold text-gray-800">{chunks.length}개</span>
          </span>
        </div>
      </div>

      {/* ── 좌우 분할 메인 영역 ── */}
      <div className="flex-1 flex overflow-hidden">

        {/* 좌측: 원문 문서 뷰어 */}
        <div className="w-1/2 flex flex-col border-r border-border bg-white overflow-hidden">
          <div className="px-5 py-2.5 border-b border-gray-100 flex items-center gap-2 flex-shrink-0 bg-gray-50">
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-700">원문 문서</span>
            <span className="ml-auto text-xs text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded">
              {activePage} / {TOTAL_DOC_PAGES} 페이지
            </span>
          </div>
          <div ref={docRef} className="flex-1 overflow-y-auto px-8 py-6">
            {renderDocPage(MOCK_DOC_PAGES[activePage] ?? "")}
          </div>
          {/* 원문 페이지 네비 */}
          <div className="border-t border-gray-100 px-5 py-2 flex items-center justify-center gap-2 flex-shrink-0 bg-gray-50">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={activePage <= 1}
              onClick={() => {
                setSelectedChunkId(null);
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-xs text-gray-500">원문 {activePage}페이지</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={activePage >= TOTAL_DOC_PAGES}
              onClick={() => {
                setSelectedChunkId(null);
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 우측: 청크 리스트 */}
        <div className="w-1/2 flex flex-col overflow-hidden bg-gray-50">
          <div className="px-5 py-2.5 border-b border-gray-200 flex items-center gap-2 flex-shrink-0 bg-gray-50">
            <Database className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">청크 데이터</span>
            <span className="ml-auto text-xs text-gray-400">
              {(currentPage - 1) * CHUNKS_PER_PAGE + 1}–{Math.min(currentPage * CHUNKS_PER_PAGE, chunks.length)} / {chunks.length}개
            </span>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {pageChunks.map((chunk, index) => {
              const isSelected = selectedChunkId === chunk.id;
              const isEditing = editingChunkId === chunk.id;
              const globalIndex = (currentPage - 1) * CHUNKS_PER_PAGE + index;

              return (
                <div
                  key={chunk.id}
                  className={`bg-white border rounded-xl p-4 shadow-sm cursor-pointer transition-all ${
                    isSelected ? "border-blue-400 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => !isEditing && setSelectedChunkId(isSelected ? null : chunk.id)}
                >
                  {/* 청크 헤더 */}
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 font-mono">#{globalIndex + 1}</span>
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-xs font-bold border border-blue-100">
                        {chunk.article}
                      </span>
                      <span className="text-xs text-gray-400">{chunk.tokens}t</span>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                      {!isEditing ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="수정"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-blue-600"
                            onClick={() => startEditing(chunk.id, chunk.content)}
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="분해"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-purple-600"
                            onClick={() => splitChunk(chunk.id)}
                          >
                            <Scissors className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="병합 (다음 청크와)"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-green-600"
                            onClick={() => mergeChunk(chunk.id)}
                            disabled={globalIndex >= chunks.length - 1}
                          >
                            <Merge className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="삭제"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                            onClick={() => deleteChunk(chunk.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setEditingChunkId(null)}>
                            취소
                          </Button>
                          <Button size="sm" className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700" onClick={() => saveEditing(chunk.id)}>
                            <Save className="w-3 h-3 mr-1" />저장
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* 청크 내용 */}
                  {isEditing ? (
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[72px] text-sm p-2.5 border-blue-300 focus-visible:ring-blue-500 bg-blue-50/30"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className={`text-sm leading-relaxed p-2.5 rounded-lg border ${
                      isSelected ? "bg-blue-50/50 border-blue-100 text-blue-900" : "bg-gray-50 border-gray-100 text-gray-700"
                    }`}>
                      {chunk.content}
                    </div>
                  )}

                  {/* 원문 페이지 배지 */}
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-blue-500">
                      <FileText className="w-3 h-3" />
                      원문 {chunk.docPage}페이지에서 발췌
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* ── 하단 페이지네이션 ── */}
          <div className="border-t border-gray-200 px-5 py-3 flex items-center justify-center gap-2 flex-shrink-0 bg-white">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={currentPage <= 1}
              onClick={() => { setCurrentPage((p) => p - 1); setSelectedChunkId(null); }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => { setCurrentPage(page); setSelectedChunkId(null); }}
                className={`h-7 w-7 rounded-md text-xs font-medium transition-colors ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            ))}
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={currentPage >= totalPages}
              onClick={() => { setCurrentPage((p) => p + 1); setSelectedChunkId(null); }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
