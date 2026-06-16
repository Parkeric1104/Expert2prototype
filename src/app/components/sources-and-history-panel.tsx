import { useState } from "react";
import {
  X, Scale, FileText, Gavel, Globe,
  ChevronDown, ChevronUp, RotateCcw, ExternalLink,
} from "lucide-react";

export type SourceType = "법령" | "해석례" | "사규" | "판례";

export interface PanelSource {
  type: SourceType;
  title: string;
  url?: string;
  content?: string;
}

// ─── 탐색 기록 생성 ───────────────────────────────────────────────
interface HistoryItem {
  kind: "globe" | "dot" | "document" | "reflect";
  text: string;
  multiline?: boolean;
}

function parseArticleNumber(title: string): string | null {
  const m = title.match(/제(\d+)조/);
  return m ? m[1] : null;
}

function parseLawName(title: string): string {
  return title.split(" ")[0] || title;
}

function generateHistoryItems(sources: PanelSource[]): HistoryItem[] {
  const lawSources = sources.filter((s) => s.type === "법령" || s.type === "사규");
  const caseSources = sources.filter((s) => s.type === "해석례" || s.type === "판례");
  const items: HistoryItem[] = [];

  // 1) 질문 분석 단계
  items.push({ kind: "globe", text: "질문을 분석하고 관련 법령을 탐색하고 있어요" });

  // 2) 관련 법령 조문 확인
  const seen = new Set<string>();
  for (const law of lawSources) {
    if (seen.has(law.title)) continue;
    seen.add(law.title);
    const name = parseLawName(law.title);
    const num = parseArticleNumber(law.title);
    const articleLabel = num ? `${name} 제${num}조` : law.title;
    const preview = law.content?.replace(/\n+/g, " ").trim().substring(0, 70) ?? "";
    items.push({
      kind: "document",
      text: preview ? `${articleLabel} 확인\n${preview}…` : `${articleLabel} 확인`,
      multiline: !!preview,
    });
  }

  // 3) 해석례·판례 확인
  for (const c of caseSources) {
    items.push({
      kind: "document",
      text: `${c.type} 검토 — ${getSourceDisplayTitle(c)}`,
    });
  }

  // 4) 관련성 검토 단계
  items.push({ kind: "reflect", text: "찾은 자료의 관련성을 검토하고 있어요" });
  items.push({
    kind: "dot",
    text: `총 ${sources.length}건의 근거 자료에서 답변에 필요한 핵심 내용을 정리했어요`,
  });
  return items;
}

// ─── 출처 표시 헬퍼 ──────────────────────────────────────────────
export function getSourceDisplayTitle(source: PanelSource): string {
  if (source.type === "해석례") {
    if (source.title.startsWith("#")) return source.title;
    const bare = source.title.split(" ")[0].split("(")[0].trim();
    return `#${bare}`;
  }
  return source.title;
}

export function getSourceSubtitle(source: PanelSource): string {
  if (source.type === "해석례") {
    const m = source.content?.match(/【질의요지】\s*([^\n【]+)/);
    if (m) return m[1].trim();
    return source.content?.split("\n")[0]?.substring(0, 50) ?? "";
  }
  if (source.type === "판례") {
    const m =
      source.content?.match(/【판시사항】\s*([^\n【]+)/) ??
      source.content?.match(/【제목】\s*([^\n【]+)/);
    if (m) return m[1].trim();
  }
  const p = source.title.match(/\(([^)]+)\)/);
  return p ? p[1] : "";
}

// ─── 인용 항 하이라이트 (REQ-02) ─────────────────────────────────
const CIRCLED_NUMS = ["①","②","③","④","⑤","⑥","⑦","⑧","⑨","⑩","⑪","⑫","⑬","⑭","⑮"];

// 출처 제목에서 인용된 항/호/목 마커를 추출 (예: "제37조 제1항 제1호 라목")
function getHighlightMarkers(title: string): string[] {
  const markers: string[] = [];
  const hang = title.match(/제(\d+)항/);
  if (hang) {
    const n = parseInt(hang[1], 10);
    if (CIRCLED_NUMS[n - 1]) markers.push(CIRCLED_NUMS[n - 1]);
  }
  const ho = title.match(/제(\d+)호/);
  if (ho) markers.push(`${ho[1]}.`);
  const mok = title.match(/([가-하])목/);
  if (mok) markers.push(`${mok[1]}.`);
  return markers;
}

// 조문 본문을 렌더링하되, 인용된 항/호/목 줄을 강조
function HighlightedContent({ content, title }: { content: string; title: string }) {
  const markers = getHighlightMarkers(title);
  if (markers.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">
        {content}
      </p>
    );
  }
  const lines = content.split("\n");
  return (
    <div className="text-sm leading-relaxed text-foreground">
      {lines.map((line, i) => {
        const trimmed = line.trimStart();
        const hit = trimmed.length > 0 && markers.some((m) => trimmed.startsWith(m));
        if (hit) {
          return (
            <p
              key={i}
              className="bg-amber-100 dark:bg-amber-500/20 rounded px-1.5 py-0.5 -mx-1.5 my-0.5 font-medium whitespace-pre-line"
            >
              {line}
            </p>
          );
        }
        return (
          <p key={i} className="whitespace-pre-line">
            {line || " "}
          </p>
        );
      })}
    </div>
  );
}

const TYPE_BADGE: Record<SourceType, string> = {
  법령:  "border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-300",
  사규:  "border-indigo-300 text-indigo-600 bg-indigo-50 dark:bg-indigo-950/30 dark:text-indigo-300",
  해석례: "border-emerald-300 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-300",
  판례:  "border-purple-300 text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-300",
};

type MainTab = "sources" | "history";
type SourceSubTab = "법령" | "해석례" | "판례";

