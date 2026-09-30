import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Check } from "lucide-react";

/**
 * 답변 소스(RAG) 선택 — 근복단 PE 요구사항(+add).
 * Gemini 모델 선택기 방식 차용: 버튼에 현재 선택값 표시(Default / 클라이온), 메뉴는 ✓ 목록.
 * Default = 기존 로직(내부 표준 법령 지식베이스).
 * 클라이온 = 기존 로직(Default) + 클라이온 RAG(공단 지식베이스) 병행(additive, +add).
 * 입력 바 우측 클러스터(파일첨부·전송)와 어울리는 pill. 메뉴는 포털(fixed)로 렌더(카드 overflow 클리핑 회피).
 */
const OPTIONS = [
  { v: false, label: "Default", desc: "내부 표준 법령 지식베이스" },
  { v: true, label: "클라이온", desc: "기본(내부) + 공단 지식베이스 병행" },
];
const MENU_W = 240;

export function RagSourceSelect({
  value,
  onChange,
}: {
  value: boolean; // true = 클라이온 / false = Default(내부)
  onChange: (v: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ left: number; bottom: number } | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  const toggle = () => {
    if (!open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      const left = Math.max(8, r.right - MENU_W); // 메뉴 우측을 버튼 우측에 맞춤(화면 넘침 방지)
      setPos({ left, bottom: window.innerHeight - r.top + 8 });
    }
    setOpen((o) => !o);
  };

  return (
    <div className="relative flex-shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-haspopup="menu"
        aria-expanded={open}
        title="답변 출처 선택"
        className={`h-9 px-3.5 inline-flex items-center rounded-full border text-sm font-semibold transition-colors ${
          value ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-foreground/80 hover:bg-muted/60"
        }`}
      >
        {value ? "클라이온" : "Default"}
      </button>
      {open && pos && createPortal(
        <>
          <div className="fixed inset-0 z-[80]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[81] w-60 bg-card border border-border rounded-2xl shadow-xl p-1.5"
            style={{ left: pos.left, bottom: pos.bottom }}
          >
            <p className="px-2.5 pt-1.5 pb-1 text-xs font-semibold text-muted-foreground">답변 출처</p>
            {OPTIONS.map((o) => (
              <button
                key={String(o.v)}
                type="button"
                onClick={() => { onChange(o.v); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-muted/60 text-left transition-colors"
              >
                <span className="w-4 flex-shrink-0 flex items-center justify-center">
                  {value === o.v && <Check className="w-4 h-4 text-primary" />}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-foreground">{o.label}</span>
                  <span className="block text-xs text-muted-foreground" style={{ wordBreak: "keep-all" }}>{o.desc}</span>
                </span>
              </button>
            ))}
          </div>
        </>,
        document.body
      )}
    </div>
  );
}

/** 근복단 PE 노출 플래그 — 운영·단독 서비스 미노출. 프로토타입 기본 노출, ?klleon=off 로 숨김. */
export function showRagSelect(): boolean {
  if (typeof window === "undefined") return true;
  return new URLSearchParams(window.location.search).get("klleon") !== "off";
}
