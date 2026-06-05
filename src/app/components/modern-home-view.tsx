import { useState, useRef } from "react";
import { RotatingTitle } from "@/app/components/rotating-title";
import { CreditStatus } from "@/app/components/credit-status";
import { Paperclip, X, FileText, Info, ChevronDown, ArrowUp, ArrowRight } from "lucide-react";
import {
  Scale,
  Calendar,
  Clock,
  Shield,
  Users,
  Briefcase,
  BookOpen,
  Award,
  DollarSign,
  ClipboardCheck,
  UserCheck
} from "lucide-react";

interface ModernHomeViewProps {
  onStartChat: (query: string, selectedLaws: string[], relatedLaws?: string[], questionType?: string, chatMode?: "search" | "opinion") => void;
  onOpenLawSelector: () => void;
  selectedLaws: string[];
}

// 배경 아이콘 데이터 - 화면 전체에 넓게 분산
const FLOATING_ICONS = [
  { Icon: Scale, delay: 0, duration: 20, x: "8%", y: "8%", size: 48, opacity: 0.15 },
  { Icon: FileText, delay: 2, duration: 18, x: "88%", y: "12%", size: 56, opacity: 0.12 },
  { Icon: Calendar, delay: 4, duration: 22, x: "5%", y: "82%", size: 52, opacity: 0.1 },
  { Icon: Clock, delay: 1, duration: 19, x: "92%", y: "85%", size: 44, opacity: 0.13 },
  { Icon: Shield, delay: 3, duration: 21, x: "3%", y: "35%", size: 60, opacity: 0.08 },
  { Icon: Users, delay: 5, duration: 17, x: "95%", y: "40%", size: 50, opacity: 0.11 },
  { Icon: Briefcase, delay: 2.5, duration: 20, x: "18%", y: "18%", size: 46, opacity: 0.14 },
  { Icon: BookOpen, delay: 4.5, duration: 18, x: "80%", y: "25%", size: 54, opacity: 0.09 },
  { Icon: Award, delay: 1.5, duration: 19, x: "15%", y: "65%", size: 48, opacity: 0.12 },
  { Icon: DollarSign, delay: 3.5, duration: 21, x: "82%", y: "68%", size: 52, opacity: 0.1 },
  { Icon: ClipboardCheck, delay: 0.5, duration: 22, x: "50%", y: "5%", size: 50, opacity: 0.13 },
  { Icon: UserCheck, delay: 4, duration: 20, x: "48%", y: "92%", size: 46, opacity: 0.11 },
];

