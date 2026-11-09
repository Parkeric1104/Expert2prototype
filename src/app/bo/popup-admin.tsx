/**
 * BO 공지팝업 관리 (POP-001~004).
 * 상단 "현재 노출 상태" 요약 카드 + 목록(활성/비활성 제어) + 등록·수정 폼(우측 스티키 미리보기).
 * 활성 팝업은 여럿 가능 — 등록일순 최대 MAX_POPUP_QUEUE개까지 순차 노출(POP-002), 수정 시 '다시 보지 않기' 사용자에게도 재노출(POP-003).
 */
import { useMemo, useState } from "react";
import { Plus, Search, Info, AlertTriangle, AlertOctagon } from "lucide-react";
import { toast } from "sonner";
import {
  BOPopup, loadPopups, savePopup, deletePopup, setPopupActive, popupStatus, PopupStatus, inPeriod, todayStr, newId, MAX_POPUP_QUEUE,
} from "@/app/bo/bo-store";
import { PageHeader, Card, StatusDot, FieldLabel, ChipButton, ConfirmModal, Pagination, inputCls, PeriodCell } from "@/app/bo/bo-ui";

const PAGE_SIZE = 5;
const STATUS_TONE: Record<PopupStatus, "green" | "blue" | "gray" | "amber"> = {
  노출중: "green", 예약: "blue", 종료: "amber", 비활성: "gray",
};

// 심각도별 아이콘·색 매핑 — BO 입력값은 아니며(기본 info), 서비스(emergency-popup) 렌더와 동일 규칙
const SEV = {
  info:     { label: "안내", Icon: Info,          text: "text-primary",   bg: "bg-primary/10" },
  warning:  { label: "주의", Icon: AlertTriangle, text: "text-amber-600", bg: "bg-amber-500/10" },
  critical: { label: "긴급", Icon: AlertOctagon,  text: "text-red-600",   bg: "bg-red-500/10" },
} as const;

