import { useState, useRef } from "react";
import { Upload, FileText, X, Shield, Box } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { toast } from "sonner";
import { AIBoxSelectionModal } from "@/app/components/ai-box-selection-modal";

interface AIBox {
  id: string;
  name: string;
  registrant: string;
  tags: string[];
}

interface PolicyRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (policy: {
    name: string;
    size: number;
    type: string;
    category: string;
  }) => void;
}

export function PolicyRegistrationModal({ 
  isOpen, 
  onClose,
  onSubmit 
}: PolicyRegistrationModalProps) {
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; type: string } | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("취업규칙");
  const [customCategory, setCustomCategory] = useState<string>("");
  const [selectedAIBoxes, setSelectedAIBoxes] = useState<AIBox[]>([]);
  const [showAIBoxModal, setShowAIBoxModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    "취업규칙",
    "단체협약",
    "인사규정",
    "급여규정",
    "복리후생규정",
    "직접입력",
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/x-hwp',
      'application/haansofthwp',
    ];

    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.hwp')) {
      toast.error('지원되지 않는 파일 형식입니다. PDF, DOCX, HWP 파일만 업로드 가능합니다.');
      return;
    }

    setUploadedFile({ name: file.name, size: file.size, type: file.type });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
  };

  const handleSubmit = () => {
    // 카테고리 필수 체크
    if (!selectedCategory) {
      toast.error("카테고리를 선택해주세요.");
      return;
    }

    // 직접입력 시 카테고리명 체크
    if (selectedCategory === "직접입력" && !customCategory.trim()) {
      toast.error("카테고리명을 입력해주세요.");
      return;
    }

    // 파일 또는 AI Box 중 하나는 필수
    if (!uploadedFile && selectedAIBoxes.length === 0) {
      toast.error("파일을 업로드하거나 AI Box를 선택해주세요.");
      return;
    }

    onSubmit({
      name: uploadedFile?.name || "AI Box 연결",
      size: uploadedFile?.size || 0,
      type: uploadedFile?.type || "aibox",
      category: selectedCategory === "직접입력" ? customCategory : selectedCategory,
    });

    const message = uploadedFile 
      ? `${uploadedFile.name} 파일이 등록되었습니다.`
      : `AI Box ${selectedAIBoxes.length}개가 연결되었습니다.`;
    
    toast.success(message);

    // Reset form
    setUploadedFile(null);
    setSelectedCategory("취업규칙");
    setCustomCategory("");
    setSelectedAIBoxes([]);
    onClose();
  };

  const handleClose = () => {
    setUploadedFile(null);
    setSelectedCategory("취업규칙");
    setCustomCategory("");
    setSelectedAIBoxes([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            새 정책 등록
          </DialogTitle>
          <DialogDescription>
            사내 정책 문서를 등록하고 AI가 참조할 수 있도록 설정합니다.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-4">
          {/* 보안 안내 */}
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-semibold text-foreground">보안 안내</p>
                <ul className="text-xs text-muted-foreground space-y-0.5">
                  <li>• 업로드된 문서는 암호화되어 안전하게 저장됩니다</li>
                  <li>• 관리자만 접근 및 수정이 가능합니다</li>
                  <li>• 지원 형식: PDF, DOCX, HWP</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 카테고리 선택 */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm">문서 카테고리 *</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger id="category">
                <SelectValue placeholder="카테고리를 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 직접 입력 필드 */}
          {selectedCategory === "직접입력" && (
            <div className="space-y-2">
              <Label htmlFor="customCategory" className="text-sm">카테고리명 입력 *</Label>
              <Input
                id="customCategory"
                type="text"
                placeholder="예: 보안규정, 윤리강령 등"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
              />
            </div>
          )}

          {/* 파일 업로드 */}
          <div className="space-y-2">
            <Label className="text-sm">문서 파일 업로드 (파일 또는 AI Box 중 1개 필수)</Label>
            
            {!uploadedFile ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUpload}
                  accept=".pdf,.docx,.hwp"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center gap-2 text-center"
                >
                  <Upload className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      클릭하여 파일 업로드
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PDF, DOCX, HWP 파일 지원
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {uploadedFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(uploadedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* AI Box 선택 */}
          <div className="space-y-2">
            <Label className="text-sm">AI Box 선택</Label>
            
            {selectedAIBoxes.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                <button
                  type="button"
                  onClick={() => setShowAIBoxModal(true)}
                  className="w-full flex flex-col items-center gap-2 text-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Box className="w-8 h-8 text-primary" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      AI Box 선택
                    </p>
                  </div>
                </button>
              </div>
            ) : (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Box className="w-5 h-5 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        선택된 AI Box: {selectedAIBoxes.map(box => box.name).join(', ')}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedAIBoxes([])}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
            >
              취소
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!selectedCategory}
            >
              등록하기
            </Button>
          </div>
        </div>
      </DialogContent>
      <AIBoxSelectionModal
        isOpen={showAIBoxModal}
        onClose={() => setShowAIBoxModal(false)}
        onSelect={setSelectedAIBoxes}
      />
    </Dialog>
  );
}