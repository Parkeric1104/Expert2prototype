import { useState } from "react";
import { ArrowLeft, Megaphone, ChevronRight, ChevronLeft, X, ArrowUp, MessageSquarePlus } from "lucide-react";
import { getCurationSet, ddayLabel, type CurationItem } from "@/app/data/curation";
import { LawCenterView } from "@/app/components/law-viewer-panel";

// 체크포인트 전체 페이지(전체화면). 홈 '체크포인트 > 더보기' → 페이지 전환으로 진입.
// 목록: 상단 '메인으로 돌아가기' 바 노출.
// 상세: 공지 상세와 동일 구조(상단 GNB 미노출 몰입형) + 하단 고정 바('목록으로' / '이 내용으로 질문하기').
//   - 항목 클릭 → 상세에서 본문·근거 법령 확인 → CTA로 질문 시작(onSelectQuestion).
export function CurationView({
  onBack,
  initialItem = null,
  onAskQuestion,
}: {
  onBack: () => void;
  initialItem?: CurationItem | null; // 메인 항목 클릭 진입 시 바로 상세로 노출(더보기는 목록)
  onAskQuestion?: (question: string, laws: string[]) => void; // 상세에서 직접 입력한 질문으로 대화 시작
}) {
  const { caption, items } = getCurationSet();
  const [selected, setSelected] = useState<CurationItem | null>(initialItem);
  const [lawRef, setLawRef] = useState<string | null>(null); // 근거법령 칩 클릭 → 법령 뷰어 패널
  const [asking, setAsking] = useState(false); // 하단 '질문하기' → 질문 입력창 즉시 노출
  const [askText, setAskText] = useState("");

  const submitAsk = () => {
    const q = askText.trim();
    if (!q || !selected) return;
    onAskQuestion?.(q, selected.laws); // 체크포인트 근거법령을 관련 법령으로 전달
  };
  const openItem = (it: CurationItem) => { setSelected(it); setAsking(false); setAskText(""); };

  // ── 상세: 공지 상세와 동일(상단 GNB 미노출 + 하단 고정 바) ─────────────
  if (selected) {
    return (
      <div className="flex-1 min-h-0 flex">
      {/* 상세 본문 컬럼 — 법령 패널이 열리면 폭이 줄며 옆으로 밀림(오버레이 아님) */}
      <div className="flex-1 min-w-0 flex flex-col">
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
                <p className="text-xs font-semibold text-muted-foreground mb-2">근거 법령 <span className="font-normal text-muted-foreground/70">· 선택하면 원문을 볼 수 있어요</span></p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.laws.map((law, li) => (
                    <button
                      key={li}
                      onClick={() => setLawRef(law)}
                      className="text-[12px] font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md px-2.5 py-1 transition-colors"
                    >
                      {law}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>

        {/* 하단 고정: 본문과 동일 배경, 구분선으로만 분리. 좌 '목록으로' / 우 질문 CTA */}
        <div className="flex-shrink-0">
          <div className="w-full max-w-[760px] mx-auto px-6 max-sm:px-4">
            {asking ? (
              <div className="border-t border-border py-3">
                <div className="flex items-end gap-2">
                  <textarea
                    autoFocus
                    value={askText}
                    onChange={(e) => setAskText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submitAsk(); } }}
                    placeholder="이 체크포인트에 대해 궁금한 점을 입력해 보세요."
                    rows={1}
                    className="flex-1 resize-none px-3.5 py-2.5 rounded-xl border border-border bg-card text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors placeholder:text-muted-foreground/70"
                    style={{ maxHeight: 120 }}
                  />
                  <button
                    onClick={submitAsk}
                    disabled={!askText.trim()}
                    aria-label="질문 보내기"
                    className="h-10 w-10 flex-shrink-0 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground/50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
                <button
                  onClick={() => { setAsking(false); setAskText(""); }}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  닫기
                </button>
              </div>
            ) : (
              <div className="border-t border-border py-4 flex items-center justify-between gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground/80 hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  목록으로
                </button>
                <button
                  onClick={() => setAsking(true)}
                  className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  질문하기
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 우측 법령 패널 — 본문을 밀어 나란히(split). 오버레이/딤 없음 */}
      {lawRef && (
        <aside className="w-[440px] max-lg:w-[380px] flex-shrink-0 border-l border-border bg-card flex flex-col">
          <div className="flex items-center justify-between px-5 h-14 border-b border-border flex-shrink-0">
            <h2 className="text-base font-bold text-foreground">법령 원문</h2>
            <button
              onClick={() => setLawRef(null)}
              aria-label="닫기"
              className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <LawCenterView lawRef={lawRef} />
          </div>
        </aside>
      )}
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
                  onClick={() => openItem(it)}
                  className="group w-full text-left px-4 py-4 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all flex items-center gap-3"
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-[15px] font-bold text-foreground" style={{ wordBreak: "keep-all" }}>{it.title}</span>
                    <span className="block text-[12.5px] text-muted-foreground mt-1" style={{ wordBreak: "keep-all" }}>{it.sub}</span>
                  </span>
                  <span className="text-[11px] font-extrabold text-white bg-rose-500 rounded-md px-2 py-0.5 flex-shrink-0">{ddayLabel(it.deadline)}</span>
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
