import { useState, useRef, useEffect } from "react";
import { CreditStatus } from "@/app/components/credit-status";
import { AVAILABLE_LAWS } from "@/app/components/law-selection-modal";
import {
  Paperclip, X, FileText, Info, ChevronDown, ArrowUp, ArrowRight,
  Plus, Check, Zap, FileEdit, ChevronLeft, ChevronRight, Settings2, Sparkles, Search, MoreHorizontal
} from "lucide-react";
import {
  Scale, Calendar, Clock, Shield, Users, Briefcase,
  BookOpen, Award, DollarSign, ClipboardCheck, UserCheck
} from "lucide-react";
import characterImg from "@/assets/dobi-welcome.png";
import {
  PolicyRegisterInlineCTA,
  POLICY_NUDGE_PENDING_KEY,
  POLICY_NUDGE_DISMISS_KEY,
  POLICY_NUDGE_TITLE_KEY,
} from "@/app/components/policy-register-inline-cta";

interface ModernHomeViewProps {
  onStartChat: (query: string, selectedLaws: string[], relatedLaws?: string[], questionType?: string, contextType?: string) => void;
  onOpenLawSelector: () => void;
  selectedLaws: string[];
  onClearLaws?: () => void; // 'N개 법령' 칩 X → 전체(선택 해제)
  onOpenPolicyManagement?: () => void; // 미등록 넛지 배너 → 정책 문서 관리 진입
}

const FLOATING_ICONS = [
  { Icon: Scale,        delay: 0,   duration: 20, x: "8%",  y: "8%",  size: 48, opacity: 0.15 },
  { Icon: FileText,     delay: 2,   duration: 18, x: "88%", y: "12%", size: 56, opacity: 0.12 },
  { Icon: Calendar,     delay: 4,   duration: 22, x: "5%",  y: "82%", size: 52, opacity: 0.10 },
  { Icon: Clock,        delay: 1,   duration: 19, x: "92%", y: "85%", size: 44, opacity: 0.13 },
  { Icon: Shield,       delay: 3,   duration: 21, x: "3%",  y: "35%", size: 60, opacity: 0.08 },
  { Icon: Users,        delay: 5,   duration: 17, x: "95%", y: "40%", size: 50, opacity: 0.11 },
  { Icon: Briefcase,    delay: 2.5, duration: 20, x: "18%", y: "18%", size: 46, opacity: 0.14 },
  { Icon: BookOpen,     delay: 4.5, duration: 18, x: "80%", y: "25%", size: 54, opacity: 0.09 },
  { Icon: Award,        delay: 1.5, duration: 19, x: "15%", y: "65%", size: 48, opacity: 0.12 },
  { Icon: DollarSign,   delay: 3.5, duration: 21, x: "82%", y: "68%", size: 52, opacity: 0.10 },
  { Icon: ClipboardCheck, delay: 0.5, duration: 22, x: "50%", y: "5%", size: 50, opacity: 0.13 },
  { Icon: UserCheck,    delay: 4,   duration: 20, x: "48%", y: "92%", size: 46, opacity: 0.11 },
];

// 홈 추천질문 — 디자인 정합: 상위 탭(연말정산/세법질의/법률/근로계약) → 하위 칩 → 질문
const LABOR_CHIPS = ["근로계약", "취업규칙", "인사관리", "모성보호", "임금", "휴일·휴가", "근로시간"];
const HOME_TABS = ["연말정산", "세법질의", "법률", "근로계약"];
const TAB_CHIPS: Record<string, string[]> = {
  "연말정산": ["기본공제소득", "근태수당", "해외근로", "복리·현물", "부양보험", "이자공제", "기부공제", "월세카드"],
  "세법질의": ["부가가치세", "소득세", "법인세", "양도세"],
  "법률": ["계약·약정", "분쟁·소송", "손해배상"],
  "근로계약": LABOR_CHIPS,
};
const ITEMS_PER_PAGE = 4;

