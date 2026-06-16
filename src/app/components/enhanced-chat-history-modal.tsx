import { useState } from "react";
import { X, Calendar, MessageSquare, ChevronDown, ChevronUp, Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { ScrollArea } from "@/app/components/ui/scroll-area";
import { DocumentView } from "@/app/components/document-view";
import { AnswerDetailSidebar } from "@/app/components/answer-detail-sidebar";
import { toast } from "sonner";

interface ChatHistoryItem {
  id: string;
  title: string;
  initialQuestion: string;
  finalAnswer: {
    summary: string;
    fullDetails: string;
    laws: string[];
  };
  date: string;
  category: string;
  hasDocument: boolean;
  documentName?: string;
  // AI 상세의견 데이터
  hasDebate?: boolean;
  debates?: Array<{
    round: number;
    conservative: string;
    progressive: string;
  }>;
  finalConclusion?: string;
}

interface EnhancedChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectChat?: (chatId: string) => void;
}

export function EnhancedChatHistoryModal({ isOpen, onClose, onSelectChat }: EnhancedChatHistoryModalProps) {
  const [expandedChat, setExpandedChat] = useState<string | null>(null);
  const [viewingDocument, setViewingDocument] = useState<string | null>(null); // 문서 보기 상태
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedChatForSidebar, setSelectedChatForSidebar] = useState<ChatHistoryItem | null>(null);

  // Mock chat history data with full details
  const chatHistory: ChatHistoryItem[] = [
    {
      id: "1",
      title: "구내식당 이동 중 사고 업무상 재해 검토",
      initialQuestion: "점심시간에 회사 구내식당으로 이동하던 중 계단에서 미끄러져 발목을 다쳤습니다. 이 경우 업무상 재해로 인정받을 수 있나요? 휴게시간이라 업무와 무관하다고 하는데 어떻게 대응해야 할까요?",
      finalAnswer: {
        summary: "해당 사고는 사업주의 지배·관리 하에 있다고 볼 수 있는 '구내식당 이동' 중 발생하였으므로, 업무상 재해로 인정될 가능성이 높습니다.",
        fullDetails: `부상 발생 시간(점심시간)과 장소(식당 이동 경로)의 업무 관련성이 핵심 쟁점입니다.

근로자가 점심시간에 회사 구내식당으로 이동하던 중 발생한 사고로, 다음 사항을 검토해야 합니다:
• 회사가 지정한 식당인지 여부
• 이동 경로의 합리성
• 근로자의 사적 행위 개입 여부
• 사업주의 지배·관리 범위 내 사고인지

산업재해보상보험법 제37조 제1항 제1호 라목에 따르면, 사업주가 제공하거나 관리하는 시설물 등을 이용하던 중 발생한 사고는 업무상 재해로 인정됩니다.

주요 판례:
• 대법원 2017두74719 판결: "근로자가 사업주가 제공한 교통수단이나 그에 준하는 시설을 이용하여 출퇴근하던 중 발생한 사고는 업무상 재해"
• 대법원 2019두32547 판결: "사업장 내 식당 이용은 사주의 지배·관리 하에 있는 행위"

근로기준법 제54조(휴게)도 함께 고려해야 하며, 휴게시간이라도 사업주 관리 하의 시설 이용 중 사고는 업무 관련성이 인정됩니다.

결론적으로, 단순 이동 중 발생한 우발적 사고라면 산재 승인 가능성이 높으나, 구체적 사실관계에 따라 달라질 수 있으므로 정밀한 조사가 필요합니다.`,
        laws: ["산업재해보상보험법 제37조 제1항 제1호 라목", "근로기준법 제54조"],
      },
      date: "2026-02-24",
      category: "산업재해 · 안전보건",
      hasDocument: true,
      documentName: "구내식당_사고_법률검토의견서.pdf",
      hasDebate: true,
      debates: [
        {
          round: 1,
          conservative: "휴게시간은 근로자가 사용자의 지휘·감독에서 벗어나 자유롭게 이용할 수 있는 시간입니다(근로기준법 ��54조). 점심시간은 엄연한 휴게시간으로, 근로자가 개인적으로 식사하러 이동하던 중 발생한 사고는 업무 관련성이 없다고 봐야 합니다. 단순히 회사 구내에 있다는 사실만으로 업무상 재해를 인정하면 과도한 확대 해석의 우려가 있습니다.",
          progressive: "산업재해보상보험법 제37조 제1항 제1호 라목은 '사업주가 제공한 시설물 등을 이용하는 중 발생한 사고'를 업무상 재해로 명시하고 있습니다. 회사가 지정한 구내식당으로 이동하는 것은 사업주의 지배·관리 하에 있는 행위로 봐야 합니다. 대법원 2019두32547 판결도 같은 취지입니다. 휴게시간이라는 이유만으로 업무 관련성을 부정하는 것은 법 취지에 반합니다.",
        },
        {
          round: 2,
          conservative: "지적하신 판례는 사실관계가 다릅니다. 근로자가 외부 식당으로 이동할 수도 있었는데 자발적으로 구내식당을 선택한 것이라면, 이는 개인의 편의를 위한 선택이지 업무상 필요에 의한 행위가 아닙니다. '사업주의 지배·관리'는 사업주가 적극적으로 통제하는 경우에 한정해야 하며, 단순히 시설을 제공했다는 사실만으로는 부족합니다.",
          progressive: "회사가 구내식당을 운영하면서 근��자들에게 이용을 권장하거나, 외부 식당 이용이 현실적으로 어려운 환경(예: 공단 지역, 시간 제약)이라면 사실상 사업주의 지배·관리 하에 있다고 봐야 합니다. 대법원 2017두74719 판결은 '사업주가 제공한 교통수단이나 그에 준하는 시설'을 이용하던 중 사고를 업무상 재해로 인정했습니다. 구내식당 역시 같은 맥락입니다.",
        },
        {
          round: 3,
          conservative: "현실적 제약이 있다는 주장은 사실관계 확인이 필요합니다. 만약 근로자가 충분히 다른 선택지가 있었음에도 구내식당을 선택했다면, 이는 업무상 필요가 아닌 개인의 편의를 위한 것입니다. 또한, 이동 중 발생한 단순 실족 사고를 모두 업무상 재해로 인정하면 산재보험의 재정 부담이 과중해질 우려가 있습니다. 엄격한 기준이 필요합니다.",
          progressive: "산재보험의 목적은 근로자 보호입니다. 근로기준법 제54조가 휴게시간을 보장하는 이유는 근로자의 건강과 안전을 위한 것이지, 사업주의 책임을 회피하기 위한 것이 아닙니다. 사업주가 제공한 시설을 이용하던 중 발생한 사고라면, 그것이 휴게시간이든 근로시간이든 업무 관련성을 인정하는 것이 법 취지에 부합합니다. 재정 부담을 이유로 근로자 보호를 제한하는 것은 본말전도입니다.",
        },
      ],
      finalConclusion: "종합적으로 검토한 결과, 해당 사고는 업무상 재해로 인정될 가능성이 높습니다. 다만, 구체적인 사실관계(회사의 식당 운영 방침, 외부 식당 이용 가능성, 이동 경로의 합리성 등)에 따라 판단이 달라질 수 있으므로, 정밀한 증거 확보와 법률 자문이 필요합니다.",
    },
    {
      id: "2",
      title: "수습기간 만료 통보의 정당성 검토",
      initialQuestion: "입사 3개월 수습기간 만료 직전에 '업무 능력 부족'을 이유로 정규직 전환이 거부되었습니다. 구체적인 평가 기준이나 개선 기회도 없었는데 이것이 정당한가요?",
      finalAnswer: {
        summary: "수습기간 만료 통보는 실질적으로 해고에 해당하므로, 근로기준법 제23조의 정당성 요건을 충족해야 합니다. 객관적이고 합리적인 평가 기준과 절차가 필요합니다.",
        fullDetails: `수습기간 중이라도 근로계약이 존속하는 한 해고에 관한 규정이 적용됩니다.

대법원 2006.2.24 선고 2005다30580 판결에 따르면, 수습사용기간 중이라도 정당한 이유 없는 해고는 무효입니다.

근로기준법 제23조 제1항에 따라 다음 요건이 ��요합니다:
• 객관적이고 합리적인 평가 기준
• 평가 과정의 적법성 및 기회 부여
• 사회통념상 고용관계 유지 불가능한 정도의 사유

단순한 주관적 판단이나 절차적 하자가 있는 경우 부당해고로 인정될 가능성이 높습니다.

사용자는 구체적인 평가 기록과 개선 기회 부여 증빙을 준비해야 합니다.`,
        laws: ["근로기준법 제23조"],
      },
      date: "2026-02-23",
      category: "해고 · 징계",
      hasDocument: true,
      documentName: "수습기간_해고_법률검토의견서.pdf",
    },
    {
      id: "3",
      title: "주 52시간 근로시간 위반 여부 분석",
      initialQuestion: "우리 회사는 주 60시간 정도 근무하고 있습니다. 주 52시간제 위반인가요? 위반 시 어떤 처벌을 받나요?",
      finalAnswer: {
        summary: "주 52시간(법정 근로시간 40시간 + 연장근로 12시간)을 초과하는 근로는 근로기준법 위반입니다. 사용자는 2년 이하의 징역 또는 2천만원 이하의 벌금에 처해질 수 있습니다.",
        fullDetails: `근로기준법 제50조 및 제53조에 따라 1주간의 근로시간은 휴게시간을 제외하고 40시간을 초과할 수 없으며, 당사자 간 합의하면 1주간 12시간을 한도로 연장근로가 가능합니다.

따라서 최대 주 52시간까지만 근로가 허용됩니다.

위반 시 처벌:
• 근로기준법 제110조: 2년 이하의 징역 또는 2천만원 이하의 벌금
• 근로감독관의 시정명령 불이행 시 가중처벌 가능

대응 방안:
• 즉시 근로시간 단축 계획 수립
• 인력 충원 또는 업무 재배치
• 탄력적 근로시간제 또는 선택적 근로시간제 검토
• 근로자와의 협의를 통한 개선 방안 마련`,
        laws: ["근로기준법 제50조", "근로기준법 제53조", "근로기준법 제110조"],
      },
      date: "2026-02-22",
      category: "근로시간 · 휴게",
      hasDocument: false,
    },
    {
      id: "4",
      title: "연차휴가 미사용 수당 계산 방법",
      initialQuestion: "퇴직 예정인데 연차 10일을 사용하지 못했습니다. 미사용 연차수당은 어떻게 계산하나요?",
      finalAnswer: {
        summary: "미사용 연차휴가에 대해서는 통상임금으로 계산한 수당을 지급받을 수 있습니다. 퇴직 시 반드시 정산되어야 합니다.",
        fullDetails: `근로기준법 제60조 제5항에 따라 사용하지 아니한 연차휴가에 대하여는 통상임금을 지급하여야 합니다.

계산 방법:
미사용 연차수당 = (1일 통상임금) × (미사용 연차일수)

1일 통상임금 ��산:
• 월급제: 월 통상임금 ÷ 월 소정근로시간 × 1일 소정근로시간
• 일급제: 일 통상임금

예시 (월급 300만원, 주 40시간 근무):
• 월 통상임금: 3,000,000원
• 월 소정근로시간: 209시간 (주 40시간 기준)
• 1일 통상임금: 3,000,000 ÷ 209 × 8 = 약 114,832원
• 미사용 연차 10일 수당: 114,832 × 10 = 1,148,320원

퇴직 시 미지급 연차수당은 임금채권으로 3년간 소멸시효가 적용됩니다.`,
        laws: ["근로기준법 제60조"],
      },
      date: "2026-02-21",
      category: "휴가 · 휴직",
      hasDocument: true,
      documentName: "연차수당_계산_법률검토의견서.pdf",
    },
  ];

  const toggleExpand = (chatId: string) => {
    setExpandedChat(expandedChat === chatId ? null : chatId);
  };

  const handleDownloadDocument = (chat: ChatHistoryItem) => {
    if (chat.hasDocument) {
      toast.success(`${chat.documentName} 다운로드를 시작합니다.`);
      // 실제로는 파일 다운로드 로직
    }
  };

  const handleViewDocument = (chat: ChatHistoryItem) => {
    if (chat.hasDocument) {
      setViewingDocument(chat.documentName);
    }
  };

  const handleOpenSidebar = (chat: ChatHistoryItem) => {
    setSelectedChatForSidebar(chat);
    setSidebarOpen(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border flex-shrink-0">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            대화 히스토리
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            저장된 대화 히스토리를 확인하고 필요한 문서를 다운로드할 수 있습니다.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="space-y-3">
            {chatHistory.map((chat) => (
              <div
                key={chat.id}
                className="border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all"
              >
                {/* 헤더 */}
                <div className="p-4 bg-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{chat.date}</span>
                        </div>
                        {chat.hasDocument && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                            <FileText className="w-3 h-3 mr-1" />
                            의견서
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground">
                        {chat.title}
                      </h3>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpand(chat.id)}
                    >
                      {expandedChat === chat.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* 확장된 상세 내용 */}
                {expandedChat === chat.id && (
                  <div className="border-t border-border p-4 space-y-4">
                    {/* 최초 질문 */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        최초 질문
                      </h4>
                      <p className="text-sm text-foreground leading-relaxed">
                        {chat.initialQuestion}
                      </p>
                    </div>

                    {/* 최종 답변 상세 - AnswerDetailSidebar와 동일한 구조 */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        최종 답변 상세
                      </h4>
                      
                      {/* 사실관계 */}
                      <div className="bg-white dark:bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-foreground mb-2">사실관계</h5>
                            <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                              {chat.finalAnswer.summary}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 질의내용 */}
                      <div className="bg-white dark:bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-foreground mb-2">질의내용</h5>
                            <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                              {chat.initialQuestion}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 검토 내용 */}
                      <div className="bg-white dark:bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-foreground mb-2">검토 내용</h5>
                            <div className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                              {chat.finalAnswer.fullDetails}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 근거 법령 */}
                      <div className="bg-white dark:bg-card border border-border rounded-lg p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <FileText className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-1">
                            <h5 className="text-sm font-bold text-foreground">근거 법령</h5>
                          </div>
                        </div>
                        <div className="pl-9 space-y-2">
                          {chat.finalAnswer.laws.map((law, idx) => (
                            <div
                              key={idx}
                              className="p-3 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800 rounded-lg"
                            >
                              <span className="text-sm text-foreground font-medium">
                                {law}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* 의견서 다운로드 */}
                    {chat.hasDocument && (
                      <div className="pt-4 border-t border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-5 h-5 text-primary" />
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                {chat.documentName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                법률검토의견서
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => handleDownloadDocument(chat)}
                            className="gap-2"
                          >
                            <Download className="w-4 h-4" />
                            다운로드
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {chatHistory.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>저장된 대화 히스토리가 없습니다.</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}