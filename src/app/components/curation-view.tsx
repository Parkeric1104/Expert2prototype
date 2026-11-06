import { useState } from "react";
import { ArrowLeft, Megaphone, ChevronRight, ChevronLeft } from "lucide-react";
import { getCurationSet, ddayLabel, type CurationItem } from "@/app/data/curation";

// 체크포인트 전체 페이지(전체화면). 홈 '체크포인트 > 더보기' → 페이지 전환으로 진입.
// 목록: 상단 '메인으로 돌아가기' 바 노출.
// 상세: 공지 상세와 동일 구조(상단 GNB 미노출 몰입형) + 하단 고정 바('목록으로' / '이 내용으로 질문하기').
//   - 항목 클릭 → 상세에서 본문·근거 법령 확인 → CTA로 질문 시작(onSelectQuestion).
export function CurationView({
  onBack,
  onSelectQuestion,
  initialItem = null,
}: {
  onBack: () => void;
  onSelectQuestion: (question: string, laws: string[]) => void;
  initialItem?: CurationItem | null; // 메인 항목 클릭 진입 시 바로 상세로 노출(더보기는 목록)
}) {
  const { caption, items } = getCurationSet();
  const [selected, setSelected] = useState<CurationItem | null>(initialItem);

  // ── 상세: 공지 상세와 동일(상단 GNB 미노출 + 하단 고정 바) ─────────────
  if (selected) {
    return (
      <div className="flex-1 min-h-0 flex flex-col">
        {/* 본문(고정 영역, 내부 스크롤) */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <article className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4 py-8">
            <div className="flex items-start justify-between gap-4 mb-4 pb-4 border-b border-border">
              <h2 className="flex-1 min-w-0 text-2xl font-bold text-foreground" style={{ wordBreak: "keep-all" }}>{selected.title}</h2>
              <div className="flex-shrink-0 text-right text-xs text-muted-foreground space-y-1 pt-1">
                <div>마감 {selected.deadline.replace(/-/g, ".")}</div>
                <div className="inline-block text-[11px] font-extrabold text-white bg-rose-500 rounded-md px-2 py-0.5">{ddayLabel(selected.deadline)}</div>
              </div>
            </div>

            {selected.body ? (
              <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line" style={{ wordBreak: "keep-all" }}>{selected.body}</p>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>{selected.sub}</p>
            )}

            {selected.laws.length > 0 && (
              <div className="mt-6">
                <p className="text-xs font-semibold text-muted-foreground mb-2">근거 법령</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.laws.map((law, li) => (
                    <span key={li} className="text-[12px] font-medium text-primary bg-primary/10 rounded-md px-2.5 py-1">{law}</span>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* 하단 고정: 본문과 동일 배경, 구분선으로만 분리. 좌 '목록으로' / 우 질문 CTA */}
        <div className="flex-shrink-0">
          <div className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4">
            <div className="border-t border-border py-4 flex items-center justify-between gap-3">
              <button
                onClick={() => setSelected(null)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                목록으로
              </button>
              <button
                onClick={() => onSelectQuestion(selected.question, selected.laws)}
                className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                이 내용으로 질문하기
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── 목록 ──────────────────────────────────────────────
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
            지금 챙겨야 할 세무·노무 일정입니다. 항목을 선택하면 상세 내용을 확인하고 질문을 시작할 수 있습니다.
          </p>

          <ul className="space-y-2">
            {items.map((it, i) => (
              <li key={i}>
                <button
                  onClick={() => setSelected(it)}
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
