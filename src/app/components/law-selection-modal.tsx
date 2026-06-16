import { useState, useEffect } from "react";
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

// 세무 및 세법 — 국세 관련 법률 (총 19종)
const TAX_LAWS = [
  { id: "basic-national-tax", name: "국세기본법" },
  { id: "national-local-coord", name: "국세와 지방세의 조정 등에 관한 법률" },
  { id: "intl-tax-coord", name: "국제조세조정에 관한 법률" },
  { id: "national-tax-collection", name: "국세징수법" },
  { id: "corporate-tax", name: "법인세법" },
  { id: "vat", name: "부가가치세법" },
  { id: "inheritance-gift-tax", name: "상속세 및 증여세법" },
  { id: "income-tax", name: "소득세법" },
  { id: "stamp-tax", name: "인지세법" },
  { id: "asset-revaluation", name: "자산재평가법" },
  { id: "tax-special", name: "조세특례제한법" },
  { id: "individual-consumption-tax", name: "개별소비세법" },
  { id: "education-tax", name: "교육세법" },
  { id: "transport-energy-env-tax", name: "교통·에너지·환경세법" },
  { id: "rural-special-tax", name: "농어촌특별세법" },
  { id: "comprehensive-real-estate-tax", name: "종합부동산세법" },
  { id: "liquor-tax", name: "주세법" },
  { id: "securities-transaction-tax", name: "증권거래세법" },
  { id: "tax-offense-punishment", name: "조세범 처벌법" },
];

const ALL_LABOR_IDS = [
  ...AVAILABLE_LAWS.map((l) => l.id),
  ...COMPANY_REGULATIONS.map((r) => r.id),
];

