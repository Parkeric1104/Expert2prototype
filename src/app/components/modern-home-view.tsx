import { useState, useRef, useEffect } from "react";
import { CreditStatus } from "@/app/components/credit-status";
import {
  Paperclip, X, FileText, Info, ChevronDown, ArrowUp, ArrowRight,
  Plus, Check, Zap, FileEdit, ChevronLeft, ChevronRight, Settings2
} from "lucide-react";
import {
  Scale, Calendar, Clock, Shield, Users, Briefcase,
  BookOpen, Award, DollarSign, ClipboardCheck, UserCheck
} from "lucide-react";
import characterImg from "@/assets/ba68b3d133c0b0eab30536be7e6ef8ec6cdf174e.png";

interface ModernHomeViewProps {
  onStartChat: (query: string, selectedLaws: string[], relatedLaws?: string[], questionType?: string) => void;
  onOpenLawSelector: () => void;
  selectedLaws: string[];
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

const CATEGORIES = ["인사/노무", "소득세", "부가가치세", "원천세", "법인결산"];
const ITEMS_PER_PAGE = 3;

export function ModernHomeView({ onStartChat, onOpenLawSelector, selectedLaws }: ModernHomeViewProps) {
  const [inputValue, setInputValue]     = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isDragging, setIsDragging]     = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("인사/노무");
  const [currentPage, setCurrentPage]   = useState(1);

