import { useState, useRef } from "react";
import { RotatingTitle } from "@/app/components/rotating-title";
import { CreditStatus } from "@/app/components/credit-status";
import { Send, Paperclip, X, FileText, Info } from "lucide-react";
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
  onStartChat: (query: string, selectedLaws: string[], relatedLaws?: string[], questionType?: string) => void;
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const prompts = [
    // 🟢 간단한 답변 테스트 - Simple Response Card
    {
      text: "연차 사용 시 회사가 사용 사유를 물어봐도 되나요?",
      displayText: "🟢 연차 사용 시 회사가 사용 사유를 물어봐도 되나요? (간단 답변)",
      questionType: "simple",
      laws: [
        "근로기준법 제60조",
        "근로기준법 시행령 제30조",
        "대법원 2017다232132 판결"
      ]
    },
    // ✅ 정상 질문 - 명확하고 상세한 질문
    {
      text: "점심시간에 회사 구내식당으로 이동 중 넘어져 발목을 다쳤어요. 산재 인정될까요?",
      displayText: "점심시간에 회사 구내식당으로 이동 중 넘어져 발목을 다쳤어요. 산재 인정될까요? (정상 질문)",
      questionType: "normal",
      laws: [
        "산업재해보상보험법 제37조",
        "산업재해보상보험법 제5조",
        "근로기준법 제54조",
        "대법원 2017두74719 판결",
        "대법원 2014두3923 판결",
        "산업안전보건법 제5조",
        "고용노동부 업무상재해 인정기준"
      ]
    },
    // ⚠️ 정보 부족 - 휴먼 피드백 케이스
    {
      text: "퇴직금을 받을 수 있나요?",
      displayText: "퇴직금을 받을 수 있나요? (정보 부족)",
      questionType: "insufficient",
      laws: [
        "근로자퇴직급여보장법 제8조",
        "근로기준법 제34조"
      ]
    },
    // ❓ 의미없는 질문 - 휴먼 피드백 케이스
    {
      text: "안녕하세요",
      displayText: "안녕하세요 (의미없는 질문)",
      questionType: "meaningless",
      laws: []
    },
    // 🚫 범위 밖 질문 - 휴먼 피드백 케이스
    {
      text: "배우자 명의 주택을 담보로 제가 대출받았는데 장기주택저당차입금 이자상환액 소득공제 받을 수 있나요?",
      displayText: "배우자 명의 주택을 담보로 제가 대출받았는데 장기주택저당차입금 이자상환액 소득공제 받을 수 있나요? (범위 밖)",
      questionType: "out-of-scope",
      laws: [
        "소득세법 제52조",
        "소득세법 시행령 제111조",
        "조세특례제한법 제95조"
      ]
    },
    // ⛔ 부적절한 질문 - 휴먼 피드백 케이스
    {
      text: "직원을 해고하지 않고 스스로 나가게 만드는 방법이 있을까요?",
      displayText: "직원을 해고하지 않고 스스로 나가게 만드는 방법이 있을까요? (부적절한 질문)",
      questionType: "inappropriate",
      laws: [
        "근로기준법 제23조",
        "근로기준법 제76조"
      ]
    },
  ];

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
    for (const file of files) {
      if (!allowedTypes.includes(file.type) && !file.name.endsWith('.hwp')) {
        alert('지원되 않는 파일 형식입니다. PDF, DOCX, HWP 파일만 업로드 가능합니다.');
        return;
      }
      validFiles.push({ name: file.name, size: file.size });
    }

    setUploadedFiles([...uploadedFiles, ...validFiles]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (inputValue.trim()) {
      onStartChat(inputValue, selectedLaws);
      setInputValue("");
      setUploadedFiles([]); // Clear file on submit
    }
  };

  const handlePromptClick = (promptText: string, relatedLaws: string[], questionType: string) => {
    // 질문을 직접 채팅으로 전송 (questionType 포함)
    onStartChat(promptText, selectedLaws, relatedLaws, questionType);
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
      <div className="w-full max-w-4xl flex flex-col items-center gap-10 relative z-10">
        {/* Rotating Main Title */}
        <RotatingTitle />

        {/* Integrated Search Bar with Files Inside */}
        <div className="w-full max-w-[800px] bg-card border border-border rounded-3xl shadow-md flex flex-col overflow-hidden">
          {/* File Upload Preview (inside input area) */}
          {uploadedFiles.length > 0 && (
            <div className="flex flex-col bg-primary/5 border-b border-border/50">
              <div className="px-4 pt-3 pb-2 flex flex-wrap gap-1.5">
                {uploadedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 rounded-full"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    <span className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(index)}
                      className="flex-shrink-0 w-4 h-4 bg-indigo-200 dark:bg-indigo-800 hover:bg-indigo-300 dark:hover:bg-indigo-700 rounded-full flex items-center justify-center transition-colors"
                    >
                      <X className="w-2.5 h-2.5 text-indigo-700 dark:text-indigo-200" />
                    </button>
                  </div>
                ))}
              </div>
              {/* File upload guide message */}
              <div className="mx-4 mb-3 px-3 py-2 bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-800/50 rounded-xl flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-600 dark:text-indigo-400 leading-relaxed">
                  파일 첨부 시 <span className="font-semibold">노무 관련 질문</span>으로 라우팅됩니다.
                  <br />세법 관련 질문은 파일을 제거한 후 질문해 주세요.
                </p>
              </div>
            </div>
          )}

          {/* Input Row */}
          <div className="min-h-16 flex items-start gap-4 px-3 py-3">
            {/* Left: Law Selector Button */}
            <button
              onClick={onOpenLawSelector}
              className="flex items-center gap-2 px-4 py-2.5 bg-primary/5 hover:bg-primary/10 rounded-full transition-colors whitespace-nowrap flex-shrink-0 mt-1"
            >
              <span className="text-base">⚖️</span>
              <span className="text-sm font-bold text-primary">
                {selectedLaws.length === 0 || selectedLaws.length === 15
                  ? "전체 법령"
                  : `${selectedLaws.length}개 법령`}
              </span>
              <span className="text-xs text-primary">▼</span>
            </button>

            {/* Center: Textarea Field */}
            <textarea
              placeholder={uploadedFiles.length > 0 ? "첨부된 파일에 대해 궁금한 점을 질문해 주세요..." : "무엇이 궁금하신가요?"}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              rows={1}
              className="flex-1 bg-transparent border-none outline-none text-base text-foreground placeholder:text-muted-foreground resize-none overflow-y-auto py-2.5"
              style={{
                minHeight: '40px',
                maxHeight: '200px',
              }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = 'auto';
                target.style.height = Math.min(target.scrollHeight, 200) + 'px';
              }}
            />

            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.docx,.hwp"
              className="hidden"
              multiple
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 bg-muted hover:bg-muted/80 rounded-full transition-colors flex items-center justify-center flex-shrink-0 mt-1"
              title="파일 첨부 (PDF, DOCX, HWP)"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            {/* Right: Send Button */}
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim()}
              className="w-12 h-12 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Recommended Prompts: Sentence Style */}
        <div className="w-full flex flex-col items-center gap-4">
          {/* 서브타이틀 */}
          <h3 className="text-sm font-medium text-muted-foreground">추천질문(답변 유형 테스트 질문)</h3>
          
          <div className="flex flex-col gap-2 w-full max-w-[800px]">
            {prompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt.text, prompt.laws, prompt.questionType)}
                className="text-muted-foreground hover:text-primary transition-colors text-center px-2"
              >
                <span className="text-sm">{prompt.displayText}</span>
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