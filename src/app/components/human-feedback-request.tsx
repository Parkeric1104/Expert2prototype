import { useState } from "react";
import { Search, HelpCircle, Plus, ArrowUp, ChevronLeft } from "lucide-react";
import characterImg from "@/assets/dobi-chat.png";

interface HumanFeedbackRequestProps {
  reason: "invalid" | "insufficient" | "inappropriate";
  originalQuestion: string;
  onSubmitRevision: (revisedQuestion: string) => void;
  suggestedQuestions?: string[];
  onQuestionSelect?: (question: string) => void; // 추천 질문 선택 시 입력창에 자동 입력(교체)
  onAddContext?: () => void; // '내용 추가하기' — 입력창을 비우고 추가 정보만 받음(원 질문 보존)
  onContextChip?: (chip: string) => void; // 맥락 칩(원클릭) — 원 질문에 맥락을 더해 바로 답변
}

// 휴먼피드백 데이터 (제미나이 스펙)
//  - summary   : 질문 의도를 명사형 구절로 요약(서술어 중복 금지)
//  - conditions: 법령·판례 매칭에 필요한 확인 사항 "[키워드]: 질문?" 형식
//  - chips     : 원 질문 '주제 고정' 원클릭 맥락 추가 선택지(정확히 3개)
interface FeedbackData {
  summary: string;
  conditions: string[];
  chips: string[];
}

function buildFeedbackData(question: string): FeedbackData {
  const q = (question || "").toLowerCase();

  if (q.includes("퇴직금") || q.includes("중간정산")) {
    return {
      summary: "퇴직금 산정 기준 및 중간정산 요건 문의",
      conditions: [
        "재직 기간: 입사일과 퇴사일(또는 중간정산 신청 시점)이 언제인가요?",
        "신청 사유·규모: 중간정산 사유(주택구입·전세금 등)와 상시근로자 수는 몇 명인가요?",
      ],
      chips: [
        "상시 5인 이상 사업장이며, 3년 근속한 정규직의 퇴직금 산정 기준이 궁금합니다.",
        "무주택 근로자가 본인 명의 주택 구입을 위해 중간정산을 신청하는 상황입니다.",
        "전세보증금 마련 목적으로 중간정산 시 법적 인정 요건과 증빙서류를 알고 싶습니다.",
      ],
    };
  }
  if (q.includes("연차") || q.includes("휴가")) {
    return {
      summary: "연차휴가 발생·사용 및 미사용수당 기준 문의",
      conditions: [
        "근속·형태: 입사일과 고용형태(정규직·계약직 등)는 어떻게 되나요?",
        "사용 현황: 올해 부여된 연차 일수와 미사용 일수는 며칠인가요?",
      ],
      chips: [
        "입사 1년 미만 근로자의 월 단위 연차 발생 기준이 궁금합니다.",
        "작년에 발생한 연차를 사용하지 못하고 올해로 넘어온 경우의 처리 방법을 알고 싶습니다.",
        "회사가 날짜를 지정해 연차 사용을 강제할 수 있는지(연차사용촉진) 궁금합니다.",
      ],
    };
  }
  if (q.includes("임금") || q.includes("급여") || q.includes("체불")) {
    return {
      summary: "임금 구성·지급 및 체불 대응 기준 문의",
      conditions: [
        "임금 내역: 월 급여 구성(기본급·수당)과 근로계약서상 금액은 어떻게 되나요?",
        "체불 범위: 미지급 항목과 미지급 기간은 어떻게 되나요?",
      ],
      chips: [
        "매월 정해진 날짜에 급여를 받지 못한 경우 체불 신고 절차가 궁금합니다.",
        "포괄임금제 계약에서 연장근로수당이 별도로 지급되어야 하는지 알고 싶습니다.",
        "퇴사 후 14일이 지나도 임금이 지급되지 않을 때 대응 방법을 알고 싶습니다.",
      ],
    };
  }
  if (q.includes("해고") || q.includes("징계")) {
    return {
      summary: "해고·징계의 정당성 및 절차 요건 문의",
      conditions: [
        "사유·통보: 해고(징계) 사유와 서면 통보·예고 여부는 어떻게 되나요?",
        "절차: 취업규칙·단체협약에 징계 절차가 규정되어 있나요?",
      ],
      chips: [
        "수습 기간 중 업무 능력 부족을 이유로 한 해고가 정당한지 궁금합니다.",
        "서면 통보 없이 구두로만 해고를 통보받은 경우의 효력을 알고 싶습니다.",
        "상시 5인 이상 사업장에서 징계해고 시 필요한 절차적 요건이 궁금합니다.",
      ],
    };
  }
  if (q.includes("산재") || q.includes("재해") || q.includes("사고")) {
    return {
      summary: "업무상 재해 인정 요건 및 산재 신청 절차 문의",
      conditions: [
        "사고 경위: 사고 발생 시간·장소와 업무와의 관련성은 어떻게 되나요?",
        "진행 상황: 산재 신청 여부와 현재 진행 단계는 어떻게 되나요?",
      ],
      chips: [
        "출퇴근 중 발생한 사고가 업무상 재해로 인정되는지 궁금합니다.",
        "휴게시간에 사업장 내에서 다친 경우 산재 인정 여부를 알고 싶습니다.",
        "업무로 인한 질병(근골격계 등)의 산재 인정 기준과 입증 방법이 궁금합니다.",
      ],
    };
  }
  // 기타(주제 미식별) — 중립적 상황 보강
  return {
    summary: "상담 요건 및 적용 기준 확인 필요",
    conditions: [
      "상황·시점: 관련된 날짜·기간 등 구체적인 상황은 어떻게 되나요?",
      "규모·형태: 상시근로자 수와 고용형태(정규직·계약직 등)는 어떻게 되나요?",
    ],
    chips: [
      "관련된 구체적인 날짜와 기간을 포함해 상황을 설명드리겠습니다.",
      "상시근로자 수와 고용형태(정규직·계약직 등)를 추가로 알려드리겠습니다.",
      "현재까지 진행된 상황과 회사의 조치 내용을 함께 설명드리겠습니다.",
    ],
  };
}