  const fileInputRef    = useRef<HTMLInputElement>(null);

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".pdf"))  return "📄";
    if (fileName.endsWith(".docx")) return "📝";
    if (fileName.endsWith(".hwp"))  return "📋";
    return "📎";
  };

  const prompts = [
    // ── 인사/노무 ──
    { text: "근로자의 개별 동의를 받거나, 연차대체를 취업규칙에 규정하여 근로자의 과반수 동의를 얻어 변경한 경우 근로자대표와의 별도 서면합의가 없어도 되나요?", questionType: "normal",       category: "인사/노무",   laws: ["근로기준법 제62조", "근로기준법 제93조"] },
    { text: "연차촉진제를 실시했음에도 불구하고 근로자가 지정된 휴가일에 출근하는 경우는 어떻게 되나요?",                                                               questionType: "normal",       category: "인사/노무",   laws: ["근로기준법 제61조", "근로기준법 제60조"] },
    { text: "포괄임금제와 고정OT제는 어떻게 다른가요?",                                                                                                              questionType: "simple",       category: "인사/노무",   laws: ["근로기준법 제17조", "근로기준법 제56조"] },
    { text: "연차 사용 시 회사가 사용 사유를 물어봐도 되나요?",                                                                                                       questionType: "simple",       category: "인사/노무",   laws: ["근로기준법 제60조", "근로기준법 시행령 제30조"] },
    { text: "점심시간에 회사 구내식당으로 이동 중 넘어져 발목을 다쳤어요. 산재 인정될까요?",                                                                              questionType: "normal",       category: "인사/노무",   laws: ["산업재해보상보험법 제37조", "대법원 2017두74719 판결"] },
    { text: "직원을 해고하지 않고 스스로 나가게 만드는 방법이 있을까요?",                                                                                               questionType: "inappropriate", category: "인사/노무",   laws: ["근로기준법 제23조", "근로기준법 제76조"] },
    // ── 소득세 ──
    { text: "배우자 명의 주택을 담보로 제가 대출받았는데 장기주택저당차입금 이자상환액 소득공제 받을 수 있나요?", questionType: "normal", category: "소득세",    laws: ["소득세법 제52조", "소득세법 시행령 제111조"] },
    { text: "연말정산 시 부양가족 기본공제 요건이 어떻게 되나요?",                                           questionType: "normal", category: "소득세",    laws: ["소득세법 제50조", "소득세법 시행령 제106조"] },
    { text: "프리랜서로 활동 중인데 종합소득세 신고 대상에 해당하나요?",                                       questionType: "normal", category: "소득세",    laws: ["소득세법 제14조", "소득세법 제70조"] },
    { text: "퇴직소득세 계산 방법과 근로소득세와의 차이점이 궁금합니다.",                                       questionType: "normal", category: "소득세",    laws: ["소득세법 제22조", "소득세법 제48조"] },
    // ── 부가가치세 ──
    { text: "음식점을 운영하는데 매입세액공제를 최대한 받으려면 어떻게 해야 하나요?",     questionType: "normal", category: "부가가치세", laws: ["부가가치세법 제38조", "부가가치세법 제39조"] },
    { text: "수출 시 영세율 적용을 받으려면 어떤 서류가 필요한가요?",                   questionType: "normal", category: "부가가치세", laws: ["부가가치세법 제21조", "부가가치세법 시행령 제64조"] },
    { text: "간이과세자에서 일반과세자로 전환되면 어떻게 처리해야 하나요?",               questionType: "normal", category: "부가가치세", laws: ["부가가치세법 제61조", "부가가치세법 제62조"] },
    // ── 원천세 ──
    { text: "프리랜서 강사에게 강의료를 지급할 때 원천징수 세율이 얼마인가요?",          questionType: "normal", category: "원천세",    laws: ["소득세법 제127조", "소득세법 제129조"] },
    { text: "일용근로자와 상용근로자의 원천징수 방법이 어떻게 다른가요?",                questionType: "normal", category: "원천세",    laws: ["소득세법 제134조", "소득세법 제127조"] },
    { text: "퇴직금 지급 시 원천징수는 어떻게 처리하나요?",                            questionType: "normal", category: "원천세",    laws: ["소득세법 제148조", "소득세법 제22조"] },
    // ── 법인결산 ──
    { text: "법인의 접대비 손금산입 한도는 얼마인가요?",                               questionType: "normal", category: "법인결산",  laws: ["법인세법 제25조", "법인세법 시행령 제41조"] },
    { text: "업무용 승용차 비용 처리 한도와 요건이 어떻게 되나요?",                     questionType: "normal", category: "법인결산",  laws: ["법인세법 제27조의2", "법인세법 시행령 제50조의2"] },
    { text: "대표이사 급여를 손금으로 인정받으려면 어떤 요건이 필요한가요?",              questionType: "normal", category: "법인결산",  laws: ["법인세법 제26조", "법인세법 시행령 제43조"] },
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

  const handlePromptClick = (text: string, laws: string[], questionType: string) =>
    onStartChat(text, selectedLaws, laws, questionType);

  return (
    <div className="flex-1 flex items-start justify-center px-6 relative overflow-y-auto">

      <div className="absolute bottom-6 left-6 z-20"><CreditStatus /></div>
      <div className="absolute bottom-4 right-0 left-0 z-20">
        <p className="text-center text-xs text-muted-foreground/60">
          AI 답변은 참고용이며 법적 효력이 없습니다. 최종 의사결정 시 반드시 전문가의 확인을 거치시기 바랍니다.
        </p>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="w-full max-w-[760px] flex flex-col items-center gap-7 relative z-10 pt-12 pb-16">

        {/* 아바타 + 인삿말 */}
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="w-[96px] h-[96px] rounded-full bg-primary/10 flex items-center justify-center shadow-sm overflow-hidden">
            <img src={characterImg} alt="세법/노무도우미" className="w-full h-full object-cover" />
          </div>
          <div className="space-y-1.5">
            <p className="text-[22px] leading-snug text-foreground">
              안녕하세요, <span className="font-bold">세법/노무도우미</span> 입니다.
            </p>
            <p className="text-[22px] leading-snug text-foreground" style={{ wordBreak: "keep-all" }}>
              복잡하고 까다로운 세법,노무 문제로 고민이신가요? 저에게 편하게 질문해 주세요.
            </p>
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

            {/* 좌: 법령 선택 */}
            <button
              onClick={onOpenLawSelector}
              className="h-8 flex items-center gap-1.5 px-3 rounded-full text-sm text-foreground/80 hover:text-foreground hover:bg-muted/70 transition-colors whitespace-nowrap flex-shrink-0"
            >
              <Settings2 className="w-4 h-4" />
              <span>{selectedLaws.length === 0 || selectedLaws.length === 15 ? "전체" : `${selectedLaws.length}개 법령`}</span>
            </button>

            {/* 파일 칩 (첨부 시) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.hwp"
              className="hidden"
              multiple
            />
            {uploadedFiles.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap">
                {uploadedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-primary/8 border border-primary/20 rounded-lg flex-shrink-0"
                  >
                    <span className="text-xs">{getFileIcon(file.name)}</span>
                    <span className="text-xs font-medium text-foreground truncate max-w-[80px]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(idx)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex-1" />

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
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-bold text-foreground whitespace-nowrap">이런 질문도 있어요</span>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map(cat => (
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
            {paginatedPrompts.map((prompt, idx) => (
              <button
                key={`${selectedCategory}-${currentPage}-${idx}`}
                onClick={() => handlePromptClick(prompt.text, prompt.laws, prompt.questionType)}
                className="flex items-center justify-between w-full px-5 py-4 bg-card border border-border/60 rounded-xl hover:border-primary/40 hover:bg-primary/5 transition-all text-left group"
              >
                <span className="text-sm text-foreground leading-snug">{prompt.text}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary flex-shrink-0 ml-4 transition-colors" />
              </button>
            ))}
          </div>
        </div>

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
