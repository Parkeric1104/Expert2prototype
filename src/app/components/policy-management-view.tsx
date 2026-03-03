import { useState } from "react";
import { 
  Shield, FileText, Search, Filter, Download, ChevronDown, ChevronUp, 
  Edit, Trash2, History as HistoryIcon, Plus, Lock
} from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
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
}

interface PolicyHistory {
  version: number;
  date: string;
  action: "등록" | "수정" | "재업로드";
  changedBy: string;
  changes?: string;
}

interface PolicyManagementViewProps {
  isAdmin?: boolean;
}

export function PolicyManagementView({ isAdmin = true }: PolicyManagementViewProps) {
  // Mock data for existing policies
  const [policies, setPolicies] = useState<PolicyFile[]>([
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
        { version: 1, date: "2024-01-15", action: "등록", changedBy: "김관리" },
        { version: 2, date: "2024-02-20", action: "수정", changedBy: "김관리", changes: "카테고리 변경" },
      ],
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
        { version: 1, date: "2024-02-01", action: "등록", changedBy: "이노무" },
      ],
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
        { version: 1, date: "2023-12-10", action: "등록", changedBy: "박인사" },
        { version: 2, date: "2024-01-10", action: "재업로드", changedBy: "박인사", changes: "개정된 파일로 교체" },
        { version: 3, date: "2024-01-25", action: "수정", changedBy: "김관리", changes: "카테고리 세부 분류" },
      ],
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("전체");
  const [expandedPolicy, setExpandedPolicy] = useState<string | null>(null);
  const [editingPolicy, setEditingPolicy] = useState<string | null>(null);
  const [deletingPolicy, setDeletingPolicy] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);

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
    };

    setPolicies([newPolicy, ...policies]);
    toast.success("정책 문서가 성공적으로 등록되었습니다.");
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

  const toggleExpand = (policyId: string) => {
    setExpandedPolicy(expandedPolicy === policyId ? null : policyId);
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
            {filteredPolicies.map((policy) => (
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
                        </div>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                          <span>수정일: {policy.lastModified}</span>
                          <span>•</span>
                          <span>등록자: {policy.uploadedBy}</span>
                        </div>
                      </div>
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                          className="flex items-start gap-3 p-2 bg-card rounded text-sm"
                        >
                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex-shrink-0">
                            v{h.version}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{h.action}</span>
                              <span className="text-xs text-muted-foreground">
                                {h.date}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                by {h.changedBy}
                              </span>
                            </div>
                            {h.changes && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {h.changes}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

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
      />

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