// ─── 순수 콘텐츠 (오버레이 없음, 재사용 가능) ───────────────────
interface SourcesContentProps {
  sources: PanelSource[];
  initialSelectedTitle?: string;
}

export function SourcesContent({ sources, initialSelectedTitle }: SourcesContentProps) {
  const resolveInitialSubTab = (): SourceSubTab => {
    if (!initialSelectedTitle) return "법령";
    const src = sources.find(
      (s) => s.title === initialSelectedTitle || getSourceDisplayTitle(s) === initialSelectedTitle
    );
    if (!src) return "법령";
    if (src.type === "해석례") return "해석례";
    if (src.type === "판례") return "판례";
    return "법령";
  };

  const [mainTab, setMainTab] = useState<MainTab>("sources");
  const [subTab, setSubTab] = useState<SourceSubTab>(resolveInitialSubTab);
  const [expanded, setExpanded] = useState<Set<string>>(() =>
    initialSelectedTitle ? new Set([initialSelectedTitle]) : new Set()
  );

  const totalCount = sources.length;

  const filtered = sources.filter((s) => {
    if (subTab === "법령") return s.type === "법령" || s.type === "사규";
    if (subTab === "해석례") return s.type === "해석례";
    if (subTab === "판례") return s.type === "판례";
    return false;
  });

  const toggleExpand = (title: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(title)) next.delete(title);
      else next.add(title);
      return next;
    });
  };

  const historyItems = generateHistoryItems(sources);

  const HistoryIcon = ({ kind }: { kind: HistoryItem["kind"] }) => {
    if (kind === "globe") return <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
    if (kind === "reflect") return <RotateCcw className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
    if (kind === "document")
      return (
        <div className="w-4 h-4 rounded flex-shrink-0 bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
          <FileText className="w-2.5 h-2.5 text-indigo-600 dark:text-indigo-400" />
        </div>
      );
    return (
      <div className="w-4 h-4 rounded-full flex-shrink-0 bg-muted flex items-center justify-center">
        <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
      </div>
    );
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* 메인 탭 */}
      <div className="flex border-b border-border flex-shrink-0">
        {([
          { id: "sources" as MainTab, label: `출처 ${totalCount}` },
          { id: "history" as MainTab, label: "탐색 기록" },
        ]).map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setMainTab(id)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              mainTab === id
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── 출처 탭 ── */}
      {mainTab === "sources" && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* 서브 탭 */}
          <div className="flex items-end px-5 border-b border-border flex-shrink-0">
            {(["법령", "해석례", "판례"] as SourceSubTab[]).map((tab) => {
              const Icon = tab === "법령" ? Scale : tab === "해석례" ? FileText : Gavel;
              return (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab)}
                  className={`flex items-center gap-1.5 mr-5 pb-3 pt-3 text-sm transition-colors ${
                    subTab === tab
                      ? "text-foreground font-semibold border-b-2 border-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab}
                </button>
              );
            })}
          </div>

          {/* 판례/해석례 검색 버튼 */}
          {(subTab === "해석례" || subTab === "판례") && (
            <div className="flex justify-end px-5 pt-3 flex-shrink-0">
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-indigo-300 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 text-xs font-medium hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />
                판례/해석례 검색
              </button>
            </div>
          )}

          {/* 아코디언 목록 */}
          <div className="flex-1 overflow-y-auto divide-y divide-border">
            {filtered.length === 0 ? (
              <div className="p-10 text-center">
                <p className="text-sm text-muted-foreground">해당하는 출처가 없습니다.</p>
              </div>
            ) : (
              filtered.map((src, idx) => {
                const isOpen = expanded.has(src.title);
                const subtitle = getSourceSubtitle(src);
                return (
                  <div key={idx}>
                    <button
                      onClick={() => toggleExpand(src.title)}
                      className="w-full text-left px-5 py-4 hover:bg-muted/40 transition-colors flex items-start justify-between gap-3"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-primary leading-snug">
                          {getSourceDisplayTitle(src)}
                        </p>
                        {subtitle && (
                          <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">
                            {subtitle}
                          </p>
                        )}
                      </div>
                      {isOpen
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      }
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 bg-muted/20">
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${TYPE_BADGE[src.type]}`}>
                            {src.type}
                          </span>
                          {getHighlightMarkers(src.title).length > 0 && (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400">
                              답변에 인용된 조항이 강조 표시됩니다
                            </span>
                          )}
                        </div>
                        <HighlightedContent
                          content={src.content ?? "내용이 준비 중입니다."}
                          title={src.title}
                        />
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 mt-4 text-xs font-medium text-primary hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            law.go.kr에서 원문 새 창으로 보기
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ── 탐색 기록 탭 ── */}
      {mainTab === "history" && (
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {historyItems.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div className="mt-0.5">
                <HistoryIcon kind={item.kind} />
              </div>
              <p className={`text-xs leading-relaxed text-foreground ${
                item.kind === "globe" || item.kind === "reflect" ? "text-sm font-semibold" : ""
              } ${item.multiline ? "whitespace-pre-line" : ""}`}>
                {item.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 오버레이 패널 (빠른 답변 모드용) ────────────────────────────
interface SourcesAndHistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  sources: PanelSource[];
  initialSelectedTitle?: string;
}

export function SourcesAndHistoryPanel({
  isOpen,
  onClose,
  sources,
  initialSelectedTitle,
}: SourcesAndHistoryPanelProps) {
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-[480px] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300" >
        {/* Header */}
        <div className="flex items-center justify-between px-5 h-14 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">출처 및 탐색기록</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SourcesContent sources={sources} initialSelectedTitle={initialSelectedTitle} />
      </div>
    </>
  );
}
