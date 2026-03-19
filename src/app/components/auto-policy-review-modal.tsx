import { useState, useEffect } from "react";
import {
  FileText, CheckCircle2, Edit3, Save, Database,
  Hash, Clock, AlertCircle
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Textarea } from "@/app/components/ui/textarea";

const REVIEW_POLICY_ID = "review-001";
const SNOOZE_KEY = "snoozePolicyReview";

const initialChunks = [
  {
    id: "c1",
    article: "제1조(목적)",
    content:
      "본 규칙은 주식회사 더존비즈온 직원의 근로조건, 복무규율 등 취업에 관한 제반 사항을 정함을 목적으로 한다.",
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
      '본 규칙에서 "사원"이라 함은 제2장에 의하여 회사에 채용된 자를 말한다. (오타 수정 필요)',
    tokens: 78,
  },
];

interface AutoPolicyReviewModalProps {
  onPolicyRegistered: (policyId: string) => void;
}

export function AutoPolicyReviewModal({ onPolicyRegistered }: AutoPolicyReviewModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [chunks, setChunks] = useState(initialChunks);
  const [editingChunkId, setEditingChunkId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // 메인/정책 화면 진입 시 스누즈 만료 여부 체크
  useEffect(() => {
    const snoozeUntil = localStorage.getItem(SNOOZE_KEY);
    const now = Date.now();
    if (!snoozeUntil || now > parseInt(snoozeUntil, 10)) {
      setIsOpen(true);
    }
  }, []);

  const handleSnooze = () => {
    localStorage.setItem(SNOOZE_KEY, (Date.now() + 60 * 60 * 1000).toString());
    setIsOpen(false);
  };

  const startEditing = (chunkId: string, currentContent: string) => {
    setEditingChunkId(chunkId);
    setEditContent(currentContent);
  };

  const saveEditing = (chunkId: string) => {
    setChunks(chunks.map((c) => (c.id === chunkId ? { ...c, content: editContent } : c)));
    setEditingChunkId(null);
  };

  // 검토 완료 → 사내 정책 등록
  const handleFinalSubmit = () => {
    onPolicyRegistered(REVIEW_POLICY_ID);
    setIsOpen(false);
    localStorage.removeItem(SNOOZE_KEY);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {/* 외부 클릭으로 닫히지 않도록 강제 */}
      <DialogContent
        className="sm:max-w-[850px] p-0 flex flex-col max-h-[90vh] bg-gray-50"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-4 bg-white border-b border-gray-100">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <Database className="w-5 h-5 text-blue-600" />
            AI 학습 데이터 검토 대기
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-amber-500" />
            업로드하신 문서의 파싱이 완료되었습니다. 검토를 완료해야 사내 정책으로 공식 등록됩니다.
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* 문서 메타데이터 */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-500" />
              2024 더존비즈온 취업규칙 개정안.pdf
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">문서 분할 단위</span>
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-gray-400" /> 조문 단위
                </span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">총 생성 청크</span>
                <span className="text-sm font-semibold text-gray-800">42 개</span>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <span className="text-xs text-gray-500 block mb-1">총 벡터 토큰량</span>
                <span className="text-sm font-semibold text-gray-800">12,500 Tokens</span>
              </div>
            </div>
          </div>

          {/* 청크 리스트 & 인라인 수정 */}
          <div className="space-y-4">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
              >
                <div className="flex justify-between items-center mb-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-800 text-sm font-bold border border-blue-100">
                    {chunk.article}
                  </span>
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
                  <div className="text-sm text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100">
                    {chunk.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 푸터: 1시간 보지 않기 & 등록 */}
        <DialogFooter className="p-5 bg-white border-t border-gray-100 flex justify-between items-center sm:justify-between">
          <Button
            variant="ghost"
            onClick={handleSnooze}
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-medium"
          >
            <Clock className="w-4 h-4 mr-1.5" />
            1시간 동안 보지 않기
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              임시 닫기
            </Button>
            <Button
              onClick={handleFinalSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              검토 완료 및 사내 정책 등록
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
