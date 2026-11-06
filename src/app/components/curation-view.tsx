import { ArrowLeft, Megaphone, ChevronRight } from "lucide-react";
import { getCurationSet, ddayLabel } from "@/app/data/curation";

// 체크포인트 전체 페이지(전체화면). 홈 '체크포인트 > 더보기' → 페이지 전환으로 진입.
// 각 항목 클릭 시 추천질문과 동일하게 질문을 바로 시작한다(onSelectQuestion).
export function CurationView({
  onBack,
  onSelectQuestion,
}: {
  onBack: () => void;
  onSelectQuestion: (question: string, laws: string[]) => void;
}) {
  const { caption, items } = getCurationSet();

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* 상단: 메인으로 돌아가기 */}
      <header className="flex-shrink-0 bg-card border-b border-border">
        <div className="h-14 flex items-center px-6">
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            메인으로 돌아가기
          </button>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4 py-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Megaphone className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">{caption}</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-5" style={{ wordBreak: "keep-all" }}>
            지금 챙겨야 할 세무·노무 일정입니다. 항목을 선택하면 바로 질문이 시작됩니다.
          </p>

          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i}>
                <button
                  onClick={() => onSelectQuestion(it.question, it.laws)}
                  className="group w-full text-left px-4 py-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3"
                >
                  <span className="flex-1 min-w-0">
                    <span className="flex items-center gap-2">
                      <span className="text-[15px] font-bold text-foreground" style={{ wordBreak: "keep-all" }}>{it.title}</span>
                      <span className="text-[11px] font-extrabold text-white bg-rose-500 rounded-md px-2 py-0.5 flex-shrink-0">{ddayLabel(it.deadline)}</span>
                    </span>
                    <span className="block text-[12.5px] text-muted-foreground mt-1" style={{ wordBreak: "keep-all" }}>{it.sub}</span>
                    {it.laws.length > 0 && (
                      <span className="mt-2 flex flex-wrap gap-1.5">
                        {it.laws.map((law, li) => (
                          <span key={li} className="text-[11px] font-medium text-primary bg-primary/10 rounded-md px-2 py-0.5">{law}</span>
                        ))}
                      </span>
                    )}
                  </span>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/60 group-hover:text-primary flex-shrink-0 transition-colors" />
                </button>
              </li>
            ))}
            {items.length === 0 && <p className="py-16 text-center text-sm text-muted-foreground">등록된 체크포인트가 없습니다.</p>}
          </ul>
        </div>
      </div>
    </div>
  );
}
