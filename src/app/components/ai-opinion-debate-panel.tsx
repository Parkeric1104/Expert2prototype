import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import characterImg from "@/assets/ba68b3d133c0b0eab30536be7e6ef8ec6cdf174e.png";

type Speaker = "host" | "pro" | "con";

interface ScriptLine {
  speaker: Speaker;
  text: string;
}

interface AIOpinionDebatePanelProps {
  isOpen: boolean;
  onClose: () => void;
  question: string;
  proPoint: string; // AI 엄격한 법률학자 핵심
  conPoint: string; // AI 실무형 분석가 핵심
  summary: string; // 사회자 마무리(종합)
  reflected: boolean; // 이미 반영됨
  onReflect: () => void; // AI 의견 반영
  onDelete: () => void; // AI 의견 반영 삭제
}

const PERSONAS = {
  host: { name: "사회자(도비)", ring: "ring-indigo-300", color: "text-indigo-600 dark:text-indigo-400", tags: ["중립형", "조정형", "객관형"], desc: "토론자들의 성향을 이해하고 균형있게 대화를 조율하는 중립적·조정형 가이드" },
  pro: { name: "AI 엄격한 법률학자", ring: "ring-blue-300", color: "text-blue-600 dark:text-blue-400", tags: ["보수형", "위험회피형", "분석형"], desc: "법리에 철저한 보수적·엄격형 분석. 신중하고 원칙주의적 성격으로, 위험 감지에 예민하다." },
  con: { name: "AI 실무형 분석가", ring: "ring-purple-300", color: "text-purple-600 dark:text-purple-400", tags: ["현실형", "합리형", "공감형"], desc: "납세자의 권리를 중시하는 합리적·실무형 분석. 현실감각과 유연한 사고로, 실질적인 해법을 제시한다." },
};

