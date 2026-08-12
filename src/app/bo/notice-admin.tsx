/**
 * BO 공지사항 관리 (NTC-001~003).
 * 목록: 유형 필터·제목 검색·페이지네이션 / 등록·수정: 섹션 카드 폼 + 우측 스티키 미리보기.
 */
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import type { NoticeType } from "@/app/data/service-content";
import {
  BONotice, loadNotices, saveNotice, deleteNotice, noticeStatus, NoticeStatus, todayStr, newId,
} from "@/app/bo/bo-store";
import { PageHeader, Card, StatusDot, FieldLabel, ChipButton, ConfirmModal, Pagination, inputCls, PeriodCell } from "@/app/bo/bo-ui";

const PAGE_SIZE = 5;
const STATUS_TONE: Record<NoticeStatus, "green" | "blue" | "gray"> = { 게시중: "green", 예약: "blue", 종료: "gray" };

export function NoticeAdmin() {
  const [notices, setNotices] = useState<BONotice[]>(() => loadNotices());
  const [editing, setEditing] = useState<BONotice | "new" | null>(null);
  const [filter, setFilter] = useState<"전체" | NoticeType>("전체");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BONotice | null>(null);

  const refresh = () => setNotices(loadNotices());

  const filtered = useMemo(() => {
    const sorted = [...notices].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return sorted
      .filter((n) => filter === "전체" || n.type === filter)
      .filter((n) => !query.trim() || n.title.includes(query.trim()));
  }, [notices, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (editing) {
    return (
      <NoticeForm
        initial={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          refresh();
          toast.success("공지사항이 저장되었어요. 서비스에 바로 반영돼요.");
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="공지사항"
        desc="서비스에 노출되는 공지를 배포 없이 관리할 수 있어요."
        action={
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            공지 등록
          </button>
        }
      />

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-foreground">공지 목록</h2>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as "전체" | NoticeType); setPage(1); }}
              className="h-9 px-2.5 rounded-lg border border-border bg-white text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="전체">유형 전체</option>
              <option value="공지">공지</option>
              <option value="릴리즈노트">릴리즈노트</option>
            </select>
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
        </div>

        {/* 좁은 화면: 우선순위 낮은 컬럼(조회수·작성일)을 숨겨 카드 안에 맞추고, 그래도 좁으면 가로 스크롤 */}
        <div className="overflow-x-auto">
        {/* table-fixed: 제목만 유연하게 줄고(말줄임) 나머지 컬럼은 고정 폭 — 카드 끝 잘림 방지 */}
        <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="w-[76px] font-medium px-3 py-1 whitespace-nowrap">유형</th>
              <th className="font-medium px-3 py-1 whitespace-nowrap">제목</th>
              <th className="w-[64px] font-medium px-3 py-1 whitespace-nowrap max-lg:hidden">조회수</th>
              <th className="w-[80px] font-medium px-3 py-1 whitespace-nowrap">상태</th>
              <th className="w-[96px] font-medium px-3 py-1 whitespace-nowrap max-lg:hidden">작성일</th>
              <th className="w-[136px] font-medium px-3 py-1 whitespace-nowrap">게시기간</th>
              <th className="w-[122px] font-medium px-3 py-1 whitespace-nowrap text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((n) => {
              const st = noticeStatus(n);
              return (
                <tr key={n.id} className="bg-gray-50/80 text-[13px] text-foreground/90">
                  <td className="px-3 py-2.5 rounded-l-lg whitespace-nowrap">
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${n.type === "릴리즈노트" ? "bg-primary/10 text-primary" : "bg-gray-200/70 text-gray-600"}`}>
                      {n.type}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {n.important && <span className="flex-shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600">중요</span>}
                      <span className="truncate font-medium">{n.title}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground max-lg:hidden">{n.views.toLocaleString()}</td>
                  <td className="px-3 py-2.5"><StatusDot tone={STATUS_TONE[st]} label={st} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground max-lg:hidden">{n.createdAt}</td>
                  <td className="px-3 py-2.5"><PeriodCell start={n.publishStart} end={n.publishEnd} /></td>
                  <td className="px-3 py-2.5 rounded-r-lg">
                    <div className="flex items-center justify-end gap-1.5">
                      <ChipButton onClick={() => setEditing(n)}>수정</ChipButton>
                      <ChipButton tone="red" onClick={() => setDeleteTarget(n)}>삭제</ChipButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-14 text-center text-sm text-muted-foreground">조건에 맞는 공지가 없어요.</p>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <ConfirmModal
        open={deleteTarget != null}
        title="공지를 삭제할까요?"
        desc={`"${deleteTarget?.title}" 공지가 삭제되고 서비스에서도 더 이상 노출되지 않아요. 이 동작은 되돌릴 수 없어요.`}
        confirmLabel="삭제하기"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteNotice(deleteTarget.id);
          setDeleteTarget(null);
          refresh();
          toast.success("공지사항이 삭제되었어요.");
        }}
      />
    </div>
  );
}

// ── 등록/수정 폼 (NTC-002) + 우측 스티키 미리보기 (NTC-003) ──
function NoticeForm({ initial, onCancel, onSaved }: { initial: BONotice | null; onCancel: () => void; onSaved: () => void }) {
  const [type, setType] = useState<NoticeType>(initial?.type ?? "공지");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [important, setImportant] = useState(initial?.important ?? false);
  const [publishStart, setPublishStart] = useState(initial?.publishStart ?? "");
  const [publishEnd, setPublishEnd] = useState(initial?.publishEnd ?? "");
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    title: title.trim() ? (title.length > 60 ? "제목은 60자까지 입력할 수 있어요." : "") : "제목을 입력해 주세요.",
    body: body.trim() ? "" : "본문을 입력해 주세요.",
    period:
      publishStart && publishEnd && new Date(publishStart) >= new Date(publishEnd)
        ? "게시 종료는 시작보다 뒤여야 해요."
        : "",
  };
  const hasError = Object.values(errors).some(Boolean);

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    saveNotice({
      id: initial?.id ?? newId("n"),
      type,
      title: title.trim(),
      body: body.trim(),
      important,
      views: initial?.views ?? 0,
      createdAt: initial?.createdAt ?? todayStr(),
      publishStart: publishStart || undefined,
      publishEnd: publishEnd || undefined,
    });
    onSaved();
  };

  const isReserved = publishStart && new Date(publishStart).getTime() > Date.now();

  return (
    <div>
      {/* 브레드크럼 */}
      <div className="flex items-center gap-1.5 text-sm mb-4">
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">공지사항</button>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-semibold text-foreground">{initial ? "수정하기" : "등록하기"}</span>
      </div>

      <div className="flex items-start gap-6">
        {/* 좌측: 섹션 카드 폼 */}
        <div className="flex-1 min-w-0 space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">기본 정보</h2>
            <p className="text-sm text-muted-foreground mb-5">공지 유형과 제목을 입력해 주세요.</p>

            <div className="space-y-5">
              <div>
                <FieldLabel required>유형</FieldLabel>
                {/* 셀렉트박스 — 카테고리 확장 대비 + 목록 필터와 일관 */}
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as NoticeType)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors"
                >
                  <option value="공지">공지</option>
                  <option value="릴리즈노트">릴리즈노트</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <FieldLabel required>제목</FieldLabel>
                  <span className={`text-xs ${title.length > 60 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>{title.length}/60</span>
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="입력하기" className={inputCls} />
                {submitted && errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>중요 태그</FieldLabel>
                  <p className="text-xs text-muted-foreground">공지 목록에서 '중요' 태그가 함께 노출돼요.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setImportant(!important)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${important ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${important ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <FieldLabel required>본문</FieldLabel>
              <span className="text-xs text-muted-foreground">제한 없음</span>
            </div>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="공지 내용을 입력해 주세요."
              rows={8}
              className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors placeholder:text-muted-foreground/70 resize-y"
            />
            {submitted && errors.body && <p className="mt-1 text-xs text-red-500">{errors.body}</p>}
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">게시 기간</h2>
            <p className="text-sm text-muted-foreground mb-5" style={{ wordBreak: "keep-all" }}>
              기간 외에는 자동으로 노출되지 않아요. 설정하지 않으면 상시 노출돼요. 시작을 미래로 지정하면 예약 발행돼요.
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
            {isReserved && !errors.period && (
              <p className="mt-3 text-xs text-primary font-medium">지정한 시작 시각부터 예약 발행돼요.</p>
            )}
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

        {/* 우측: 라이브 미리보기 (NTC-003) — 서비스 공지 상세 렌더, 폼과 함께 스크롤 */}
        <div className="w-[340px] flex-shrink-0">
          <Card className="p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">서비스 미리보기 — 공지 상세</p>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-1.5 mb-2">
                <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${type === "릴리즈노트" ? "bg-primary/10 text-primary" : "bg-gray-200/70 text-gray-600"}`}>{type}</span>
                {important && <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-600">중요</span>}
              </div>
              <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-border">
                <h3 className="flex-1 min-w-0 text-base font-bold text-foreground" style={{ wordBreak: "keep-all" }}>
                  {title || "제목이 여기에 표시돼요"}
                </h3>
                <div className="flex-shrink-0 text-right text-[11px] text-muted-foreground space-y-0.5 pt-0.5">
                  <div>{initial?.createdAt ?? todayStr()}</div>
                  <div>조회 {(initial?.views ?? 0).toLocaleString()}</div>
                </div>
              </div>
              <p className="text-[13px] text-foreground/90 leading-relaxed whitespace-pre-line" style={{ wordBreak: "keep-all" }}>
                {body || "본문 내용이 여기에 표시돼요."}
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
