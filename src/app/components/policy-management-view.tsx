import { useState, useEffect } from "react";
import {
  Shield, FileText, Search, Filter, Download, ChevronDown, ChevronUp,
  Edit, Trash2, History as HistoryIcon, Plus, Lock, Clock, CheckCircle2, AlertCircle,
  Database, Eye
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
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
import { PolicyRegistrationModal } from "@/app/components/policy-registration-modal";
import { toast } from "sonner";

interface PolicyFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: string;
  uploadDate: string;
  lastModified: string;
  uploadedBy: string;
  version: number;
  history: PolicyHistory[];
  status: "pending" | "review" | "active" | "error"; // 상태 추가
}

interface PolicyHistory {
  version: number;
  date: string;
  action: "등록" | "수정" | "재업로드";
  changedBy: string;
  changes?: string;
  status?: "pending" | "review" | "active" | "error"; // 히스토리 항목별 상태 추가
}

interface PolicyManagementViewProps {
  isAdmin?: boolean;
  reviewCompleteIds?: string[];
  onNavigateToEmbedding?: (policy: { id: string; name: string; category: string }) => void;
}

export function PolicyManagementView({
  isAdmin = true,
  reviewCompleteIds = [],
  onNavigateToEmbedding,
}: PolicyManagementViewProps) {
  // Mock data for existing policies
  const [policies, setPolicies] = useState<PolicyFile[]>(([
    {
      id: "1",
      name: "2024년_취업규칙.pdf",
      size: 2458624,
      type: "application/pdf",
      category: "취업규칙",
      uploadDate: "2024-01-15",
      lastModified: "2024-02-20",
      uploadedBy: "김관리",
      version: 2,
      history: [
        { version: 1, date: "2024-01-15", action: "등록", changedBy: "김관리", status: "active" },
        { version: 2, date: "2024-02-20", action: "등록", changedBy: "김관리", status: "pending" },
      ],
      status: "active",
    },
    {
      id: "2",
      name: "단체협약_2024.docx",
      size: 1845248,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      category: "단체협약",
      uploadDate: "2024-02-01",
      lastModified: "2024-02-01",
      uploadedBy: "이노무",
      version: 1,
      history: [
        { version: 1, date: "2024-02-01", action: "등록", changedBy: "이노무", status: "active" },
      ],
      status: "active",
    },
    {
      id: "3",
      name: "인사규정_개정판.hwp",
      size: 3145728,
      type: "application/x-hwp",
      category: "인사규정",
      uploadDate: "2023-12-10",
      lastModified: "2024-01-25",
      uploadedBy: "박인사",
      version: 3,
      history: [
        { version: 1, date: "2023-12-10", action: "등록", changedBy: "박인사", status: "active" },
        { version: 2, date: "2024-01-10", action: "등록", changedBy: "박인사", status: "error" },
        { version: 3, date: "2024-01-25", action: "등록", changedBy: "김관리", status: "pending" },
      ],
      status: "active",
    },
    {
      id: "4",
      name: "급여규정_2024_v1.pdf",
      size: 2156780,
      type: "application/pdf",
      category: "급여규정",
      uploadDate: "2024-03-01",
      lastModified: "2024-03-01",
      uploadedBy: "최재무",
      version: 1,
      history: [
        { version: 1, date: "2024-03-01", action: "등록", changedBy: "최재무", status: "pending" },
      ],
      status: "pending",
    },
    {
      id: "5",
      name: "복리후생규정_개정안.hwp",
      size: 1920384,
      type: "application/x-hwp",
      category: "복리후생규정",
      uploadDate: "2024-03-05",
      lastModified: "2024-03-05",
      uploadedBy: "정복지",
      version: 1,
      history: [
        { version: 1, date: "2024-03-05", action: "등록", changedBy: "정복지", status: "pending" },
      ],
      status: "pending",
    },
    {
      id: "6",
      name: "보안규정_손상파일.pdf",
      size: 512000,
      type: "application/pdf",
      category: "인사규정",
      uploadDate: "2024-02-28",
      lastModified: "2024-02-28",
      uploadedBy: "강보안",
      version: 1,
      history: [
        { version: 1, date: "2024-02-28", action: "등록", changedBy: "강보안", status: "error" },
      ],
      status: "error",
    },
    {
      id: "7",
      name: "윤리강령_2024.docx",
      size: 987654,
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      category: "인사규정",
      uploadDate: "2024-01-20",
      lastModified: "2024-01-20",
      uploadedBy: "윤윤리",
      version: 1,
      history: [
        { version: 1, date: "2024-01-20", action: "등록", changedBy: "윤윤리", status: "active" },
      ],
      status: "active",
    },
    {
      id: "8",
      name: "퇴직금규정_최신본.pdf",
      size: 1456789,
      type: "application/pdf",
      category: "급여규정",
      uploadDate: "2024-03-08",
      lastModified: "2024-03-08",
      uploadedBy: "김급여",
      version: 1,
      history: [
        { version: 1, date: "2024-03-08", action: "등록", changedBy: "김급여", status: "pending" },
      ],
      status: "pending",
    },
    {
      id: "9",
      name: "파일파싱실패.hwp",
      size: 234567,
      type: "application/x-hwp",
      category: "취업규칙",
      uploadDate: "2024-03-07",
      lastModified: "2024-03-07",
      uploadedBy: "오에러",
      version: 1,
      history: [
        { version: 1, date: "2024-03-07", action: "등록", changedBy: "오에러", status: "error" },
      ],
      status: "error",
    },
    {
      id: "10",
      name: "연차휴가규정_개정.pdf",
      size: 1678901,
      type: "application/pdf",
      category: "복리후생규정",
      uploadDate: "2024-02-15",
      lastModified: "2024-02-22",
      uploadedBy: "박휴가",
      version: 2,
      history: [
        { version: 1, date: "2024-02-15", action: "등록", changedBy: "박휴가", status: "active" },
        { version: 2, date: "2024-02-22", action: "등록", changedBy: "박휴가", status: "pending" },
      ],
      status: "active",
    },
    {
      id: "11",
      name: "근로계약서_표준양식.pdf",
      size: 1234567,
      type: "application/pdf",
      category: "취업규칙",
      uploadDate: "2024-02-10",
      lastModified: "2024-03-10",
      uploadedBy: "송계약",
      version: 3,
      history: [
        { version: 1, date: "2024-02-10", action: "등록", changedBy: "송계약", status: "active" },
        { version: 2, date: "2024-02-25", action: "등록", changedBy: "송계약", status: "active" },
        { version: 3, date: "2024-03-10", action: "등록", changedBy: "송계약", status: "error" },
      ],
      status: "active",
    },
    // 검토 대기 문서 (AutoPolicyReviewModal에서 파싱 완료 알림)
    {
      id: "review-001",
      name: "2024 더존비즈온 취업규칙 개정안.pdf",
      size: 2048000,
      type: "application/pdf",
      category: "취업규칙",
      uploadDate: "2026-03-19",
      lastModified: "2026-03-19",
      uploadedBy: "현재사용자",
      version: 1,
      history: [
        { version: 1, date: "2026-03-19", action: "등록", changedBy: "현재사용자", status: "review" },
      ],
      status: "review",
    },
  ]));

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("전체");
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);

  // AutoPolicyReviewModal에서 등록 완료된 정책 상태를 active로 업데이트
  useEffect(() => {
    if (reviewCompleteIds.length > 0) {
      setPolicies((prev) =>
        prev.map((p) =>
          reviewCompleteIds.includes(p.id) ? { ...p, status: "active" } : p
        )
      );
    }
  }, [reviewCompleteIds]);
  const [deletingPolicy, setDeletingPolicy] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);

  const categories = [
    "취업규칙",
    "단체협약",
    "인사규정",
    "급여규정",
    "복리후생규정",
  ];

  const filterOptions = ["전체", ...categories];

  const filteredPolicies = policies.filter(policy => {
    const matchesSearch = policy.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         policy.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "전체" || policy.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmitNewPolicy = (policyData: {
    name: string;
    size: number;
    type: string;
    category: string;
  }) => {
    const newPolicy: PolicyFile = {
      id: Date.now().toString(),
      name: policyData.name,
      size: policyData.size,
      type: policyData.type,
      category: policyData.category,
      uploadDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString().split('T')[0],
      uploadedBy: "현재사용자",
      version: 1,
      history: [
        {
          version: 1,
          date: new Date().toISOString().split('T')[0],
          action: "등록",
          changedBy: "현재사용자",
        },
      ],
      status: "active", // 상태 추가
    };

    setPolicies([newPolicy, ...policies]);
    setShowRegistrationModal(false);
    setShowAnalysisModal(true);
  };

  const handleEditCategory = (policyId: string, newCategory: string) => {
    setPolicies(policies.map(policy => {
      if (policy.id === policyId) {
        return {
          ...policy,
          category: newCategory,
          lastModified: new Date().toISOString().split('T')[0],
          version: policy.version + 1,
          history: [
            ...policy.history,
            {
              version: policy.version + 1,
              date: new Date().toISOString().split('T')[0],
              action: "수정",
              changedBy: "현재사용자",
              changes: `카테고리 변경: ${policy.category} → ${newCategory}`,
            },
          ],
        };
      }
      return policy;
    }));
    setEditingPolicy(null);
    toast.success("정책이 수정되었습니다.");
  };

  const handleDeletePolicy = () => {
    if (deletingPolicy) {
      setPolicies(policies.filter(p => p.id !== deletingPolicy));
      toast.success("정책이 삭제되었습니다.");
      setDeletingPolicy(null);
      setShowDeleteDialog(false);
    }
  };

  const handleDownloadPolicy = (policy: PolicyFile) => {
    toast.success(`${policy.name} 다운로드를 시작합니다.`);
  };

  const handleRetryUpload = (policyId: string) => {
    // 재업로드 로직
    toast.info("파일을 다시 업로드해주세요.");
  };

  const toggleExpand = (policyId: string) => {
    setExpandedPolicy(expandedPolicy === policyId ? null : policyId);
  };

  // 리스트에 표시할 버전 정보 결정하는 함수
  // 접힌 상태의 리스트는 항상 v1(최초 버전) 기준으로 노출
  const getDisplayInfo = (policy: PolicyFile) => {
    // 항상 v1 정보를 리스트에 표시
    const firstVersion = policy.history[0];
    return {
      date: firstVersion.date,
      uploadedBy: firstVersion.changedBy,
      status: firstVersion.status || policy.status,
    };
  };

  // 히스토리 파일명 생성 함수 (파일명 + 버전 번호)
  const getHistoryFileName = (baseName: string, version: number) => {
    // 파일명과 확장자 분리
    const lastDotIndex = baseName.lastIndexOf('.');
    if (lastDotIndex === -1) {
      return `${baseName} ${version}`;
    }
    const nameWithoutExt = baseName.substring(0, lastDotIndex);
    const extension = baseName.substring(lastDotIndex);
    return `${nameWithoutExt} ${version}${extension}`;
  };

  // 상태 배지 렌더링 함수
  const getStatusBadge = (status: PolicyFile["status"]) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium whitespace-nowrap">
            <Clock className="w-3 h-3" />
            대기중
          </span>
        );
      case "review":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium whitespace-nowrap">
            <Eye className="w-3 h-3" />
            검토 대기
          </span>
        );
      case "active":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded text-xs font-medium whitespace-nowrap">
            <CheckCircle2 className="w-3 h-3" />
            등록완료
          </span>
        );
      case "error":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded text-xs font-medium whitespace-nowrap">
            <AlertCircle className="w-3 h-3" />
            오류
          </span>
        );
    }
  };

  // 관리자 권한이 없는 경우
  if (!isAdmin) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground">접근 권한 없음</h2>
          <p className="text-muted-foreground">
            사내 정책 관리는 <strong>관리자 권한</strong>이 있는 사용자만 접근할 수 있습니다.
          </p>
          <p className="text-sm text-muted-foreground">
            권한이 필요하신 경우 시스템 관리자에게 문의해주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                사내 정책 문서 관리
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                등록된 정책 문서를 관리하고 새로운 문서를 추가할 수 있습니다.
              </p>
            </div>
            <Button
              onClick={() => setShowRegistrationModal(true)}
              className="gap-2"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              등록하기
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* 검색 및 필터 */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="정책 이름 또는 카테고리로 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {filterOptions.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 정책 목록 */}
          <div className="space-y-3">
            {filteredPolicies.map((policy) => {
              const displayInfo = getDisplayInfo(policy);
              
              return (
                <div
                  key={policy.id}
                  className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors bg-card"
                >
                  {/* 정책 헤더 */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                        <div className="flex-1 min-w-0 space-y-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-semibold text-foreground truncate">
                              {policy.name}
                            </h3>
                            <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium whitespace-nowrap">
                              {policy.category}
                            </span>
                            {getStatusBadge(policy.status)}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <span>등록일: {displayInfo.date}</span>
                            <span>•</span>
                            <span>등록자: {displayInfo.uploadedBy}</span>
                          </div>
                        </div>
                      </div>

                      {/* 액션 버튼 */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* 임베딩 수정: 등록완료(active) 정책에만 노출 */}
                        {policy.status === "active" && onNavigateToEmbedding && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              onNavigateToEmbedding({
                                id: policy.id,
                                name: policy.name,
                                category: policy.category,
                              })
                            }
                            title="임베딩 데이터 수정"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <Database className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDownloadPolicy(policy)}
                          title="다운로드"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingPolicy(policy.id)}
                          title="수정"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDeletingPolicy(policy.id);
                            setShowDeleteDialog(true);
                          }}
                          title="삭제"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => toggleExpand(policy.id)}
                          title="히스토리 보기"
                        >
                          {expandedPolicy === policy.id ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* 수정 폼 */}
                    {editingPolicy === policy.id && (
                      <div className="mt-4 p-3 bg-muted rounded-lg">
                        <Label className="text-sm mb-2 block">카테고리 변경</Label>
                        <div className="flex gap-2">
                          <Select
                            defaultValue={policy.category}
                            onValueChange={(value) => handleEditCategory(policy.id, value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPolicy(null)}
                          >
                            취소
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 히스토리 확장 영역 */}
                  {expandedPolicy === policy.id && (
                    <div className="p-4 bg-muted/50 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <HistoryIcon className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm">변경 이력</h4>
                      </div>
                      <div className="space-y-2">
                        {policy.history.map((h, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-4 p-3 bg-card rounded-lg border border-border"
                          >
                            {/* 버전 정보 */}
                            <div className="flex items-center justify-center px-3 py-2 border-2 border-primary/30 bg-primary/5 text-primary text-sm font-bold rounded flex-shrink-0">
                              v{h.version}
                            </div>
                            
                            {/* 파일명 및 상세 정보 */}
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-foreground text-sm mb-1">
                                {getHistoryFileName(policy.name, h.version)}
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>등록일: {h.date}</span>
                                <span>•</span>
                                <span>등록자: {h.changedBy}</span>
                              </div>
                            </div>

                            {/* 상태 배지 */}
                            {h.status && (
                              <div className="flex-shrink-0">
                                {getStatusBadge(h.status)}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredPolicies.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>등록된 정책 문서가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 등록 모달 */}
      <PolicyRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onSubmit={handleSubmitNewPolicy}
        existingCategories={Array.from(new Set(policies.map(p => p.category)))}
        existingPolicies={policies.map(p => ({ category: p.category, name: p.name }))}
      />

      {/* 문서 분석 시작 안내 팝업 */}
      <Dialog open={showAnalysisModal} onOpenChange={setShowAnalysisModal}>
        <DialogContent className="sm:max-w-[440px]" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900">
              등록하신 문서 분석을 시작합니다
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 leading-relaxed mt-2">
              등록하신 문서의 AI 분석 및 변환 작업을 진행하고 있습니다. 분석이 완료되면 별도로 안내해 드릴 예정이며, 이후 최종 확인 이후 사내 정책 문서로 등록이 완료됩니다.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              onClick={() => setShowAnalysisModal(false)}
              className="bg-primary hover:bg-primary/90 text-white px-8"
            >
              확인
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 삭제 확인 다이얼로그 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정책 문서 삭제</AlertDialogTitle>
            <AlertDialogDescription>
              이 정책 문서를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              <br />
              <br />
              <strong>삭제될 문서:</strong>{" "}
              {policies.find(p => p.id === deletingPolicy)?.name}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePolicy}
              className="bg-red-600 hover:bg-red-700"
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}