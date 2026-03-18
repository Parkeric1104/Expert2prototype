import { useState } from "react";
import { X, Search } from "lucide-react";
import { Checkbox } from "@/app/components/ui/checkbox";

interface LawSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLaws: string[];
  onConfirm: (laws: string[]) => void;
}

const AVAILABLE_LAWS = [
  { id: "labor-standards", name: "근로기준법", isDefault: true },
  { id: "equal-employment", name: "남녀고용평등법", isDefault: false },
  { id: "industrial-safety", name: "산업안전보건법", isDefault: false },
  { id: "serious-accident", name: "중대재해처벌법", isDefault: false },
  { id: "labor-union", name: "노동조합 및 노동관계조정법", isDefault: false },
  { id: "minimum-wage", name: "최저임금법", isDefault: false },
  { id: "dispatched-workers", name: "파견근로자 보호법", isDefault: false },
  { id: "fixed-term", name: "기간제 및 단시간근로자 보호법", isDefault: false },
  { id: "employment-insurance", name: "고용보험법", isDefault: false },
  { id: "industrial-accident-insurance", name: "산업재해보상보험법", isDefault: false },
  { id: "elderly-employment", name: "고령자고용촉진법", isDefault: false },
  { id: "disabled-employment", name: "장애인고용촉진법", isDefault: false },
  { id: "foreign-workers", name: "외국인근로자 고용법", isDefault: false },
  { id: "vocational-training", name: "근로자직업능력개발법", isDefault: false },
  { id: "labor-welfare", name: "근로복지기본법", isDefault: false },
];

const COMPANY_REGULATIONS = [
  { id: "hr-reg-001", name: "인사관리규정", category: "인사" },
  { id: "hr-reg-002", name: "급여관리규정", category: "인사" },
  { id: "hr-reg-003", name: "복리후생규정", category: "인사" },
  { id: "hr-reg-004", name: "교육훈련규정", category: "인사" },
  { id: "hr-reg-005", name: "징계규정", category: "인사" },
  { id: "work-reg-001", name: "근무관리규정", category: "근무" },
  { id: "work-reg-002", name: "휴가관리규정", category: "근무" },
  { id: "work-reg-003", name: "출장관리규정", category: "근무" },
  { id: "work-reg-004", name: "재택근무규정", category: "근무" },
  { id: "work-reg-005", name: "탄력근무제운영규정", category: "근무" },
  { id: "safety-reg-001", name: "안전보건관리규정", category: "안전" },
  { id: "safety-reg-002", name: "비상대응절차규정", category: "안전" },
  { id: "safety-reg-003", name: "작업환경관리규정", category: "안전" },
  { id: "it-reg-001", name: "정보보안규정", category: "기타" },
  { id: "it-reg-002", name: "개인정보처리규정", category: "기타" },
  { id: "ethics-reg-001", name: "윤리강령", category: "기타" },
  { id: "ethics-reg-002", name: "성희롱예방규정", category: "기타" },
  { id: "finance-reg-001", name: "경비관리규정", category: "기타" },
  { id: "vehicle-reg-001", name: "차량관리규정", category: "기타" },
  { id: "facility-reg-001", name: "시설물관리규정", category: "기타" },
];