export function HumanFeedbackRequest({
  reason,
  originalQuestion,
  onSubmitRevision,
  suggestedQuestions = [],
  onQuestionSelect,
  onAddContext,
  onContextChip,
}: HumanFeedbackRequestProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [adding, setAdding] = useState(false); // '내용 추가하기' → 피드백 영역 하단 인라인 입력창 노출
  const [addText, setAddText] = useState("");

  // insufficient일 때만 구조화 데이터(요약·조건·칩) 사용
  const data = reason === "insufficient" ? buildFeedbackData(originalQuestion) : null;

  // 인라인 입력창 전송 — 원 질문에 추가 맥락을 더해 바로 답변(칩 선택과 동일 경로)
  const submitAdd = () => {
    const t = addText.trim();
    if (!t || isSubmitting) return;
    onContextChip?.(t);
  };

  const getDescriptionText = () => {
    switch (reason) {
      case "invalid":
        return "입력하신 내용이 명확하지 않습니다. 구체적인 질문을 입력해주세요.";
      case "inappropriate":
        return "이 질문은 법적·윤리적 책임 문제로 인해 답변이 제한됩니다.";
      default:
        return "";
    }
  };

  const descriptionText = getDescriptionText();

  const handleRetype = () => {
    // invalid/inappropriate: 원본 질문을 입력창에 넣어 다시 작성
    onQuestionSelect?.(originalQuestion);
  };

  const handleContinue = () => {
    setIsSubmitting(true);
    onSubmitRevision(originalQuestion);
  };

  // "[키워드]: 질문?" → 키워드 강조 렌더
  const renderCondition = (c: string) => {
    const idx = c.indexOf(":");
    if (idx === -1) return <span>{c}</span>;
    return (
      <span>
        <span className="font-semibold text-foreground">{c.slice(0, idx)}</span>
        {c.slice(idx)}
      </span>
    );
  };

  return (
    <div className="my-6 space-y-3">
      {/* 어시스턴트 '되묻기' 버블 — 최종 답변이 아니라 '추가 질문'으로 읽히도록 대화체 구성 */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden ring-2 ring-indigo-100 dark:ring-indigo-900/40 bg-indigo-50">
          <img src={characterImg} alt="노무도우미" className="w-full h-full object-cover" />
        </div>

        <div
          className="max-w-[680px] rounded-2xl rounded-tl-sm bg-blue-150 dark:bg-indigo-950/30 px-5 py-4 space-y-3.5"
          style={{ wordBreak: "keep-all" }}
        >
          {/* 리드: 아직 답변이 아님을 분명히 */}
          <div className="flex items-start gap-2">
            <HelpCircle className="w-[18px] h-[18px] text-primary flex-shrink-0 mt-[1px]" />
            <p className="text-sm font-bold text-foreground leading-relaxed">
              더 정확한 답변을 위해, 답변 전에 몇 가지만 확인할게요.
            </p>
          </div>

          {data ? (
            <>
              {/* 이해한 내용 요약(명사형) */}
              <p className="text-sm text-foreground/90 leading-relaxed">
                <span className="font-semibold">이렇게 이해했어요</span> — {data.summary}
              </p>

              {/* 확인 필요 사항 */}
              {data.conditions.length > 0 && (
                <div className="rounded-xl bg-card/70 px-3.5 py-3">
                  <p className="text-[13px] font-bold text-foreground mb-2">
                    아래를 알려주시면 더 정확히 답변드릴 수 있어요
                  </p>
                  <ul className="space-y-1.5">
                    {data.conditions.map((c, index) => (
                      <li key={index} className="flex items-start gap-2 text-[13px] text-foreground/85 leading-relaxed">
                        <span className="mt-[7px] w-1 h-1 rounded-full bg-primary flex-shrink-0" />
                        {renderCondition(c)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 선택 안내 */}
              <p className="text-[13px] text-muted-foreground leading-relaxed">
                이대로 답변을 받으시거나, 위 정보를 더해 주시면 더 정확히 답변드려요.
              </p>
            </>
          ) : (
            descriptionText && (
              <p className="text-sm text-foreground/90 leading-relaxed">{descriptionText}</p>
            )
          )}
        </div>
      </div>

      {/* 액션 — 되묻기에 대한 응답 (버블과 좌측 정렬) */}
      <div className="flex items-center gap-2 pl-[52px] flex-wrap">
        {data ? (
          <>
            <button
              onClick={handleContinue}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ wordBreak: "keep-all" }}
            >
              바로 답변받기
            </button>
            <button
              onClick={() => setAdding(true)}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                adding ? "border-primary bg-primary/5 text-primary" : "border-primary/50 text-primary hover:bg-primary/5"
              }`}
              style={{ wordBreak: "keep-all" }}
            >
              내용 추가하기
            </button>
          </>
        ) : (
          <button
            onClick={handleRetype}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ wordBreak: "keep-all" }}
          >
            질문 다시 입력하기
          </button>
        )}
      </div>

      {/* 원클릭 맥락 추가 칩 (insufficient — 원 질문 주제 고정) */}
      {data ? (
        <div className="pl-[52px] pt-1">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <Plus className="w-3.5 h-3.5 text-primary" />
            <p className="text-xs font-medium text-muted-foreground">
              자주 겪는 상황을 누르면 내용을 더해 바로 답변드려요.
            </p>
          </div>
          <div className="space-y-2">
            {data.chips.map((chip, index) => (
              <button
                key={index}
                onClick={() => !isSubmitting && onContextChip?.(chip)}
                disabled={isSubmitting}
                className="group w-full text-left px-4 py-3 bg-card border border-border hover:border-primary/40 hover:bg-primary/5 rounded-xl transition-colors text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed flex items-start gap-2.5"
                style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
              >
                <Plus className="w-4 h-4 mt-[2px] text-muted-foreground group-hover:text-primary flex-shrink-0 transition-colors" />
                <span className="leading-relaxed">{chip}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        suggestedQuestions.length > 0 && (
          <div className="pl-[52px] pt-1">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <Search className="w-3.5 h-3.5 text-primary" />
              <p className="text-xs font-medium text-muted-foreground">
                또는 추천 질문으로 다시 물어보세요.
              </p>
            </div>
            <div className="space-y-2">
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => !isSubmitting && onQuestionSelect?.(question)}
                  disabled={isSubmitting}
                  className="w-full text-left px-4 py-3 bg-card border border-border hover:border-primary/40 hover:bg-muted/40 rounded-xl transition-colors text-sm text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ wordBreak: "keep-all", overflowWrap: "break-word" }}
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* 내용 추가 인라인 입력창 — '내용 추가하기' 선택 시 피드백 영역 하단에 노출 */}
      {data && adding && (
        <div className="pl-[52px] pt-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setAdding(false); setAddText(""); }}
              disabled={isSubmitting}
              aria-label="닫기"
              className="flex-shrink-0 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              닫기
            </button>
            <textarea
              autoFocus
              value={addText}
              onChange={(e) => setAddText(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAdd(); } }}
              placeholder="추가로 알려주실 내용을 입력해 보세요."
              rows={1}
              disabled={isSubmitting}
              className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors placeholder:text-muted-foreground/70 disabled:opacity-50"
              style={{ maxHeight: 120 }}
            />
            <button
              onClick={submitAdd}
              disabled={!addText.trim() || isSubmitting}
              aria-label="보내기"
              className="h-10 w-10 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