export function AIOpinionDebatePanel({
  isOpen,
  onClose,
  question,
  proPoint,
  conPoint,
  summary,
  reflected,
  onReflect,
  onDelete,
}: AIOpinionDebatePanelProps) {
  // 토론 스크립트: 사회자 → 법률학자(1) → 분석가(1) → 법률학자(2) → 분석가(2) → 사회자 마무리
  const script: ScriptLine[] = [
    { speaker: "host", text: `안녕하십니까, 오늘 토론의 주제는 "${question}"입니다. 본 사안은 형식이 아닌 실질을 중심으로 판단해야 한다는 점에서 중요합니다. 먼저 법률학자님께서 의견을 말씀해 주시기 바랍니다.` },
    { speaker: "pro", text: proPoint },
    { speaker: "con", text: conPoint },
    { speaker: "pro", text: `덧붙이자면, 관련 법령과 판례의 엄격한 기준을 고려할 때 형식적 요건뿐 아니라 객관적 증빙이 충분히 갖춰져야 합니다. 입증이 미흡하면 추후 분쟁에서 불리할 수 있으므로 신중한 접근이 필요합니다.` },
    { speaker: "con", text: `다만 실무적으로는 현실적인 사실관계와 입증 가능성을 함께 살펴야 합니다. 형식만으로 단정하기보다 실제 운영 정황을 종합적으로 검토하면 합리적인 해법을 찾을 수 있습니다.` },
    { speaker: "host", text: summary || "양측의 의견을 종합하면, 형식이 아닌 실질적 사실관계를 종합적으로 검토하는 것이 핵심입니다. 이상으로 토론을 마치겠습니다." },
  ];

  // 스트리밍 상태
  const [shownCount, setShownCount] = useState(0); // 완료된 메시지 수
  const [typingText, setTypingText] = useState(""); // 현재 타이핑 중 텍스트
  const [done, setDone] = useState(false);
  const [reflecting, setReflecting] = useState(false);
  const timersRef = useRef<number[]>([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };

  useEffect(() => {
    if (!isOpen) return;
    clearTimers();
    setReflecting(false);

    if (reflected) {
      // 이미 반영됨: 전체 즉시 표시
      setShownCount(script.length);
      setTypingText("");
      setDone(true);
      return;
    }

    // 스트리밍 시작
    setShownCount(0);
    setTypingText("");
    setDone(false);

    const runLine = (i: number) => {
      if (i >= script.length) {
        setDone(true);
        return;
      }
      const full = script[i].text;
      let pos = 0;
      const step = Math.max(2, Math.ceil(full.length / 40));
      const interval = window.setInterval(() => {
        pos = Math.min(full.length, pos + step);
        setTypingText(full.slice(0, pos));
        if (pos >= full.length) {
          clearInterval(interval);
          // 현재 메시지 확정
          setShownCount(i + 1);
          setTypingText("");
          const next = window.setTimeout(() => runLine(i + 1), 450);
          timersRef.current.push(next);
        }
      }, 16);
      timersRef.current.push(interval as unknown as number);
    };
    const start = window.setTimeout(() => runLine(0), 500);
    timersRef.current.push(start);

    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, reflected]);

  if (!isOpen) return null;

  const handleReflect = () => {
    setReflecting(true);
    const t = window.setTimeout(() => {
      onReflect();
      setReflecting(false);
    }, 1600);
    timersRef.current.push(t);
  };

  const Avatar = ({ p }: { p: Speaker }) => (
    <div className={`w-9 h-9 rounded-full overflow-hidden ring-2 ${PERSONAS[p].ring} flex-shrink-0`}>
      <img src={characterImg} alt="" className="w-full h-full object-cover" />
    </div>
  );

  const renderBubble = (line: ScriptLine, idx: number, text: string) => {
    const p = PERSONAS[line.speaker];
    const right = line.speaker === "pro"; // 법률학자는 우측 정렬
    return (
      <div key={idx} className={`flex flex-col gap-1.5 ${right ? "items-end" : "items-start"}`}>
        <div className={`flex items-center gap-2 ${right ? "flex-row-reverse" : ""}`}>
          <Avatar p={line.speaker} />
          <span className={`text-sm font-bold ${p.color}`}>{p.name}</span>
        </div>
        <div
          className={`max-w-[88%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
            line.speaker === "pro"
              ? "bg-blue-500 text-white"
              : line.speaker === "con"
              ? "bg-purple-100 dark:bg-purple-950/40 text-foreground"
              : "bg-muted text-foreground"
          }`}
        >
          {text}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-3xl bg-background border-l border-border shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-bold text-foreground">AI 상세의견 · 토론</h2>
          <button onClick={onClose} aria-label="닫기" className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* 페르소나 소개 카드 */}
          <div className="grid grid-cols-3 gap-3">
            {(["host", "pro", "con"] as Speaker[]).map((p) => (
              <div key={p} className="rounded-2xl bg-muted/50 p-4 flex flex-col items-center text-center">
                <Avatar p={p} />
                <p className="text-sm font-bold text-foreground mt-2">{PERSONAS[p].name}</p>
                <div className="flex flex-wrap justify-center gap-1 mt-2">
                  {PERSONAS[p].tags.map((t) => (
                    <span key={t} className={`px-1.5 py-0.5 rounded text-[10px] font-semibold bg-card ${PERSONAS[p].color}`}>{t}</span>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground mt-2 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                  {PERSONAS[p].desc}
                </p>
              </div>
            ))}
          </div>

          {/* 입장 안내 */}
          <div className="flex flex-col items-center gap-1.5">
            {(["host", "pro", "con"] as Speaker[]).map((p) => (
              <span key={p} className="px-3 py-1.5 rounded-full bg-muted/60 text-xs text-muted-foreground">
                {PERSONAS[p].name}님이 토론방에 입장하였습니다.
              </span>
            ))}
          </div>

          {/* 토론 메시지 */}
          <div className="space-y-5">
            {script.slice(0, shownCount).map((line, idx) => renderBubble(line, idx, line.text))}
            {!done && shownCount < script.length && typingText && renderBubble(script[shownCount], shownCount, typingText + "▌")}
          </div>
        </div>

        {/* 하단 액션 */}
        <div className="border-t border-border px-6 py-4 flex-shrink-0">
          {done && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                  <img src={characterImg} alt="" className="w-full h-full object-cover" />
                </div>
                <p className="text-sm font-semibold text-primary" style={{ wordBreak: "keep-all" }}>
                  {reflected ? "AI 의견이 이미 반영되었습니다." : "AI 의견을 반영하시겠습니까?"}
                </p>
              </div>
              <div className="flex items-center flex-shrink-0">
                {reflected ? (
                  <button onClick={onDelete} className="px-5 py-2 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors">
                    삭제하기
                  </button>
                ) : (
                  <button onClick={handleReflect} className="px-5 py-2 rounded-full text-sm font-semibold text-white bg-primary hover:bg-primary/90 transition-colors">
                    AI 의견 반영하기
                  </button>
                )}
              </div>
            </div>
          )}
          {!done && (
            <p className="text-center text-sm text-muted-foreground">AI들이 토론을 진행하고 있어요…</p>
          )}
        </div>
      </div>

      {/* 반영 중 로딩 팝업 */}
      {reflecting && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-2xl px-10 py-8 flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-full overflow-hidden">
              <img src={characterImg} alt="" className="w-full h-full object-cover" />
            </div>
            <p className="text-sm font-bold text-primary">AI 의견을 반영하고 있습니다.</p>
          </div>
        </div>
      )}
    </>
  );
}