export function LawSelectionModal({ isOpen, onClose, selectedLaws, onConfirm }: LawSelectionModalProps) {
  // Initialize with all laws if selectedLaws is empty (first time opening)
  // 근로기준법은 항상 포함
  const [localSelectedLaws, setLocalSelectedLaws] = useState<string[]>(() => {
    const laws = selectedLaws.length > 0 ? selectedLaws : AVAILABLE_LAWS.map(law => law.id);
    // 근로기준법이 없다면 추가
    if (!laws.includes("labor-standards")) {
      return ["labor-standards", ...laws];
    }
    return laws;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "laws" | "regulations">("all");

  // Reset local state when modal opens
  useState(() => {
    if (isOpen) {
      // If no laws selected yet, default to all laws
      const laws = selectedLaws.length > 0 ? selectedLaws : AVAILABLE_LAWS.map(law => law.id);
      // 근로기준법이 없다면 추가
      if (!laws.includes("labor-standards")) {
        setLocalSelectedLaws(["labor-standards", ...laws]);
      } else {
        setLocalSelectedLaws(laws);
      }
      setSearchQuery("");
      setFilterType("all");
    }
  });

  if (!isOpen) return null;

  const filteredLaws = AVAILABLE_LAWS.filter(law =>
    law.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredRegulations = COMPANY_REGULATIONS.filter(reg =>
    reg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    reg.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 필터에 따라 표시할 항목 결정
  const shouldShowLaws = filterType === "all" || filterType === "laws";
  const shouldShowRegulations = filterType === "all" || filterType === "regulations";

  const handleToggle = (lawId: string) => {
    // 근로기준법은 토글 불가
    if (lawId === "labor-standards") return;
    
    setLocalSelectedLaws(prev =>
      prev.includes(lawId)
        ? prev.filter(id => id !== lawId)
        : [...prev, lawId]
    );
  };

  const handleSelectAll = () => {
    const newIds: string[] = [];
    if (shouldShowLaws) {
      newIds.push(...filteredLaws.map(law => law.id));
    }
    if (shouldShowRegulations) {
      newIds.push(...filteredRegulations.map(reg => reg.id));
    }
    setLocalSelectedLaws(prev => [...new Set([...prev, ...newIds])]);
  };

  const handleDeselectAll = () => {
    const idsToRemove: string[] = [];
    if (shouldShowLaws) {
      idsToRemove.push(...filteredLaws.map(law => law.id).filter(id => id !== "labor-standards"));
    }
    if (shouldShowRegulations) {
      idsToRemove.push(...filteredRegulations.map(reg => reg.id));
    }
    setLocalSelectedLaws(prev => prev.filter(id => !idsToRemove.includes(id)));
  };

  const handleApply = () => {
    onConfirm(localSelectedLaws);
    onClose();
  };

  const handleCancel = () => {
    setLocalSelectedLaws(selectedLaws);
    setSearchQuery("");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-6 border-b border-border flex-shrink-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold text-foreground mb-1">검색 대상 법령 선택</h2>
              <p className="text-sm text-muted-foreground">
                AI가 답변 생성 시 참조할 법령 범위를 지정하세요. (다중 선택 가능)
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="px-8 py-4 border-b border-border flex-shrink-0">
          <div className="flex gap-3 mb-3">
            {/* Filter Dropdown - 좌측 */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as "all" | "laws" | "regulations")}
              className="px-4 py-2 rounded-lg bg-muted border border-border text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="all">전체</option>
              <option value="laws">법령</option>
              <option value="regulations">사규</option>
            </select>

            {/* Search Input - 우측 */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="검색..."
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Select All / Deselect All Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSelectAll}
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              ☑️ 전체 선택
            </button>
            <button
              onClick={handleDeselectAll}
              className="text-xs text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              ⬜ 전체 해제
            </button>
            <span className="text-xs text-muted-foreground ml-auto">
              {localSelectedLaws.length}개 선택됨
            </span>
          </div>
        </div>

        {/* Law List - 스크롤 영역 */}
        <div className="flex-1 overflow-y-auto px-8 py-4">
          {shouldShowLaws && (
            filteredLaws.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLaws.map((law) => {
                  const isDisabled = law.id === "labor-standards";
                  return (
                    <label
                      key={law.id}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        isDisabled ? 'cursor-not-allowed' : 'hover:bg-muted cursor-pointer'
                      }`}
                    >
                      <Checkbox
                        checked={localSelectedLaws.includes(law.id)}
                        onCheckedChange={() => handleToggle(law.id)}
                        disabled={isDisabled}
                      />
                      <span className="text-sm text-foreground flex-1">
                        {law.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            )
          )}
          {shouldShowRegulations && (
            filteredRegulations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredRegulations.map((reg) => (
                  <label
                    key={reg.id}
                    className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={localSelectedLaws.includes(reg.id)}
                      onCheckedChange={() => handleToggle(reg.id)}
                    />
                    <span className="text-sm text-foreground flex-1">
                      {reg.name}
                    </span>
                  </label>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border bg-muted/30 flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-card border border-border rounded-lg text-foreground hover:bg-muted transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              disabled={localSelectedLaws.length === 0}
              className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              선택 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}