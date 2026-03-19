import { useState } from "react";
import { Search, X, FolderOpen, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs";

interface AIBox {
  id: string;
  name: string;
  registrant: string;
  tags: string[];
}

interface AIBoxSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedBoxes: AIBox[]) => void;
}


export function AIBoxSelectionModal({
  isOpen,
  onClose,
  onSelect,
}: AIBoxSelectionModalProps) {
  const [activeTab, setActiveTab] = useState<"my" | "shared" | "favorite">("my");
  const [searchType, setSearchType] = useState<string>("이름");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBox, setSelectedBox] = useState<AIBox | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Mock data - 실로는 API에서 가옴
  const myBoxes: AIBox[] = [
    { id: "m1", name: "HR 정책 Box", registrant: "김인사", tags: ["인사", "복리후생"] },
    { id: "m2", name: "노무 규정 Box", registrant: "이노무", tags: ["노무", "근로기준"] },
    { id: "m3", name: "복리후생 안내서", registrant: "김인사", tags: ["복리후생", "직원혜택"] },
    { id: "m4", name: "퇴직금 계산 가이드", registrant: "박재무", tags: ["퇴직금", "정산"] },
    { id: "m5", name: "휴가 관리 규정", registrant: "이노무", tags: ["휴가", "연차"] },
    { id: "m6", name: "재택근무 지침서", registrant: "김인사", tags: ["재택근무", "원격"] },
    { id: "m7", name: "성과평가 매뉴얼", registrant: "최인사", tags: ["평가", "성과"] },
    { id: "m8", name: "교육훈련 프로그램", registrant: "김인사", tags: ["교육", "훈련"] },
    { id: "m9", name: "안전보건 규정집", registrant: "이안전", tags: ["안전", "보건"] },
    { id: "m10", name: "급여 지급 규정", registrant: "박재무", tags: ["급여", "임금"] },
    { id: "m11", name: "직급체계 안내서", registrant: "김인사", tags: ["직급", "승진"] },
    { id: "m12", name: "복무 규정집", registrant: "이노무", tags: ["복무", "근태"] },
    { id: "m13", name: "4대보험 가입 안내", registrant: "박재무", tags: ["보험", "사회보험"] },
    { id: "m14", name: "상벌 규정", registrant: "최인사", tags: ["상벌", "징계"] },
    { id: "m15", name: "출장비 지급 기준", registrant: "박재무", tags: ["출장", "경비"] },
  ];

  const sharedBoxes: AIBox[] = [
    { id: "s1", name: "2025년 당직일정 공지", registrant: "곽명호", tags: ["2025년 당직일정", "당직"] },
    { id: "s2", name: "AI 기능법(한국,EU 등) 및 가이드라인", registrant: "박현철", tags: ["인공지능기본법", "투명성의무", "생성형인공지능농"] },
    { id: "s3", name: "AI 연구자료", registrant: "임민정", tags: ["AI기반데이터법", "초고근무판도", "연차자동부여"] },
    { id: "s4", name: "Amaranth10 매뉴얼(관리모듈)", registrant: "전용기", tags: ["자금일보", "조회조건", "고정자산변동정보"] },
    { id: "s5", name: "Amaranth10 매뉴얼(기타모듈)", registrant: "전용기", tags: ["인사정보변경", "근태신청", "경비청구"] },
    { id: "s6", name: "Amaranth10 업데이트 기능", registrant: "임민지", tags: ["Amaranth10", "업데이트", "기능계획"] },
    { id: "s7", name: "ONE AI PLAYBOOK", registrant: "유동현", tags: ["AI활용가이드", "업무자동화", "생성형AI"] },
    { id: "s8", name: "2025년 법인세 신고 가이드", registrant: "김세무", tags: ["법인세", "세무신고", "2025년"] },
    { id: "s9", name: "개인정보보호법 준수사항", registrant: "이법무", tags: ["개인정보", "GDPR", "법률"] },
    { id: "s10", name: "그룹웨어 사용 매뉴얼", registrant: "박IT", tags: ["그룹웨어", "협업툴", "사용법"] },
    { id: "s11", name: "계약서 작성 가이드라인", registrant: "이법무", tags: ["계약서", "법률검토", "표준양식"] },
    { id: "s12", name: "ESG 경영 실천 방안", registrant: "최기획", tags: ["ESG", "지속가능경영", "친환경"] },
    { id: "s13", name: "신입사원 온보딩 체크리스트", registrant: "김인사", tags: ["온보딩", "신입교육", "OJT"] },
    { id: "s14", name: "재무제표 작성 실무", registrant: "박재무", tags: ["재무제표", "회계", "결산"] },
    { id: "s15", name: "마케팅 캠페인 기획서 템플릿", registrant: "정마케팅", tags: ["마케팅", "캠페인", "기획"] },
    { id: "s16", name: "영업관리 시스템 가이드", registrant: "최영업", tags: ["CRM", "영업", "고객관리"] },
    { id: "s17", name: "품질관리 매뉴얼 ISO 9001", registrant: "이품질", tags: ["품질", "ISO", "인증"] },
    { id: "s18", name: "공급망 관리 프로세스", registrant: "김SCM", tags: ["SCM", "공급망", "물류"] },
    { id: "s19", name: "디지털 전환 추진 계획서", registrant: "박DX", tags: ["DX", "디지털", "혁신"] },
    { id: "s20", name: "조직문화 개선 제안서", registrant: "최인사", tags: ["조직문화", "워라밸", "소통"] },
    { id: "s21", name: "보안정책 및 준수사항", registrant: "이보안", tags: ["보안", "정보보호", "준수사항"] },
    { id: "s22", name: "원가계산 실무 가이드", registrant: "박원가", tags: ["원가", "제조원가", "계산"] },
    { id: "s23", name: "프로젝트 관리 방법론", registrant: "김PM", tags: ["PM", "프로젝트", "애자일"] },
    { id: "s24", name: "고객만족도 조사 결과 분석", registrant: "정CS", tags: ["CS", "고객만족", "설문"] },
    { id: "s25", name: "위기관리 커뮤니케이션 매뉴얼", registrant: "최PR", tags: ["위기관리", "PR", "대응"] },
  ];

  const favoriteBoxes: AIBox[] = [
    { id: "f1", name: "자주 쓰는 근로계약서 양식", registrant: "김인사", tags: ["근로계약", "양식", "필수"] },
    { id: "f2", name: "연차촉 안내 템플릿", registrant: "이노무", tags: ["연차", "촉진", "통지"] },
    { id: "f3", name: "임금명세서 발급 규정", registrant: "박재무", tags: ["임금", "명세서", "급여"] },
    { id: "f4", name: "취업규칙 변경 절차", registrant: "이노무", tags: ["취업규칙", "변경", "절차"] },
    { id: "f5", name: "퇴사자 처리 체크리스트", registrant: "김인사", tags: ["퇴사", "오프보딩", "절차"] },
    { id: "f6", name: "AI 기능법(한국,EU 등) 및 가이드라인", registrant: "박현철", tags: ["인공지능기본법", "투명성의무"] },
    { id: "f7", name: "Amaranth10 매뉴얼(관리모듈)", registrant: "전용기", tags: ["자금일보", "조회조건"] },
    { id: "f8", name: "징계절차 가이드", registrant: "최인사", tags: ["징계", "절차", "노무"] },
    { id: "f9", name: "연장근로 신청서 양식", registrant: "이노무", tags: ["연장근로", "초과근무", "양식"] },
    { id: "f10", name: "직장 내 괴롭힘 예방지침", registrant: "김인사", tags: ["괴롭힘", "예방", "직장"] },
    { id: "f11", name: "육아휴직 신청 안내", registrant: "이노무", tags: ["육아휴직", "신청", "복직"] },
    { id: "f12", name: "경조사 휴가 규정", registrant: "김인사", tags: ["경조사", "휴가", "복리후생"] },
  ];

  const getCurrentBoxes = () => {
    switch (activeTab) {
      case "my":
        return myBoxes;
      case "shared":
        return sharedBoxes;
      case "favorite":
        return favoriteBoxes;
      default:
        return [];
    }
  };

  const filteredBoxes = getCurrentBoxes().filter((box) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    if (searchType === "이름") {
      return box.name.toLowerCase().includes(query);
    } else if (searchType === "등록자") {
      return box.registrant.toLowerCase().includes(query);
    } else if (searchType === "태그") {
      return box.tags.some(tag => tag.toLowerCase().includes(query));
    }
    return true;
  });

  const handleBoxSelect = (box: AIBox) => {
    setSelectedBox(prev => prev?.id === box.id ? null : box);
  };

  const handleConfirm = () => {
    onSelect(selectedBox ? [selectedBox] : []);
    onClose();
    setSelectedBox(null);
    setSearchQuery("");
  };

  const handleClose = () => {
    setSelectedBox(null);
    setSearchQuery("");
    setCurrentPage(1);
    onClose();
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab as any);
    setCurrentPage(1); // 탭 변경 시 첫 페이지로 리셋
  };

  const totalPages = Math.ceil(filteredBoxes.length / itemsPerPage);
  const currentBoxes = filteredBoxes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl h-[65vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="text-xl font-bold">AI Box 선택</DialogTitle>
          <DialogDescription className="sr-only">
            정책 문서와 연결할 AI Box를 선택하세요
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col min-h-0">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={handleTabChange} className="flex-1 flex flex-col min-h-0">
            <div className="flex-shrink-0 px-6">
              <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                <TabsTrigger 
                  value="my" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  내 AI Box
                </TabsTrigger>
                <TabsTrigger 
                  value="shared"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  공유 AI Box
                </TabsTrigger>
                <TabsTrigger 
                  value="favorite"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2"
                >
                  즐겨찾기
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Search */}
            <div className="py-3 px-6 flex gap-2 flex-shrink-0 border-b">
              <Select value={searchType} onValueChange={setSearchType}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="이름">이름</SelectItem>
                  <SelectItem value="등록자">등록자</SelectItem>
                  <SelectItem value="태그">태그</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex-1 relative">
                <Input
                  placeholder="검색어를 입력하세요."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            </div>

            <TabsContent value="my" className="flex-1 m-0 overflow-hidden flex flex-col">
              <div className="flex-1 overflow-hidden px-6 pt-4 pb-3">
                <AIBoxListWithCheckbox boxes={currentBoxes} onSelect={handleBoxSelect} selectedId={selectedBox?.id} />
              </div>
              {totalPages > 1 && (
                <div className="px-6 pb-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="shared" className="flex-1 overflow-hidden m-0 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden px-6 pt-4 pb-3">
                <AIBoxListWithCheckbox boxes={currentBoxes} onSelect={handleBoxSelect} selectedId={selectedBox?.id} />
              </div>
              {totalPages > 1 && (
                <div className="px-6 pb-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </TabsContent>
            <TabsContent value="favorite" className="flex-1 overflow-hidden m-0 flex flex-col min-h-0">
              <div className="flex-1 overflow-hidden px-6 pt-4 pb-3">
                <AIBoxListWithCheckbox boxes={currentBoxes} onSelect={handleBoxSelect} selectedId={selectedBox?.id} />
              </div>
              {totalPages > 1 && (
                <div className="px-6 pb-4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* 선택된 AI BOX 영역 */}
        <div className="px-6 py-4 border-t flex-shrink-0">
          <p className="text-sm font-semibold mb-2">선택된 AI BOX</p>
          {selectedBox ? (
            <div className="border rounded-lg flex items-center px-4 py-3 gap-3">
              <div className="w-5 h-5 bg-primary/20 rounded flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                </svg>
              </div>
              <span className="flex-1 text-sm">{selectedBox.name}</span>
              <span className="text-sm text-muted-foreground w-16">{selectedBox.registrant}</span>
              <button
                onClick={() => setSelectedBox(null)}
                className="text-destructive hover:text-destructive/70 transition-colors"
                aria-label="선택 해제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border rounded-lg px-4 py-3 text-sm text-muted-foreground">
              AI BOX를 선택해주세요.
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2 px-6 py-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            취소
          </Button>
          <Button onClick={handleConfirm} disabled={!selectedBox}>
            확인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AIBoxList({ 
  boxes, 
  onSelect, 
  selectedIds 
}: { 
  boxes: AIBox[]; 
  onSelect: (box: AIBox) => void; 
  selectedIds: string[];
}) {
  if (boxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
        <FolderOpen className="w-12 h-12 mb-3 opacity-30" />
        <p className="text-sm">등록된 AI Box가 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="flex items-center px-4 py-2 bg-muted border-b text-sm font-semibold">
        <span>• AI Box 목록</span>
      </div>
      <table className="w-full text-sm">
        <thead className="bg-muted/50 border-b">
          <tr>
            <th className="text-left px-4 py-2 font-semibold">이름</th>
            <th className="text-left px-4 py-2 font-semibold w-24">등록자</th>
          </tr>
        </thead>
        <tbody>
          {boxes.map((box) => {
            const isSelected = selectedIds.includes(box.id);
            return (
              <tr
                key={box.id}
                onClick={() => onSelect(box)}
                className={`border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-4 py-3">
                  <div className="break-words">{box.name}</div>
                </td>
                <td className="px-4 py-3 align-top w-24">
                  <div className="truncate" title={box.registrant}>{box.registrant}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AIBoxListWithCheckbox({
  boxes,
  onSelect,
  selectedId
}: {
  boxes: AIBox[];
  onSelect: (box: AIBox) => void;
  selectedId: string | undefined;
}) {
  if (boxes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-lg">
        <p className="text-sm">AI Box를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted border-b">
          <tr>
            <th className="w-12"></th>
            <th className="text-left px-4 py-2 font-semibold">이름</th>
            <th className="text-left px-4 py-2 font-semibold w-24">등록자</th>
          </tr>
        </thead>
        <tbody>
          {boxes.map((box) => {
            const isSelected = selectedId === box.id;
            return (
              <tr
                key={box.id}
                onClick={() => onSelect(box)}
                className={`border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors ${
                  isSelected ? "bg-primary/5" : ""
                }`}
              >
                <td className="px-4 py-3 align-middle">
                  <div className="flex items-center justify-center">
                    <div
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "border-primary" : "border-muted-foreground"
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <div className="w-4 h-4 bg-primary/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                      <svg className="w-3 h-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <div className="break-words flex-1">{box.name}</div>
                  </div>
                </td>
                <td className="px-4 py-3 align-top w-24">
                  <div className="truncate" title={box.registrant}>{box.registrant}</div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void; 
}) {
  const handlePrevPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // 페이지 번호 계산 (최대 10개)
  const getPageNumbers = () => {
    const pages: number[] = [];
    const maxVisible = 10;
    
    if (totalPages <= maxVisible) {
      // 전체 페이지가 10개 이하면 모두 표시
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 10개 이상일 경우
      if (currentPage <= 5) {
        // 현재 페이지가 1~5일 때: 1~10 표시
        for (let i = 1; i <= maxVisible; i++) {
          pages.push(i);
        }
      } else if (currentPage >= totalPages - 4) {
        // 현재 페이지가 끝에서 5페이지 이내일 때: 마지막 10개 표시
        for (let i = totalPages - maxVisible + 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 중간일 때: 현재 페이지를 중심으로 10개 표시
        for (let i = currentPage - 4; i <= currentPage + 5; i++) {
          pages.push(i);
        }
      }
    }
    
    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex items-center justify-center gap-0.5">
      <button
        className="p-1 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handlePrevPage}
        disabled={currentPage === 1}
        aria-label="이전 페이지"
      >
        <ChevronLeft className="w-3 h-3" />
      </button>
      
      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`min-w-[28px] h-7 px-2 text-xs border rounded transition-colors ${
            currentPage === page
              ? "bg-primary text-primary-foreground border-primary font-semibold"
              : "hover:bg-muted"
          }`}
        >
          {page}
        </button>
      ))}
      
      <button
        className="p-1 border rounded hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        onClick={handleNextPage}
        disabled={currentPage === totalPages}
        aria-label="다음 페이지"
      >
        <ChevronRight className="w-3 h-3" />
      </button>
    </div>
  );
}