export function ModernHomeView({ onStartChat, onOpenLawSelector, selectedLaws, onClearLaws, onOpenPolicyManagement }: ModernHomeViewProps) {
  const [inputValue, setInputValue]     = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isDragging, setIsDragging]     = useState(false);
  const [selectedTab, setSelectedTab]   = useState("연말정산");
  const [selectedCategory, setSelectedCategory] = useState("기본공제소득");
  const [currentPage, setCurrentPage]   = useState(1);
  const [showAttachList, setShowAttachList] = useState(false); // 첨부 '더보기' 팝오버

  // 탭 전환 시 해당 탭의 첫 칩으로 리셋
  const handleSelectTab = (tab: string) => {
    setSelectedTab(tab);
    setSelectedCategory(TAB_CHIPS[tab][0]);
    setCurrentPage(1);
  };

  // 미등록 순간 유도 넛지 (이력 기반): 사규 관련 노무 세션 발생 + '다시 안 보기' 안 함 → 노출
  const [showPolicyNudge, setShowPolicyNudge] = useState<boolean>(
    () =>
      typeof window !== "undefined" &&
      localStorage.getItem(POLICY_NUDGE_PENDING_KEY) === "1" &&
      localStorage.getItem(POLICY_NUDGE_DISMISS_KEY) !== "1"
  );
  // 직전 노무 질문 요약 타이틀(초개인화 문구용)
  const [policyNudgeTitle] = useState<string>(
    () => (typeof window !== "undefined" ? localStorage.getItem(POLICY_NUDGE_TITLE_KEY) ?? "" : "")
  );

  const fileInputRef    = useRef<HTMLInputElement>(null);

  // 파일 유형별 아이콘 색상 (디자인: PDF 빨강 / Word 파랑 / HWP 스카이)
  const getFileIconColor = (fileName: string) => {
    if (fileName.endsWith(".pdf"))  return "text-red-500";
    if (fileName.endsWith(".docx")) return "text-blue-600";
    if (fileName.endsWith(".hwp"))  return "text-sky-500";
    return "text-muted-foreground";
  };

  const prompts: Array<{ text: string; questionType: string; category: string; laws: string[]; contextType?: "single" | "multi" }> = [
    // ── 근로계약 (프로세스 유형 분류: 유형1~4) ──
    // 유형1 간단·단일맥락 → 멀티턴 후 즉시 의견서 작성
    { text: "위탁계약·프리랜서계약도 노동법의 보호를 받나요?",                                    questionType: "normal",   category: "근로계약",  laws: ["근로기준법 제2조", "대법원 2004다29736 판결"], contextType: "single" },
    // 유형2 간단·다중맥락 → 멀티턴 후 주제 선택 팝업
    { text: "근로계약서를 작성할 때 꼭 챙겨야 할 내용은 무엇인가요?",                              questionType: "normal",   category: "근로계약",  laws: ["근로기준법 제17조"], contextType: "multi" },
    // 유형3 상세·단일맥락 → 멀티턴 후 즉시 의견서 작성
    { text: "퇴직 후 동종업체 취업을 금지하는 전직금지약정도 효력이 있나요? (상세답변)",            questionType: "detailed", category: "근로계약",  laws: ["근로기준법 제15조"], contextType: "single" },
    // 유형4 상세·다중맥락 → 멀티턴 후 주제 선택 팝업
    { text: "기간제 근로계약을 반복 갱신하면 무기계약직으로 전환되나요? (상세답변)",                questionType: "detailed", category: "근로계약",  laws: ["기간제법 제4조", "대법원 2011두12528 판결"], contextType: "multi" },
    // ── 취업규칙 ──
    { text: "취업규칙과 근로계약의 내용이 다르면 어느 것이 우선하나요?",                           questionType: "normal",   category: "취업규칙",  laws: ["근로기준법 제97조"] },
    { text: "3년 전에 발생한 일을 이제 와서 징계할 수 있나요?",                                   questionType: "normal",   category: "취업규칙",  laws: ["근로기준법 제23조"] },
    { text: "동일한 사유를 당연퇴직·징계로 중복 규정한 경우 어느 것을 적용하나요? (상세답변)",      questionType: "detailed", category: "취업규칙",  laws: ["근로기준법 제93조"] },
    // ── 인사관리 ──
    { text: "수습 3개월 만에 해고 통보를 받았어요. 정당한가요?",                                  questionType: "normal",   category: "인사관리",  laws: ["근로기준법 제23조", "근로기준법 제35조"] },
    { text: "저성과자라는 이유로 해고할 수 있나요?",                                              questionType: "normal",   category: "인사관리",  laws: ["근로기준법 제23조"] },
    { text: "해고예고수당은 얼마나 받을 수 있나요? (상세답변)",                                   questionType: "detailed", category: "인사관리",  laws: ["근로기준법 제26조"] },
    // ── 모성보호 ──
    { text: "육아휴직 복직 후 다른 부서로 발령내도 되나요?",                                      questionType: "normal",   category: "모성보호",  laws: ["남녀고용평등법 제19조"] },
    { text: "육아휴직을 신청했다는 이유로 근로자를 해고할 수 있나요?",                              questionType: "normal",   category: "모성보호",  laws: ["남녀고용평등법 제19조"] },
    { text: "회사 사정으로 그만뒀는데 실업급여를 받을 수 있나요? (상세답변)",                      questionType: "detailed", category: "모성보호",  laws: ["고용보험법 제40조"] },
    // ── 임금 ──
    { text: "임금을 받지 못했어요. 임금체불로 신고하면 어떻게 처리되나요?",                        questionType: "normal",   category: "임금",      laws: ["근로기준법 제36조", "근로기준법 제43조"] },
    { text: "연장·휴일·야간근로수당은 어떻게 계산하나요? (상세답변)",                             questionType: "detailed", category: "임금",      laws: ["근로기준법 제56조"] },
    { text: "회사가 폐업했는데 밀린 임금·퇴직금은 어떻게 받을 수 있나요?",                        questionType: "normal",   category: "임금",      laws: ["임금채권보장법 제7조"] },
    // ── 휴일·휴가 ──
    { text: "1년 근무 후 퇴직하면 연차 미사용수당은 며칠분을 받나요? (상세답변)",                  questionType: "detailed", category: "휴일·휴가", laws: ["근로기준법 제60조"] },
    { text: "지각·조퇴를 3회 이상 하면 주휴수당을 받을 수 없나요?",                               questionType: "normal",   category: "휴일·휴가", laws: ["근로기준법 제55조"] },
    { text: "휴일에 근무하고 다른 날 쉬면 휴일근로수당을 받을 수 있나요?",                         questionType: "normal",   category: "휴일·휴가", laws: ["근로기준법 제55조", "근로기준법 제56조"] },
    // ── 근로시간 ──
    { text: "포괄임금제라 야근해도 별도의 추가수당이 없나요? (상세답변)",                          questionType: "detailed", category: "근로시간",  laws: ["근로기준법 제56조"] },
    { text: "연장근로는 1주 12시간을 초과할 수 없다는데 어떻게 판단하나요?",                       questionType: "normal",   category: "근로시간",  laws: ["근로기준법 제53조"] },
    { text: "단시간근로자가 약정시간을 초과해 근무하면 가산수당을 받나요?",                        questionType: "normal",   category: "근로시간",  laws: ["기간제 및 단시간근로자 보호법 제6조", "근로기준법 제56조"] },
    // ── 연말정산 (세법) — 디자인 정합 ──
    { text: "부가가치세는 언제 신고하나요?",                                                     questionType: "normal",   category: "기본공제소득", laws: ["부가가치세법 제49조"] },
    { text: "사업자 등록 후 첫 세금 신고는 어떻게 하나요?",                                        questionType: "normal",   category: "기본공제소득", laws: ["소득세법 제168조"] },
    { text: "간이과세자와 일반 과세자의 차이는 무엇인가요?",                                       questionType: "normal",   category: "기본공제소득", laws: ["부가가치세법 제61조"] },
    // ── 세법질의 (대표 샘플) ──
    { text: "부가가치세 매입세액 공제는 어떤 경우에 받을 수 있나요?",                              questionType: "normal",   category: "부가가치세", laws: ["부가가치세법 제38조"] },
    { text: "종합소득세와 근로소득세는 어떻게 다른가요?",                                          questionType: "normal",   category: "소득세",     laws: ["소득세법 제14조"] },
    // ── 법률 (대표 샘플) ──
    { text: "계약서에 없는 구두 약정도 법적 효력이 있나요?",                                       questionType: "normal",   category: "계약·약정",  laws: ["민법 제105조"] },
    { text: "손해배상 청구는 어떤 요건을 갖춰야 하나요?",                                          questionType: "normal",   category: "손해배상",   laws: ["민법 제750조"] },
  ];

  const filteredPrompts  = prompts.filter(p => p.category === selectedCategory);
  const totalPages       = Math.ceil(filteredPrompts.length / ITEMS_PER_PAGE);
  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleCategoryChange = (cat: string) => { setSelectedCategory(cat); setCurrentPage(1); };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/x-hwp",
      "application/haansofthwp",
    ];
    const validFiles: { name: string; size: number }[] = [];
    for (const file of files) {
      if (!allowedTypes.includes(file.type) && !file.name.endsWith(".hwp")) {
        alert("지원되지 않는 파일 형식입니다. PDF, DOCX, HWP 파일만 업로드 가능합니다.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert(`파일 크기는 10MB 이하만 가능합니다. (${file.name})`);
        return;
      }
      if (uploadedFiles.length + validFiles.length >= 5) {
        alert("최대 5개 파일까지만 첨부 가능합니다.");
        return;
      }
      validFiles.push({ name: file.name, size: file.size });
    }
    setUploadedFiles([...uploadedFiles, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragOver  = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setIsDragging(false); };
  const handleDrop      = (e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    const dt = new DataTransfer();
    for (let i = 0; i < files.length; i++) dt.items.add(files[i]);
    const input = fileInputRef.current;
    if (input) {
      input.files = dt.files;
      handleFileUpload({ target: input } as any);
    }
  };

  const handleRemoveFile = (idx: number) => setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx));

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;
    onStartChat(inputValue, selectedLaws, undefined, undefined);
    setInputValue("");
    setUploadedFiles([]);
  };

  const handlePromptClick = (text: string, laws: string[], questionType: string, contextType?: string) =>
    onStartChat(text, selectedLaws, laws, questionType, contextType);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">

      <div className="absolute bottom-5 left-6 z-30"><CreditStatus /></div>

      {/* 스크롤 영역 — 콘텐츠 좌우 패딩 36px (디자인 정합) */}
      <div className="flex-1 min-h-0 w-full flex items-start justify-center px-9 overflow-y-auto">

      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-[760px] flex flex-col items-stretch gap-7 relative z-10 pt-12 pb-6">

        {/* 인삿말(좌) + 캐릭터(우) — 디자인 정합(좌측 정렬, 캐릭터 우측) */}
        <div className="w-full flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <p className="text-[22px] leading-snug text-foreground">
              안녕하세요, <span className="font-bold">세법/노무도우미</span> 입니다.
            </p>
            <p className="text-[22px] leading-snug text-foreground" style={{ wordBreak: "keep-all" }}>
              복잡하고 까다로운 세법과 노무 문제, 무엇이든 물어보세요.
            </p>
          </div>
          <div className="w-[76px] h-[76px] flex-shrink-0 overflow-hidden">
            <img src={characterImg} alt="세법/노무도우미" className="w-full h-full object-contain" />
          </div>
        </div>

        {/* 입력 카드 */}
        <div
          className={`w-full bg-card border rounded-2xl shadow-sm transition-all relative ${
            isDragging ? "border-primary bg-primary/5 scale-[1.01] shadow-md" : "border-border/60"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl border-2 border-primary border-dashed">
              <div className="flex flex-col items-center gap-2">
                <Paperclip className="w-8 h-8 text-primary animate-bounce" />
                <p className="text-sm font-semibold text-primary">파일을 여기에 놓으세요</p>
              </div>
            </div>
          )}

          {/* 텍스트 입력 */}
          <textarea
            placeholder="궁금한 점을 편하게 작성해 주세요."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            rows={1}
            className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none overflow-y-auto px-5 pt-4 pb-2"
            style={{ minHeight: "52px", maxHeight: "120px" }}
            onInput={e => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />

          {/* ── 툴바 ── */}
          <div className="flex items-center gap-1.5 px-3 pb-3 pt-1 min-h-[44px]">

            {/* 좌: 법령 선택 — 전체(pill) / N개 법령(제거 칩) */}
            {selectedLaws.length === 0 || selectedLaws.length === AVAILABLE_LAWS.length ? (
              <button
                onClick={onOpenLawSelector}
                className="h-8 flex items-center gap-1.5 px-3 rounded-full text-sm text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors whitespace-nowrap flex-shrink-0"
              >
                <Settings2 className="w-4 h-4" />
                <span>전체</span>
              </button>
            ) : (
              <div className="h-8 inline-flex items-center gap-1 pl-2.5 pr-1 rounded-full bg-primary/8 border border-primary/20 flex-shrink-0">
                <button onClick={onOpenLawSelector} className="inline-flex items-center gap-1.5 text-sm text-primary">
                  <Scale className="w-3.5 h-3.5" />
                  <span className="font-medium whitespace-nowrap">{selectedLaws.length}개 법령</span>
                </button>
                <button
                  type="button"
                  onClick={() => onClearLaws?.()}
                  aria-label="법령 선택 해제"
                  className="w-5 h-5 rounded-full flex items-center justify-center text-primary/70 hover:text-primary hover:bg-primary/15 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* 구분선 (법령 ↔ 파일칩) */}
            {uploadedFiles.length > 0 && <span className="w-px h-5 bg-border mx-0.5 flex-shrink-0" />}

            {/* 파일 칩 (첨부 시) — 색상 아이콘 + X, 3개 초과 시 ⋯ */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.hwp"
              className="hidden"
              multiple
            />
            {/* 파일 칩 영역 — flex-1 폭 제한(min-w-0) + overflow-hidden 으로 우측 버튼과 절대 겹치지 않음.
                파일 없으면 빈 flex-1 = 스페이서. 최대 2개 노출, 초과분은 '더보기(⋯)' 팝오버 */}
            <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-hidden">
              {uploadedFiles.slice(0, 2).map((file, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1.5 h-8 pl-2 pr-1.5 bg-card border border-border rounded-lg flex-shrink-0"
                >
                  <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${getFileIconColor(file.name)}`} />
                  <span className="text-xs font-medium text-foreground truncate max-w-[110px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    aria-label="첨부 제거"
                    className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* 더보기(⋯) — 파일첨부 버튼 앞. 3개 이상일 때 전체 첨부 목록 팝오버 */}
            {uploadedFiles.length > 2 && (
              <div className="relative flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setShowAttachList((v) => !v)}
                  aria-label="첨부 더보기"
                  className="h-9 w-9 rounded-full border border-border bg-card text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                {showAttachList && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowAttachList(false)} />
                    <div className="absolute bottom-full right-0 mb-2 w-64 bg-card border border-border rounded-xl shadow-xl p-2 z-50">
                      <p className="text-xs font-semibold text-foreground px-2 py-1.5">첨부자료 {uploadedFiles.length}</p>
                      <div className="max-h-56 overflow-y-auto">
                        {uploadedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-muted/50">
                            <FileText className={`w-4 h-4 flex-shrink-0 ${getFileIconColor(file.name)}`} />
                            <span className="text-xs text-foreground truncate flex-1" title={file.name}>{file.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveFile(idx)}
                              aria-label="첨부 제거"
                              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 우: 파일 첨부 (아이콘) */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              aria-label="파일 첨부"
              className="h-9 w-9 rounded-full border border-border bg-card text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* 우: 전송 */}
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              aria-label="질문 보내기"
              className="h-9 w-9 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:bg-muted disabled:text-muted-foreground/50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>

          {/* 미등록 순간 유도 힌트 — 입력 카드 하단에 통합된 섹션(더블박스) */}
          {showPolicyNudge && (
            <PolicyRegisterInlineCTA
              historyTitle={policyNudgeTitle || undefined}
              onRegister={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem(POLICY_NUDGE_PENDING_KEY);
                  localStorage.removeItem(POLICY_NUDGE_TITLE_KEY);
                }
                setShowPolicyNudge(false);
                onOpenPolicyManagement?.();
              }}
              onDismiss={() => {
                if (typeof window !== "undefined") localStorage.setItem(POLICY_NUDGE_DISMISS_KEY, "1");
                setShowPolicyNudge(false);
              }}
            />
          )}
        </div>

        {/* 노무 라우팅 안내 (파일 첨부 시) */}
        {uploadedFiles.length > 0 && (
          <div className="w-full flex items-center gap-1.5 px-1 -mt-3">
            <Info className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
            <p className="text-xs text-muted-foreground/80">
              파일 첨부 시 노무 관련 질문으로 분류됩니다. 세법 관련 질문은 파일을 제거한 후 질문해 주세요.
            </p>
          </div>
        )}

        {/* 추천 질문 */}
        <div className="w-full flex flex-col gap-4">
          {/* 라벨(독립 줄) — 디자인 정합 */}
          <span className="text-sm font-bold text-foreground flex items-center gap-1"><Sparkles className="w-4 h-4 text-primary" />이런 질문으로 시작해보세요</span>

          {/* 탭 행(전체 너비 구분선) */}
          <div className="flex items-center gap-4 border-b border-border/60 -mt-1">
            {HOME_TABS.map(tab => (
              <button
                key={tab}
                onClick={() => handleSelectTab(tab)}
                className={`pb-2.5 -mb-px text-sm border-b-2 transition-colors ${
                  selectedTab === tab
                    ? "font-bold text-foreground border-primary"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* 하위 카테고리 칩 */}
          <div className="flex gap-1.5 flex-wrap">
            {TAB_CHIPS[selectedTab].map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-card text-foreground border border-border/60 hover:border-primary/40"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="w-full flex items-center gap-5 px-4 py-1.5 rounded-full bg-indigo-200/40 -mt-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  aria-label={`${page}페이지`}
                  className={`text-xs font-medium transition-colors ${
                    currentPage === page
                      ? "text-primary font-semibold"
                      : "text-muted-foreground/60 hover:text-muted-foreground"
                  }`}
                >
                  • {page}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-2">
            {paginatedPrompts.map((prompt, idx) => {
              const detailedSuffix = " (상세답변)";
              const isDetailed = prompt.text.endsWith(detailedSuffix);
              const displayText = isDetailed ? prompt.text.slice(0, -detailedSuffix.length) : prompt.text;
              // 프로세스 유형 라벨: "{답변유형} - {맥락수}" (예: 간단답변 - 단일맥락)
              const processLabel = prompt.contextType
                ? `${prompt.questionType === "detailed" ? "상세답변" : "간단답변"} - ${prompt.contextType === "single" ? "단일맥락" : "다중맥락"}`
                : undefined;
              return (
                <button
                  key={`${selectedCategory}-${currentPage}-${idx}`}
                  onClick={() => handlePromptClick(prompt.text, prompt.laws, prompt.questionType, prompt.contextType)}
                  className="flex items-center gap-3 w-full px-2 py-3.5 rounded-lg hover:bg-muted/40 transition-colors text-left group"
                >
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <span className="flex-1 text-sm text-foreground leading-snug">
                    {displayText}
                    {isDetailed && !processLabel && (
                      <span className="ml-1.5 text-[11px] font-medium text-primary/60 align-middle">(상세답변)</span>
                    )}
                    {processLabel && (
                      <span className="ml-1.5 text-[11px] font-medium text-primary/60 align-middle">({processLabel})</span>
                    )}
                  </span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        </div>

      </div>
      </div>{/* /스크롤 영역 */}

      {/* 하단 안내문 (스크롤 영역 밖 푸터 — 콘텐츠와 겹치지 않음) */}
      <div className="shrink-0 px-6 pb-4 pt-1 relative z-20">
        <p className="text-center text-xs text-muted-foreground/60">
          AI 답변은 참고용이며 법적 효력이 없습니다. 최종 의사결정 시 반드시 전문가의 확인을 거치시기 바랍니다.
        </p>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25%       { transform: translateY(-20px) rotate(5deg); }
          50%       { transform: translateY(-10px) rotate(-5deg); }
          75%       { transform: translateY(-15px) rotate(3deg); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        textarea::-webkit-scrollbar       { width: 6px; }
        textarea::-webkit-scrollbar-track { background: transparent; }
        textarea::-webkit-scrollbar-thumb { background: rgba(99,102,241,.3); border-radius: 3px; }
        textarea::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,.5); }
        textarea { scrollbar-width: thin; scrollbar-color: rgba(99,102,241,.3) transparent; }
      `}</style>
    </div>
  );
}
