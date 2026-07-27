// 기획 정책 챗봇 (내부 팀원용) — 별도 주소 /policy-bot.html 로 진입 (프로토타입과 분리)
//
// 서비스 기획/정책 스펙을 문서 기반으로 답해주는 내부 도구.
// 지식 베이스: docs/policies/*.md + ONBOARDING.md + Guidelines.md (policy-kb.ts)
// 답변 엔진: 기본 오프라인 검색 / VITE_POLICY_BOT_PROVIDER=llm 시 Claude 프록시

import { useEffect, useRef, useState } from "react";
import { BookOpenText, FileText, Send, Sparkles } from "lucide-react";
import {
  generatePolicyBotAnswer,
  PolicyBotSource,
} from "@/app/services/policy-bot-answer";
import { POLICY_DOCS } from "@/app/data/policy-kb";

interface BotMessage {
  role: "user" | "assistant";
  text: string;
  sources?: PolicyBotSource[];
  offline?: boolean;
}

const SUGGESTED_QUESTIONS = [
  "멀티턴 질문 횟수 정책이 어떻게 돼?",
  "의견서 작성 진입점은 어디로 단일화됐어?",
  "가드레일에 걸린 질문은 횟수에 포함돼?",
  "서비스 평가 모달은 언제 노출돼?",
  "플로팅 버튼 라벨은 어떻게 분기돼?",
];

const REPO_BLOB_URL = "https://github.com/Parkeric1104/Expert2prototype/blob/main/";

// 임베드 모드(위젯 iframe 안에서 열림): 헤더의 프로토타입 이동 링크를 숨기고 여백을 줄인다
const IS_EMBED = (() => {
  try {
    return new URLSearchParams(window.location.search).get("embed") === "1";
  } catch {
    return false;
  }
})();

export function PolicyBotView() {
  const [messages, setMessages] = useState<BotMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isLoading]);

  const llmEnabled = (import.meta.env.VITE_POLICY_BOT_PROVIDER as string) === "llm";

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || isLoading) return;
    setInput("");
    const history = messages.map((m) => ({ role: m.role, text: m.text }));
    setMessages((prev) => [...prev, { role: "user", text: q }]);
    setIsLoading(true);
    try {
      const answer = await generatePolicyBotAnswer({ question: q, history });
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: answer.body, sources: answer.sources, offline: answer.offline },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ wordBreak: "keep-all" }}>
      {/* 헤더 */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="mx-auto w-full max-w-3xl flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpenText className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-foreground">기획 정책 챗봇</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-semibold">
                  내부용
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                문서 {POLICY_DOCS.length}개 기반 · {llmEnabled ? "Claude 연동" : "오프라인 검색 모드"}
              </p>
            </div>
          </div>
          {!IS_EMBED && (
            <a
              href="./"
              className="px-4 py-2 rounded-full text-xs font-medium bg-card border border-border text-foreground/70 hover:border-primary/40 transition-all"
            >
              프로토타입으로
            </a>
          )}
        </div>
      </header>

      {/* 대화 영역 */}
      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-6">
        <div className="mx-auto w-full max-w-3xl pb-6">
          {messages.length === 0 && (
            <div className={`${IS_EMBED ? "pt-2" : "pt-10"} animate-in fade-in duration-300`}>
              <h1 className={`${IS_EMBED ? "text-lg" : "text-[22px]"} font-bold text-foreground mb-2`}>
                세법/노무 도우미의 기획 정책, 무엇이든 물어보세요
              </h1>
              <p className="text-sm text-muted-foreground mb-6">
                답변 유형·멀티턴 횟수·의견서 플로우·피드백 게이팅 등 코드에 확정된 정책을
                문서 기반으로 찾아 답해드려요.
              </p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => ask(q)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-card border border-border text-foreground/70 hover:border-primary/40 hover:bg-primary/5 transition-all"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) =>
            m.role === "user" ? (
              <div key={i} className="flex justify-end mt-6">
                <div className="bg-primary text-primary-foreground rounded-2xl px-5 py-3 text-sm max-w-[80%]">
                  {m.text}
                </div>
              </div>
            ) : (
              <div key={i} className="mt-4 animate-in fade-in duration-300">
                <div className="bg-card border border-border/60 rounded-2xl px-6 py-5 shadow-sm">
                  <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
                    {m.text}
                  </p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-[11px] font-semibold text-muted-foreground mb-2">근거 문서</p>
                      <div className="flex flex-col gap-1.5">
                        {m.sources.map((s, j) => (
                          <a
                            key={j}
                            href={`${REPO_BLOB_URL}${s.path}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs text-primary hover:underline w-fit"
                          >
                            <FileText className="w-3 h-3" />
                            {s.doc} › {s.section}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                  {m.offline && (
                    <p className="text-[11px] text-muted-foreground mt-3">
                      오프라인 검색 모드 — 관련 문서 발췌를 그대로 보여드려요. Claude 연동 시 요약
                      답변으로 전환됩니다.
                    </p>
                  )}
                </div>
              </div>
            ),
          )}

          {isLoading && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              정책 문서를 찾는 중
              <span className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-0.5 bg-primary animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="px-6 pb-6">
        <div className="mx-auto w-full max-w-3xl">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              ask(input);
            }}
            className="flex items-center gap-2 bg-card border border-border/60 rounded-2xl shadow-sm pl-5 pr-2 py-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="기획 정책에 대해 질문하세요 (예: 멀티턴은 몇 회까지?)"
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="h-9 w-9 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all disabled:bg-muted disabled:text-muted-foreground/50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-3">
            내부 팀원용 도구입니다. 답변은 저장소 문서 기준이며, 최신 확정 정책은 기획 담당자에게
            확인하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
