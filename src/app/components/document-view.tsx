import { ArrowLeft, Download, Printer } from "lucide-react";

interface DocumentSection {
  title: string;
  content: string[];
  subsections?: Array<{
    title?: string;
    content: string[];
  }>;
  relatedCase?: string;
  relatedInterpretation?: string;
  example?: string;
}

interface DocumentViewProps {
  onBack: () => void;
  onComplete?: () => void;
  showCompleteButton?: boolean;
  data?: {
    // 문서 기본 정보
    referenceNo?: string;
    reviewType?: string;
    date?: string;
    reviewTarget?: string;
    
    // 질의 섹션
    queries?: string[];
    
    // 회신 서문
    responsePreamble?: string;
    
    // 본문 섹션들 (1. 임금, 2. 근로시간, 3. 휴일 등)
    sections?: DocumentSection[];
    
    // AI 의견서 고지문
    disclaimer?: string;
    author?: string;
  };
}

export function DocumentView({
  onBack,
  onComplete,
  showCompleteButton = false,
  data,
}: DocumentViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    console.log("Download document");
  };

  // 기본 섹션 데이터
  const defaultSections: DocumentSection[] = [
    {
      title: "1. 임금",
      content: [
        "○ 고정OT수당과 관련하여, 실제 연장근로 발생 여부와 무관하게 고정OT수당을 지급하는 경우 통상임금으로 인정될 가능성이 있으므로, 기본급에 실제로 연장·휴일·야간근로 발생 시 추가 수당을 지급하는 구조로 운영하는 것이 바람직함.",
        "- 고정OT제도를 유지해야 한다면 본사와 매장의 근무형태가 다르므로 현재와 같이 본사와 매장의 고정OT 시간을 다르게 설정하여 운영할 수 있음.",
        "- 다만, 법원과 고용노동부는 고정OT수당에 휴일근로와 야간근로가 포함되어 있다고 보지 않는바, 고정OT수당을 연장·휴일·야간근로수당으로 명확히 구분하여 기재하는 것이 바람직함.",
      ],
      relatedCase: "[관련 판례] 대법원 1997. 7. 22. 선고 96다 38995 판결\n격일제 교대근무의 경우에도 시간외, 야간, 휴일근로수당에 관한 근로기준법 규정이 적용된다.",
      relatedInterpretation: "[관련 행정해석] 여원 68240-483, 2001. 1. 16.\n시간외근로란 동법 제49조에서 정한 근로시간, 즉 1일 8시간, 1주 44시간을 초과하는 근로시간을 말하며, 이때 휴일근로시간은 시간외근로에 포함되지 않으며, 야간(22:00~06:00)에 근로하더라도 기준근로시간(근로기준법 제49조의 근로시간)을 초과하지 않으면 시간외근로에 해당하지 않음.",
    },
    {
      title: "2. 근로시간",
      content: [
        "○ 매장 근로자의 경우 스케줄에 따라 시·종업시각이 달라지므로 스케줄근무조에 따른 시·종업시각 및 휴게시간을 기재해야 함.",
      ],
      example: "[예시] 근무시간\nA조 09:00~18:00 (휴게 11:30~12:30)\nB조 10:00~19:00 (휴게 13:30~14:00)\nC조 12:00~21:00 (휴게 16:00~17:00)\n근무시간은 스케줄에 따라 변동될 수 있다.\n4시간 근무시 30분 이상, 8시간 근무시 1시간 이상의 휴게시간을 부여하며, 근로자는 휴게시간을 자유로이 이용할 수 있다. 단, 업무상 지정된 휴게시간을 이용할 수 없는 경우, 동일시간만큼 다른 시간으로 변경하여 이용한다.",
    },
    {
      title: "3. 휴일",
      content: [
        "○ 근로기준법 제55조(휴일) 조항은 근로계약서 필수기재사항인바, 휴일에 관한 조항이 누락되어 있음.",
        "○ 아래 예시를 참고하여 휴일 조항이 추가되어야 함.",
        "- 주휴일의 경우 요일을 특정하여 근로자가 사전에 휴일을 예측할 수 있게 해야 하고, 교대근무자의 경우에도 근무표상 주휴일을 규칙적으로 부여하여 휴일근로수당 등의 분쟁을 예방하는 것이 바람직함.",
      ],
      example: "[예시] 휴일\n근로자의 유급휴일은 아래와 같다.\n1. 주휴일 : 1주 소정근로일을 개근한 자에게 매주 1일의 주휴일을 유급으로 부여하며, 주휴일은 일요일로 한다. 스케줄 근무에 따라 근무일이 변경되는 경우 근로자의 주휴일은 매주 첫 번째 비번일로 한다.\n2. 관공서공휴일규정에 따른 공휴일(일요일 제외)\n3. 근로자의 날\n4. 취업규칙이 정한 약정휴일",
    },
  ];

  const sections = data?.sections || defaultSections;

  return (
    <div className="fixed inset-0 bg-gray-100 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between print:hidden flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">AI 노무의견서</h1>
            <p className="text-sm text-gray-500">
              공통의견서(전 분야 공통 템플릿)
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {showCompleteButton && (
            <button
              onClick={onComplete}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold text-sm"
            >
              의견서 작성완료하기
            </button>
          )}
          <button
            onClick={handlePrint}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="인쇄"
          >
            <Printer className="w-5 h-5" />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            title="다운로드"
          >
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Document Content - Scrollable */}
      <div className="flex-1 overflow-y-auto bg-gray-100">
        <div className="min-h-full p-6 flex justify-center">
          {/* A4 Paper */}
          <div className="bg-white shadow-2xl w-full max-w-[840px] rounded-2xl mb-6 print:shadow-none print:rounded-none print:max-w-full print:mb-0">
            {/* HEADER */}
            <header className="p-7 pb-5 border-b border-gray-200 bg-gradient-to-b from-gray-50 to-white">
              {/* Title */}
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                  AI 노무의견서
                </h1>
              </div>

              {/* 문서번호, 검토유형, 작성일 */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">문서번호</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {data?.referenceNo || "AI-LABOR-20250225-001"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">검토유형</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {data?.reviewType || "사전 리스크 검토"}
                  </div>
                </div>
                <div className="text-center p-3 bg-white border border-gray-200 rounded-xl">
                  <div className="text-xs text-gray-500 mb-1">작성일</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {data?.date || "2025. 02. 25."}
                  </div>
                </div>
              </div>
            </header>

            {/* CONTENT */}
            <section className="p-7 space-y-6">
              {/* ■ 질의 */}
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  ■ 질의
                </h2>
                <div className="text-sm text-gray-900 leading-relaxed space-y-2 pl-2">
                  {data?.queries && data.queries.length > 0 ? (
                    data.queries.map((query, index) => (
                      <p key={index} className="whitespace-pre-line">
                        ○ {query}
                      </p>
                    ))
                  ) : (
                    <>
                      <p className="whitespace-pre-line">
                        ○ 첨부한 근로계약서의 내용이 근로기준법 및 관련 법령에 부합하는지 검토 요청함.
                      </p>
                      <div className="pl-4 space-y-1">
                        <p>- 근로시간 및 스케줄 근무 관련 조항의 적법성</p>
                        <p>- 고정 OT(연장, 야간, 휴일근로 포함) 설정 방식</p>
                        <p>- 수습기간 중 본채용 취소 관련 조항</p>
                        <p>- 중도퇴사 및 근로계약 해지 사유 관련 조항</p>
                        <p>- 그 외 근로자에게 불리하거나 법적 분쟁 소지가 있는 사항</p>
                      </div>
                    </>
                  )}
                </div>
              </section>

              {/* ■ 회신 */}
              <section>
                <h2 className="text-base font-bold text-gray-900 mb-3">
                  ■ 회신
                </h2>
                <div className="text-sm text-gray-900 leading-relaxed pl-2">
                  <p className="whitespace-pre-line">
                    {data?.responsePreamble || (
                      <>
                        ○ 「근로기준법」(이하 "근기법") 제17조 및 동법 시행령 제8조에 따르면 사용자는 근로계약을 체결할 때에 ▲ 임금(구성항목, 계산방법, 지급방법), ▲ 소정근로시간, ▲ 휴일, ▲ 연차유급휴가, ▲ 취업의 장소와 종사하여야 할 업무에 관한 사항, ▲ 법 제93조제1호부터 제12호까지의 규정에서 정한 사항, ▲ 사업장의 부속 기숙사에 근로자를 기숙하게 하는 경우에는 기숙사 규칙에서 정한 사항을 명시해야 하며, 근로계약 체결 후 변경하는 경우에도 명시해야 할 의무를 부담함.
                        <br />
                        <br />
                        - 한편, 「기간제 및 단시간근로자 보호 등에 관한 법률」(이하 "기간제법") 제17조에 따르면 ▲ 근로계약기간에 관한 사항, ▲ 근로시간·휴게에 관한 사항, ▲ 임금의 구성항목·계산방법 및 지불방법에 관한 사항, ▲ 휴일·휴가에 관한 사항, ▲ 취업의 장소와 종사하여야 할 업무에 관한 사항, ▲ 근로일 및 근로일별 근로시간(단시간근로자에 한함)을 서면으로 명시해야 한다고 규정하고 있음.
                      </>
                    )}
                  </p>
                </div>
              </section>

              {/* 본문 섹션들 (1. 임금, 2. 근로시간 등) */}
              {sections.map((section, index) => (
                <section key={index} className="border-t border-gray-200 pt-6">
                  <h2 className="text-base font-bold text-gray-900 mb-3">
                    {section.title}
                  </h2>
                  
                  {/* 메인 콘텐츠 */}
                  <div className="text-sm text-gray-900 leading-relaxed space-y-2 pl-2">
                    {section.content.map((paragraph, pIndex) => (
                      <p key={pIndex} className="whitespace-pre-line">
                        {paragraph}
                      </p>
                    ))}
                  </div>

                  {/* 관련 판례 */}
                  {section.relatedCase && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line font-mono">
                        {section.relatedCase}
                      </p>
                    </div>
                  )}

                  {/* 관련 행정해석 */}
                  {section.relatedInterpretation && (
                    <div className="mt-3 bg-green-50 border border-green-200 rounded-lg p-3">
                      <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line font-mono">
                        {section.relatedInterpretation}
                      </p>
                    </div>
                  )}

                  {/* 예시 */}
                  {section.example && (
                    <div className="mt-3 bg-gray-50 border border-gray-300 rounded-lg p-3">
                      <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-line font-mono">
                        {section.example}
                      </p>
                    </div>
                  )}
                </section>
              ))}

              {/* AI 의견서 고지문 */}
              <section className="border-t-2 border-gray-300 pt-6 mt-8">
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                  <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
                    {data?.disclaimer || (
                      <>
                        본 AI 노무의견서는 의뢰인이 제공한 자료 및 진술을 기초로 현행 법령·판례에 따라 작성된 참고용 검토 의견입니다. 추후 사실관계의 변경, 법령 개정, 판례 변경 등에 따라 의견이 달라질 수 있으며, 행정기관 또는 법원의 최종 판단과 차이가 발생할 수 있습니다. 중요한 인사·노무 의사결정 전에는 공인노무사의 개별 자문을 권고드립니다.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex justify-end gap-2 text-xs text-gray-500 mt-4">
                  <span>작성 :</span>
                  <strong className="text-gray-900">
                    {data?.author || "[AI 노무 자문 모듈]"}
                  </strong>
                </div>
              </section>
            </section>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:max-w-full {
            max-width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