export function LawSelectionModal({ isOpen, onClose, selectedLaws, onConfirm }: LawSelectionModalProps) {
  const [localSelectedLaws, setLocalSelectedLaws] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"tax" | "labor">("tax");

  // 팝업이 열릴 때마다 상위 selectedLaws와 동기화
  useEffect(() => {
    if (!isOpen) return;
    const laws = selectedLaws.length > 0 ? selectedLaws : AVAILABLE_LAWS.map((law) => law.id);
    setLocalSelectedLaws(laws.includes("labor-standards") ? laws : ["labor-standards", ...laws]);
    setSearchQuery("");
    setActiveTab("tax");
  }, [isOpen, selectedLaws]);

  if (!isOpen) return null;

  const q = searchQuery.toLowerCase();

  // 인사/노무 탭 항목
  const filteredLaws = AVAILABLE_LAWS.filter((law) => law.name.toLowerCase().includes(q));
  const filteredRegulations = COMPANY_REGULATIONS.filter(
    (reg) => reg.name.toLowerCase().includes(q) || reg.category.toLowerCase().includes(q)
  );
  // 세무/세법 탭 항목
  const filteredTaxLaws = TAX_LAWS.filter((law) => law.name.toLowerCase().includes(q));

  // 탭별 선택 개수
  const laborSelectedCount = localSelectedLaws.filter((id) => ALL_LABOR_IDS.includes(id)).length;
  const taxSelectedCount = localSelectedLaws.filter((id) => TAX_LAWS.some((t) => t.id === id)).length;
  const currentSelectedCount = activeTab === "tax" ? taxSelectedCount : laborSelectedCount;

  // 현재 탭에서 "전체" 토글 대상 (검색 필터 반영, 근로기준법 제외)
  const currentToggleableIds =
    activeTab === "tax"
      ? filteredTaxLaws.map((t) => t.id)
      : [
          ...filteredLaws.map((l) => l.id).filter((id) => id !== "labor-standards"),
          ...filteredRegulations.map((r) => r.id),
        ];

  const isAllSelected =
    currentToggleableIds.length > 0 &&
    currentToggleableIds.every((id) => localSelectedLaws.includes(id));

  const handleToggle = (lawId: string) => {
    if (lawId === "labor-standards") return;
    setLocalSelectedLaws((prev) =>
      prev.includes(lawId) ? prev.filter((id) => id !== lawId) : [...prev, lawId]
    );
  };

  const handleToggleAll = () => {
    if (isAllSelected) {
      setLocalSelectedLaws((prev) => prev.filter((id) => !currentToggleableIds.includes(id)));
    } else {
      setLocalSelectedLaws((prev) => [...new Set([...prev, ...currentToggleableIds])]);
    }
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

  // 체크박스 셀 렌더러
  const renderItem = (id: string, name: string, disabled = false) => (
    <label
      key={id}
      className={`flex items-center gap-2.5 py-2 rounded-lg transition-colors ${
        disabled ? "cursor-not-allowed opacity-70" : "hover:bg-muted/60 cursor-pointer"
      }`}
    >
      <Checkbox
        checked={localSelectedLaws.includes(id)}
        onCheckedChange={() => handleToggle(id)}
        disabled={disabled}
      />
      <span className="text-sm text-foreground flex-1" style={{ wordBreak: "keep-all" }}>
        {name}
      </span>
    </label>
  );

  const tabs: { id: "tax" | "labor"; label: string }[] = [
    { id: "tax", label: "세무 및 세법" },
    { id: "labor", label: "인사 및 노무" },
  ];

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-3xl shadow-2xl w-full max-w-2xl h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="px-8 py-6 flex-shrink-0">
          <div className="flex items-start justify-between mb-1">
            <h2 className="text-xl font-bold text-foreground">검색 대상 법령 선택</h2>
            <button
              onClick={handleCancel}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground">
            AI가 답변 생성 시 참조할 법령 범위를 지정하세요. (다중 선택 가능)
          </p>
        </div>

        {/* Segmented Tabs */}
        <div className="px-8 flex-shrink-0">
          <div className="flex p-1 rounded-xl bg-muted">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearchQuery("");
                }}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${
                  activeTab === tab.id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="px-8 pt-4 flex-shrink-0">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="검색어를 입력해주세요."
              className="w-full pl-4 pr-11 py-2.5 rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground placeholder:text-muted-foreground"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {/* Selected count */}
        <div className="px-8 pt-3 flex-shrink-0">
          <p className="text-xs font-semibold text-muted-foreground">
            총 {currentSelectedCount}개 선택됨
          </p>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-8 py-2">
          {activeTab === "tax" && (
            filteredTaxLaws.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-x-6">
                {/* 전체 토글 */}
                <label className="flex items-center gap-2.5 py-2 rounded-lg hover:bg-muted/60 cursor-pointer">
                  <Checkbox checked={isAllSelected} onCheckedChange={handleToggleAll} />
                  <span className="text-sm font-medium text-foreground">전체</span>
                </label>
                {filteredTaxLaws.map((law) => renderItem(law.id, law.name))}
              </div>
            )
          )}

          {activeTab === "labor" && (
            filteredLaws.length === 0 && filteredRegulations.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <p className="text-sm">검색 결과가 없습니다.</p>
              </div>
            ) : (
              <>
                {filteredLaws.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">법령</p>
                    <div className="grid grid-cols-2 gap-x-6">
                      {/* 전체 토글 */}
                      <label className="flex items-center gap-2.5 py-2 rounded-lg hover:bg-muted/60 cursor-pointer">
                        <Checkbox checked={isAllSelected} onCheckedChange={handleToggleAll} />
                        <span className="text-sm font-medium text-foreground">전체</span>
                      </label>
                      {filteredLaws.map((law) =>
                        renderItem(law.id, law.name, law.id === "labor-standards")
                      )}
                    </div>
                  </div>
                )}
                {filteredRegulations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 px-1">사규</p>
                    <div className="grid grid-cols-2 gap-x-6">
                      {filteredRegulations.map((reg) => renderItem(reg.id, reg.name))}
                    </div>
                  </div>
                )}
              </>
            )
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-border flex-shrink-0">
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-3 bg-card border border-border rounded-xl text-foreground hover:bg-muted transition-colors font-medium"
            >
              취소
            </button>
            <button
              onClick={handleApply}
              disabled={localSelectedLaws.length === 0}
              className="flex-1 px-4 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              선택 완료
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