export function PopupAdmin() {
  const [popups, setPopups] = useState<BOPopup[]>(() => loadPopups());
  const [editing, setEditing] = useState<BOPopup | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BOPopup | null>(null);

  const refresh = () => setPopups(loadPopups());

  // 현재 노출 중(활성 + 기간 내) — 등록일순, 최대 MAX_POPUP_QUEUE개만 실제 순차 노출
  const liveSorted = popups
    .filter((p) => p.active && inPeriod(p.publishStart, p.publishEnd))
    .sort((a, b) => (a.createdAt === b.createdAt ? (a.id < b.id ? -1 : 1) : a.createdAt < b.createdAt ? -1 : 1));
  const shownList = liveSorted.slice(0, MAX_POPUP_QUEUE);
  const waitingCount = Math.max(0, liveSorted.length - MAX_POPUP_QUEUE); // 3개 초과 대기분

  const filtered = useMemo(() => {
    const sorted = [...popups].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return sorted.filter((p) => !query.trim() || p.title.includes(query.trim()));
  }, [popups, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleToggle = (p: BOPopup) => {
    setPopupActive(p.id, !p.active);
    const next = loadPopups();
    setPopups(next);
    if (p.active) {
      toast.success("팝업이 비활성화되었어요.");
      return;
    }
    const liveCount = next.filter((x) => x.active && inPeriod(x.publishStart, x.publishEnd)).length;
    if (liveCount > MAX_POPUP_QUEUE) {
      toast.success(`팝업이 활성화되었어요. 노출 중 팝업이 ${MAX_POPUP_QUEUE}개를 초과해, 등록일 빠른 ${MAX_POPUP_QUEUE}개만 순차 노출돼요.`);
    } else {
      toast.success("팝업이 활성화되었어요. 서비스 메인에 순차 노출돼요.");
    }
  };

  if (editing) {
    return (
      <PopupForm
        initial={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={(wasEdit) => {
          setEditing(null);
          refresh();
          toast.success(wasEdit ? "팝업이 수정되었어요. '다시 보지 않기'를 선택한 사용자에게도 다시 노출돼요." : "팝업이 등록되었어요.");
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="공지팝업"
        desc={`서비스 메인 중앙에 노출되는 팝업을 관리할 수 있어요. 활성 팝업이 여러 개면 등록일 순서로 최대 ${MAX_POPUP_QUEUE}개까지 순차 노출돼요(사용자는 확인/다음으로 넘겨 봐요).`}
        action={
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            팝업 등록
          </button>
        }
      />

      {/* 현재 노출 상태 요약 카드 — 순차 큐(등록일순, 최대 MAX_POPUP_QUEUE개) */}
      <Card className="p-5 mb-4">
        {shownList.length > 0 ? (
          <div>
            <div className="flex items-center gap-2">
              <StatusDot tone="green" label={`현재 노출 중인 팝업 ${shownList.length}개`} />
              {shownList.length > 1 && <span className="text-xs text-muted-foreground">등록일 순서로 순차 노출</span>}
              {waitingCount > 0 && <span className="text-xs text-amber-600">외 {waitingCount}개 대기(최대 {MAX_POPUP_QUEUE}개 노출)</span>}
            </div>
            <ol className="mt-2.5 space-y-1.5">
              {shownList.map((p, i) => (
                <li key={p.id} className="flex items-center gap-2.5">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center">{i + 1}</span>
                  <div className={`w-7 h-7 rounded-full ${SEV[p.severity].bg} flex items-center justify-center flex-shrink-0`}>
                    {(() => { const I = SEV[p.severity].Icon; return <I className={`w-4 h-4 ${SEV[p.severity].text}`} />; })()}
                  </div>
                  <p className="flex-1 min-w-0 text-sm font-semibold text-foreground truncate">{p.title}</p>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <StatusDot tone="gray" label="현재 노출 중인 팝업이 없어요" />
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-foreground">팝업 목록</h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              placeholder="제목 검색"
              className="h-9 w-[200px] pl-8 pr-3 rounded-lg border border-border bg-white text-sm outline-none focus:border-primary placeholder:text-muted-foreground/60"
            />
          </div>
        </div>

        {/* 좁은 화면에서는 테이블만 가로 스크롤(글자 넘침 방지) */}
        <div className="overflow-x-auto">
          {/* table-fixed: 제목만 유연하게 줄고(말줄임) 나머지 컬럼은 고정 폭 — 카드 끝 잘림 방지 */}
          <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-y-1">
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th className="font-medium px-3 py-1 whitespace-nowrap">제목</th>
                <th className="w-[80px] font-medium px-3 py-1 whitespace-nowrap">상태</th>
                <th className="w-[96px] font-medium px-3 py-1 whitespace-nowrap max-lg:hidden">작성일</th>
                <th className="w-[136px] font-medium px-3 py-1 whitespace-nowrap">게시기간</th>
                <th className="w-[186px] font-medium px-3 py-1 whitespace-nowrap text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {pageItems.map((p) => {
                const st = popupStatus(p);
                return (
                  <tr key={p.id} className="bg-gray-50/80 text-[13px] text-foreground/90">
                    <td className="px-3 py-2.5 rounded-l-lg"><span className="block truncate font-medium">{p.title}</span></td>
                    <td className="px-3 py-2.5"><StatusDot tone={STATUS_TONE[st]} label={st} /></td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground max-lg:hidden">{p.createdAt}</td>
                    <td className="px-3 py-2.5"><PeriodCell start={p.publishStart} end={p.publishEnd} /></td>
                    <td className="px-3 py-2.5 rounded-r-lg">
                      <div className="flex items-center justify-end gap-1.5">
                        <ChipButton tone={p.active ? "gray" : "blue"} onClick={() => handleToggle(p)}>
                          {p.active ? "비활성화" : "활성화"}
                        </ChipButton>
                        <ChipButton onClick={() => setEditing(p)}>수정</ChipButton>
                        <ChipButton tone="red" onClick={() => setDeleteTarget(p)}>삭제</ChipButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <p className="py-14 text-center text-sm text-muted-foreground">조건에 맞는 팝업이 없어요.</p>}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <ConfirmModal
        open={deleteTarget != null}
        title="팝업을 삭제할까요?"
        desc={`"${deleteTarget?.title}" 팝업이 삭제되고 서비스에서도 더 이상 노출되지 않아요. 이 동작은 되돌릴 수 없어요.`}
        confirmLabel="삭제하기"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deletePopup(deleteTarget.id);
          setDeleteTarget(null);
          refresh();
          toast.success("팝업이 삭제되었어요.");
        }}
      />

    </div>
  );
}

// ── 등록/수정 폼 (POP-003) + 우측 스티키 미리보기 (POP-004) ──
function PopupForm({ initial, onCancel, onSaved }: { initial: BOPopup | null; onCancel: () => void; onSaved: (wasEdit: boolean) => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [message, setMessage] = useState(initial?.message ?? "");
  const [publishStart, setPublishStart] = useState(initial?.publishStart ?? "");
  const [publishEnd, setPublishEnd] = useState(initial?.publishEnd ?? "");
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    title: title.trim() ? (title.length > 30 ? "제목은 30자까지 입력할 수 있어요." : "") : "제목을 입력해 주세요.",
    message: message.trim() ? (message.length > 150 ? "본문은 150자까지 입력할 수 있어요." : "") : "본문을 입력해 주세요.",
    period:
      publishStart && publishEnd && new Date(publishStart) >= new Date(publishEnd)
        ? "게시 종료는 시작보다 뒤여야 해요."
        : "",
  };
  const hasError = Object.values(errors).some(Boolean);

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    savePopup({
      id: initial?.id ?? newId("p"),
      title: title.trim(),
      message: message.trim(),
      severity: initial?.severity ?? "info", // BO 입력 항목 아님 — 기본 안내(info)
      active: initial?.active ?? false,
      revision: initial?.revision ?? 0, // 수정 시 증가는 savePopup에서 처리
      createdAt: initial?.createdAt ?? todayStr(),
      publishStart: publishStart || undefined,
      publishEnd: publishEnd || undefined,
    });
    onSaved(initial != null);
  };

  const sev = SEV[initial?.severity ?? "info"];

  return (
    <div>
      {/* 브레드크럼 */}
      <div className="flex items-center gap-1.5 text-sm mb-4">
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">공지팝업</button>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-semibold text-foreground">{initial ? "수정하기" : "등록하기"}</span>
      </div>

      <div className="flex items-start gap-6">
        {/* 좌측: 섹션 카드 폼 */}
        <div className="flex-1 min-w-0 space-y-4">
          {initial && (
            <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-800 leading-relaxed" style={{ wordBreak: "keep-all" }}>
                수정 저장 시 '다시 보지 않기'를 선택한 사용자에게도 팝업이 다시 노출돼요.
              </p>
            </div>
          )}

          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">팝업 내용</h2>
            <p className="text-sm text-muted-foreground mb-5">서비스 메인 중앙 팝업으로 노출될 내용을 입력해 주세요.</p>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <FieldLabel required>제목</FieldLabel>
                  <span className={`text-xs ${title.length > 30 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>{title.length}/30</span>
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="입력하기" className={inputCls} />
                {submitted && errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <FieldLabel required>본문</FieldLabel>
                  <span className={`text-xs ${message.length > 150 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>{message.length}/150</span>
                </div>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="팝업에 노출할 내용을 입력해 주세요."
                  rows={4}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors placeholder:text-muted-foreground/70 resize-y"
                />
                {submitted && errors.message && <p className="mt-1 text-xs text-red-500">{errors.message}</p>}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">게시 기간</h2>
            <p className="text-sm text-muted-foreground mb-5" style={{ wordBreak: "keep-all" }}>
              기간 외에는 자동으로 노출되지 않아요. 설정하지 않으면 활성화 동안 상시 노출돼요. 시작을 미래로 지정하면 예약 발행돼요.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>게시 시작</FieldLabel>
                <input type="datetime-local" value={publishStart} onChange={(e) => setPublishStart(e.target.value)} className={inputCls} />
              </div>
              <div>
                <FieldLabel>게시 종료</FieldLabel>
                <input type="datetime-local" value={publishEnd} onChange={(e) => setPublishEnd(e.target.value)} className={inputCls} />
              </div>
            </div>
            {submitted && errors.period && <p className="mt-1.5 text-xs text-red-500">{errors.period}</p>}
          </Card>

          <div className="flex items-center justify-end gap-2 pb-8">
            <button onClick={onCancel} className="px-4 h-10 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
              닫기
            </button>
            <button onClick={handleSave} className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
              {initial ? "저장하기" : "등록하기"}
            </button>
          </div>
        </div>

        {/* 우측: 라이브 미리보기 (POP-004) — 서비스 메인 중앙 팝업 렌더, 폼과 함께 스크롤 */}
        <div className="w-[340px] flex-shrink-0">
          <Card className="p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">서비스 미리보기 — 메인 중앙 팝업</p>
            <div className="rounded-xl bg-gray-100 p-4">
              {/* emergency-popup.tsx와 동일한 카드 구조 */}
              <div className="bg-white rounded-2xl shadow-xl border border-border overflow-hidden">
                <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
                  <div className={`w-10 h-10 rounded-full ${sev.bg} flex items-center justify-center flex-shrink-0`}>
                    <sev.Icon className={`w-5 h-5 ${sev.text}`} />
                  </div>
                  <h3 className="text-[15px] font-bold text-foreground" style={{ wordBreak: "keep-all" }}>
                    {title || "제목이 여기에 표시돼요"}
                  </h3>
                </div>
                <div className="px-5">
                  <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-line" style={{ wordBreak: "keep-all" }}>
                    {message || "본문 내용이 여기에 표시돼요."}
                  </p>
                </div>
                <div className="px-5 pt-3 pb-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">다시 보지 않기</span>
                  <span className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-primary">확인</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
