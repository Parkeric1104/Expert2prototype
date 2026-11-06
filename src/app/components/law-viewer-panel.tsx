import { X, Search, Download, Printer, ExternalLink } from "lucide-react";
import { getLawArticle } from "@/app/data/law-content";

// 국가법령정보센터(law.go.kr) 원문 카드 — 실제 사이트 형태를 모사.
// 어디에 놓여도(채팅 출처 패널 아코디언 본문 / 체크포인트 법령 뷰어 슬라이드오버) 동일한 형태로 재사용한다.
// 외부 사이트를 모사하므로 브랜드 바는 해당 사이트의 네이비를 사용(앱 브랜드색 아님).
export function LawCenterView({ lawRef, fallbackContent }: { lawRef: string; fallbackContent?: string }) {
  const law = getLawArticle(lawRef);
  const hasEntry = !!(law.articleTitle || law.enforceDate || law.revision);
  const body = hasEntry ? law.body : (fallbackContent?.trim() || law.body);
  const heading = [law.articleNo, law.articleTitle && `(${law.articleTitle})`].filter(Boolean).join("");
  const lawGoUrl = `https://www.law.go.kr/법령/${encodeURIComponent(law.lawName)}`;

  return (
    <div className="rounded-lg border border-black/10 overflow-hidden bg-white">
      {/* 브랜드 바 */}
      <div className="flex items-stretch text-white" style={{ background: "#2a3f72" }}>
        <div className="px-4 flex items-center text-[13px] font-bold" style={{ background: "#1e3060" }}>법령</div>
        <div className="flex-1 flex items-center justify-end px-3 py-2.5">
          <span className="text-[12px] font-semibold tracking-tight">법제처 국가법령정보센터</span>
        </div>
      </div>

      {/* 툴바(장식성) */}
      <div className="flex items-center justify-end gap-1.5 px-3 py-2 border-b border-black/10 bg-gray-50">
        <span className="inline-flex items-center gap-1 px-2.5 h-7 rounded-md bg-gray-700 text-white text-[11px] font-medium">
          <Search className="w-3 h-3" /> 화면내검색
        </span>
        <span className="w-7 h-7 rounded-md border border-black/10 bg-white flex items-center justify-center text-[12px] font-bold text-gray-600">漢</span>
        <span className="w-7 h-7 rounded-md border border-black/10 bg-white flex items-center justify-center text-gray-600"><Download className="w-3.5 h-3.5" /></span>
        <span className="w-7 h-7 rounded-md border border-black/10 bg-white flex items-center justify-center text-gray-600"><Printer className="w-3.5 h-3.5" /></span>
      </div>

      {/* 본문 */}
      <div className="px-5 py-5 text-gray-900">
        <h3 className="text-center text-[17px] font-bold" style={{ wordBreak: "keep-all" }}>{law.lawName}</h3>
        {(law.enforceDate || law.revision) && (
          <p className="mt-1.5 text-center text-[12px] text-gray-500">
            {law.enforceDate && <span>[시행 {law.enforceDate}] </span>}
            {law.revision && <span>[{law.revision}]</span>}
          </p>
        )}
        {law.ministry && (
          <p className="mt-2.5 text-right text-[11px] leading-relaxed text-gray-500 whitespace-pre-line" style={{ wordBreak: "keep-all" }}>{law.ministry}</p>
        )}

        <div className="my-4 h-px bg-black/10" />

        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 w-4 h-4 flex-shrink-0 rounded-[3px] border border-gray-300 bg-gray-50" aria-hidden />
          <div className="min-w-0 flex-1">
            {heading && (
              <p className="text-[13.5px] font-bold text-gray-900 mb-1 inline" style={{ wordBreak: "keep-all" }}>{heading} </p>
            )}
            <span className="text-[13px] leading-relaxed text-gray-800 whitespace-pre-line" style={{ wordBreak: "keep-all" }}>{body}</span>
          </div>
        </div>
      </div>

      {/* 푸터: 원문 새 창 */}
      <div className="px-5 py-2.5 border-t border-black/10 bg-gray-50">
        <a
          href={lawGoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-[#2a3f72] hover:underline"
        >
          <ExternalLink className="w-3 h-3" />
          국가법령정보센터에서 원문 새 창으로 보기
        </a>
      </div>
    </div>
  );
}

// 체크포인트 근거법령 칩 클릭 시 열리는 우측 슬라이드오버 — 내부에 LawCenterView 카드를 노출.
export function LawViewerPanel({ lawRef, onClose }: { lawRef: string | null; onClose: () => void }) {
  if (!lawRef) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed top-0 right-0 h-full w-full max-w-[520px] bg-background border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between px-5 h-14 border-b border-border flex-shrink-0">
          <h2 className="text-base font-bold text-foreground">법령 원문</h2>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <LawCenterView lawRef={lawRef} />
        </div>
      </div>
    </>
  );
}