export function ModernHomeView({ onStartChat, onOpenLawSelector, selectedLaws }: ModernHomeViewProps) {
  const [inputValue, setInputValue] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<{ name: string; size: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [chatMode, setChatMode] = useState<"search" | "opinion">("search");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const CATEGORIES = ["전체", "근로시간", "임금·퇴직", "채용·해고", "산재"];

  // 파일 크기 포맷팅
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // 파일 타입별 아이콘 반환
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.pdf')) return '📄';
    if (fileName.endsWith('.docx')) return '📝';
    if (fileName.endsWith('.hwp')) return '📋';
    return '📎';
  };

  const prompts = [
    {
      text: "연차 사용 시 회사가 사용 사유를 물어봐도 되나요?",
      displayText: "🟢 연차 사용 시 회사가 사용 사유를 물어봐도 되나요? (간단 답변)",
      questionType: "simple",
      category: "근로시간",
      laws: ["근로기준법 제60조", "근로기준법 시행령 제30조", "대법원 2017다232132 판결"]
    },
    {
      text: "점심시간에 회사 구내식당으로 이동 중 넘어져 발목을 다쳤어요. 산재 인정될까요?",
      displayText: "점심시간에 회사 구내식당으로 이동 중 넘어져 발목을 다쳤어요. 산재 인정될까요? (정상 질문)",
      questionType: "normal",
      category: "산재",
      laws: ["산업재해보상보험법 제37조", "산업재해보상보험법 제5조", "근로기준법 제54조", "대법원 2017두74719 판결", "대법원 2014두3923 판결", "산업안전보건법 제5조", "고용노동부 업무상재해 인정기준"]
    },
    {
      text: "퇴직금을 받을 수 있나요?",
      displayText: "퇴직금을 받을 수 있나요? (정보 부족)",
      questionType: "insufficient",
      category: "임금·퇴직",
      laws: ["근로자퇴직급여보장법 제8조", "근로기준법 제34조"]
    },
    {
      text: "안녕하세요",
      displayText: "안녕하세요 (의미없는 질문)",
      questionType: "meaningless",
      category: "전체",
      laws: []
    },
    {
      text: "배우자 명의 주택을 담보로 제가 대출받았는데 장기주택저당차입금 이자상환액 소득공제 받을 수 있나요?",
      displayText: "배우자 명의 주택을 담보로 제가 대출받았는데 장기주택저당차입금 이자상환액 소득공제 받을 수 있나요? (범위 밖)",
      questionType: "out-of-scope",
      category: "임금·퇴직",
      laws: ["소득세법 제52조", "소득세법 시행령 제111조", "조세특례제한법 제95조"]
    },
    {
      text: "직원을 해고하지 않고 스스로 나가게 만드는 방법이 있을까요?",
      displayText: "직원을 해고하지 않고 스스로 나가게 만드는 방법이 있을까요? (부적절한 질문)",
      questionType: "inappropriate",
      category: "채용·해고",
      laws: ["근로기준법 제23조", "근로기준법 제76조"]
    },
  ];

  const filteredPrompts = selectedCategory === "전체"
    ? prompts
    : prompts.filter(p => p.category === selectedCategory);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/x-hwp',
      'application/haansofthwp',
    ];

    const validFiles: { name: string; size: number }[] = [];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.hwp')) {
        alert('지원되지 않는 파일 형식입니다. PDF, DOCX, HWP 파일만 업로드 가능합니다.');
        return;
      }
      if (file.size > maxFileSize) {
        alert(`파일 크기는 10MB 이하만 가능합니다. (${file.name})`);
        return;
      }
      if (uploadedFiles.length + validFiles.length >= 5) {
        alert('최대 5개 파일까지만 첨부 가능합니다.');
        return;
      }
      validFiles.push({ name: file.name, size: file.size });
    }

    setUploadedFiles([...uploadedFiles, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const dataTransfer = new DataTransfer();
    for (let i = 0; i < files.length; i++) {
      dataTransfer.items.add(files[i]);
    }

    const input = fileInputRef.current;
    if (input) {
      input.files = dataTransfer.files;
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
      handleFileUpload({ target: input } as any);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onStartChat(inputValue, selectedLaws, undefined, undefined, chatMode);
      setInputValue("");
      setUploadedFiles([]); // Clear file on submit
    }
  };

  const handlePromptClick = (promptText: string, relatedLaws: string[], questionType: string) => {
    // 질문을 직접 채팅으로 전송 (questionType 포함)
    onStartChat(promptText, selectedLaws, relatedLaws, questionType, chatMode);
  };

  return (
    <div className="flex-1 flex items-center justify-center px-6 relative overflow-hidden">
      {/* 배경 플로팅 아이콘들 - 화면 전체 */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_ICONS.map((item, index) => (
          <div
            key={index}
            className="absolute"
            style={{
              left: item.x,
              top: item.y,
              animation: `float ${item.duration}s ease-in-out ${item.delay}s infinite`,
            }}
          >
            <item.Icon 
              className="text-primary"
              style={{
                width: item.size,
                height: item.size,
                opacity: item.opacity,
              }}
            />
          </div>
        ))}
      </div>

      {/* 좌측 하단 크레딧 현황 */}
      <div className="absolute bottom-6 left-6 z-20">
        <CreditStatus />
      </div>

      {/* 하단 푸터 안내 문구 */}
      <div className="absolute bottom-4 right-0 left-0 z-20">
        <p className="text-center text-xs text-muted-foreground/60">
          AI 노무도우미의 답변은 참고용이며 법적 효력이 없습니다. 최종 의사결정 시 반드시 규정 원본 및 전문가의 확인을 거치시기 바랍니다.
        </p>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="w-full max-w-[680px] flex flex-col items-center gap-7 relative z-10 py-8">

        {/* Avatar + 인사말 */}
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="w-[88px] h-[88px] rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
            <span className="text-5xl">⚖️</span>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">
              안녕하세요, <span className="text-primary">노무도우미</span>입니다.
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              복잡한 노무 문제로 고민이신가요?<br />저에게 편하게 질문해 주세요.
            </p>
          </div>
        </div>

        {/* 입력 카드 - 단일 행 */}
        <div
          className={`w-full bg-card border rounded-2xl shadow-sm overflow-hidden transition-all relative ${
            isDragging ? 'border-primary bg-primary/5 scale-[1.01] shadow-md' : 'border-border/60'
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

          {/* 텍스트 입력 영역 */}
          <textarea
            placeholder="궁금한 점을 편하게 작성해 주세요."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            rows={1}
            className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground resize-none overflow-y-auto px-5 pt-4 pb-2"
            style={{ minHeight: '52px', maxHeight: '120px' }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = 'auto';
              t.style.height = Math.min(t.scrollHeight, 120) + 'px';
            }}
          />

          {/* 파일 칩 */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-5 pb-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-muted/70 rounded-lg">
                  <span className="text-xs">{getFileIcon(file.name)}</span>
                  <span className="text-xs font-medium text-foreground truncate max-w-[80px]">{file.name}</span>
                  <button type="button" onClick={() => handleRemoveFile(index)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* 하단 툴바: 좌(설정) — 우(액션) */}
          <div className="flex items-center gap-2 px-3 pb-3 pt-1">

            {/* 좌: 법령 선택 */}
            <button
              onClick={onOpenLawSelector}
              className="h-8 flex items-center gap-1.5 px-2.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors whitespace-nowrap"
            >
              <span>⚖️</span>
              <span>{selectedLaws.length === 0 || selectedLaws.length === 15 ? "전체 법령" : `${selectedLaws.length}개 법령`}</span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* 좌: 모드 토글 */}
            <div className="h-8 inline-flex items-center p-0.5 bg-muted/60 rounded-lg">
              <button
                onClick={() => setChatMode("search")}
                className={`h-7 px-2.5 rounded-md text-xs font-medium transition-all ${
                  chatMode === "search" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >검색</button>
              <button
                onClick={() => setChatMode("opinion")}
                className={`h-7 px-2.5 rounded-md text-xs font-medium transition-all ${
                  chatMode === "opinion" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >의견서</button>
            </div>

            <div className="flex-1" />

            {/* 우: 파일 첨부 */}
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".pdf,.docx,.hwp" className="hidden" multiple />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadedFiles.length >= 5}
              className={`h-8 w-8 rounded-xl flex items-center justify-center transition-colors ${
                uploadedFiles.length >= 5 ? 'opacity-30 cursor-not-allowed text-muted-foreground'
                : uploadedFiles.length > 0 ? 'text-primary bg-primary/10 hover:bg-primary/15'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
              }`}
              title="파일 첨부 (PDF, DOCX, HWP)"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* 우: 전송 */}
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="h-8 w-8 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 노무 라우팅 안내 - 카드 밖, 파일 첨부 시에만 */}
        {uploadedFiles.length > 0 && (
          <div className="w-full flex items-center gap-1.5 px-1 -mt-3">
            <Info className="w-3.5 h-3.5 text-muted-foreground/60 flex-shrink-0" />
            <p className="text-xs text-muted-foreground/80">
              파일 첨부 시 노무 관련 질문으로 분류됩니다. 세법 관련 질문은 파일을 제거한 후 질문해 주세요.
            </p>
          </div>
        )}

        {/* 추천 질문 - 카테고리 탭 */}
        <div className="w-full flex flex-col gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">이런 질문도 있어요</span>
            <div className="flex gap-1.5 flex-wrap">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {filteredPrompts.map((prompt, index) => (
              <button
                key={index}
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

      {/* CSS 애니메이션 */}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          25% {
            transform: translateY(-20px) rotate(5deg);
          }
          50% {
            transform: translateY(-10px) rotate(-5deg);
          }
          75% {
            transform: translateY(-15px) rotate(3deg);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* 파일 카드 애니메이션 */
        .group {
          animation: slideIn 0.3s ease-out;
        }

        /* 커스텀 스크롤바 스타일 */
        textarea::-webkit-scrollbar {
          width: 6px;
        }

        textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        textarea::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.3);
          border-radius: 3px;
        }

        textarea::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.5);
        }

        /* Firefox 스크롤바 */
        textarea {
          scrollbar-width: thin;
          scrollbar-color: rgba(99, 102, 241, 0.3) transparent;
        }
      `}</style>
    </div>
  );
}