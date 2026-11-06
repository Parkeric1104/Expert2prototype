/**
 * BO 체크포인트(큐레이션) 관리 (CUR-001~004).
 * 목록: 상태 필터·제목 검색·페이지네이션 / 등록·수정: 섹션 카드 폼 + 우측 스티키 미리보기.
 * 저장 시 서비스 FE(홈 체크포인트·전체 페이지)에 무배포 반영.
 */
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import {
  BOCuration, loadCuration, saveCuration, deleteCuration, curationStatus, CurationStatus, todayStr, newId,
} from "@/app/bo/bo-store";
import { ddayLabel } from "@/app/data/curation";
import { PageHeader, Card, StatusDot, FieldLabel, ChipButton, ConfirmModal, Pagination, inputCls, PeriodCell } from "@/app/bo/bo-ui";

const PAGE_SIZE = 5;
const STATUS_TONE: Record<CurationStatus, "green" | "blue" | "gray"> = { 노출중: "green", 예약: "blue", 종료: "gray", 비활성: "gray" };

export function CurationAdmin() {
  const [items, setItems] = useState<BOCuration[]>(() => loadCuration());
  const [editing, setEditing] = useState<BOCuration | "new" | null>(null);
  const [filter, setFilter] = useState<"전체" | CurationStatus>("전체");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BOCuration | null>(null);

  const refresh = () => setItems(loadCuration());

  const filtered = useMemo(() => {
    const sorted = [...items].sort((a, b) => (a.deadline < b.deadline ? -1 : 1));
    return sorted
      .filter((c) => filter === "전체" || curationStatus(c) === filter)
      .filter((c) => !query.trim() || c.title.includes(query.trim()));
  }, [items, filter, query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (editing) {
    return (
      <CurationForm
        initial={editing === "new" ? null : editing}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          refresh();
          toast.success("체크포인트가 저장되었어요. 서비스에 바로 반영돼요.");
        }}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="체크포인트"
        desc="메인 화면에 노출되는 시즌 체크포인트를 배포 없이 관리할 수 있어요."
        action={
          <button
            onClick={() => setEditing("new")}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            체크포인트 등록
          </button>
        }
      />

      <Card className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <h2 className="text-base font-bold text-foreground">체크포인트 목록</h2>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value as "전체" | CurationStatus); setPage(1); }}
              className="h-9 px-2.5 rounded-lg border border-border bg-white text-sm text-foreground outline-none focus:border-primary"
            >
              <option value="전체">상태 전체</option>
              <option value="노출중">노출중</option>
              <option value="예약">예약</option>
              <option value="종료">종료</option>
              <option value="비활성">비활성</option>
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

        <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] table-fixed border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="font-medium px-3 py-1 whitespace-nowrap">제목</th>
              <th className="w-[84px] font-medium px-3 py-1 whitespace-nowrap">마감(D-day)</th>
              <th className="w-[80px] font-medium px-3 py-1 whitespace-nowrap">상태</th>
              <th className="w-[136px] font-medium px-3 py-1 whitespace-nowrap max-lg:hidden">노출기간</th>
              <th className="w-[122px] font-medium px-3 py-1 whitespace-nowrap text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((c) => {
              const st = curationStatus(c);
              return (
                <tr key={c.id} className="bg-gray-50/80 text-[13px] text-foreground/90">
                  <td className="px-3 py-2.5 rounded-l-lg">
                    <div className="min-w-0">
                      <span className="block truncate font-medium">{c.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">{c.sub}</span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <span className="text-muted-foreground">{c.deadline.slice(5)}</span>
                    <span className="ml-1.5 text-[11px] font-extrabold text-rose-500">{ddayLabel(c.deadline)}</span>
                  </td>
                  <td className="px-3 py-2.5"><StatusDot tone={STATUS_TONE[st]} label={st} /></td>
                  <td className="px-3 py-2.5 max-lg:hidden"><PeriodCell start={c.publishStart} end={c.publishEnd} /></td>
                  <td className="px-3 py-2.5 rounded-r-lg">
                    <div className="flex items-center justify-end gap-1.5">
                      <ChipButton onClick={() => setEditing(c)}>수정</ChipButton>
                      <ChipButton tone="red" onClick={() => setDeleteTarget(c)}>삭제</ChipButton>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        {filtered.length === 0 && (
          <p className="py-14 text-center text-sm text-muted-foreground">조건에 맞는 체크포인트가 없어요.</p>
        )}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      <ConfirmModal
        open={deleteTarget != null}
        title="체크포인트를 삭제할까요?"
        desc={`"${deleteTarget?.title}" 항목이 삭제되고 서비스에서도 더 이상 노출되지 않아요. 이 동작은 되돌릴 수 없어요.`}
        confirmLabel="삭제하기"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteCuration(deleteTarget.id);
          setDeleteTarget(null);
          refresh();
          toast.success("체크포인트가 삭제되었어요.");
        }}
      />
    </div>
  );
}

// ── 등록/수정 폼 (CUR-002) + 우측 스티키 미리보기 (CUR-003) ──
function CurationForm({ initial, onCancel, onSaved }: { initial: BOCuration | null; onCancel: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [sub, setSub] = useState(initial?.sub ?? "");
  const [deadline, setDeadline] = useState(initial?.deadline ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [question, setQuestion] = useState(initial?.question ?? "");
  const [lawsText, setLawsText] = useState((initial?.laws ?? []).join(", "));
  const [active, setActive] = useState(initial?.active ?? true);
  const [publishStart, setPublishStart] = useState(initial?.publishStart ?? "");
  const [publishEnd, setPublishEnd] = useState(initial?.publishEnd ?? "");
  const [submitted, setSubmitted] = useState(false);

  const laws = lawsText.split(",").map((s) => s.trim()).filter(Boolean);

  const errors = {
    title: title.trim() ? (title.length > 40 ? "제목은 40자까지 입력할 수 있어요." : "") : "제목을 입력해 주세요.",
    sub: sub.length > 30 ? "부제는 30자까지 입력할 수 있어요." : "",
    deadline: deadline ? "" : "마감일을 선택해 주세요.",
    question: question.trim() ? "" : "연결 질문을 입력해 주세요.",
    period:
      publishStart && publishEnd && new Date(publishStart) >= new Date(publishEnd)
        ? "노출 종료는 시작보다 뒤여야 해요."
        : "",
  };
  const hasError = Object.values(errors).some(Boolean);

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    saveCuration({
      id: initial?.id ?? newId("c"),
      title: title.trim(),
      sub: sub.trim(),
      deadline,
      body: body.trim(),
      question: question.trim(),
      laws,
      active,
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
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground transition-colors">체크포인트</button>
        <span className="text-muted-foreground/50">/</span>
        <span className="font-semibold text-foreground">{initial ? "수정하기" : "등록하기"}</span>
      </div>

      <div className="flex items-start gap-6">
        {/* 좌측: 섹션 카드 폼 */}
        <div className="flex-1 min-w-0 space-y-4">
          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">기본 정보</h2>
            <p className="text-sm text-muted-foreground mb-5">제목·부제와 마감일을 입력해 주세요. D-day는 마감일 기준 자동 계산돼요.</p>

            <div className="space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <FieldLabel required>제목</FieldLabel>
                  <span className={`text-xs ${title.length > 40 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>{title.length}/40</span>
                </div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="예: 부가세 예정신고 체크리스트" className={inputCls} />
                {submitted && errors.title && <p className="mt-1.5 text-xs text-red-500">{errors.title}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <FieldLabel>부제</FieldLabel>
                  <span className={`text-xs ${sub.length > 30 ? "text-red-500 font-semibold" : "text-muted-foreground"}`}>{sub.length}/30</span>
                </div>
                <input value={sub} onChange={(e) => setSub(e.target.value)} placeholder="예: 11/25 마감 / 신고 전 준비" className={inputCls} />
                {submitted && errors.sub && <p className="mt-1.5 text-xs text-red-500">{errors.sub}</p>}
              </div>

              <div>
                <FieldLabel required>마감일 (D-day 기준)</FieldLabel>
                <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className={inputCls} />
                {submitted && errors.deadline && <p className="mt-1.5 text-xs text-red-500">{errors.deadline}</p>}
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <FieldLabel>노출 여부</FieldLabel>
                  <p className="text-xs text-muted-foreground">꺼두면 서비스에 노출되지 않아요(비활성).</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActive(!active)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${active ? "bg-primary" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${active ? "left-[22px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">상세 본문</h2>
            <p className="text-sm text-muted-foreground mb-5" style={{ wordBreak: "keep-all" }}>
              체크포인트 상세 화면에 노출되는 설명이에요(공지 상세와 동일 구조). 비워 두면 상세 화면에 설명 없이 제목·마감·법령만 노출돼요.
            </p>
            <div>
              <FieldLabel>본문</FieldLabel>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="예: 법인 사업자는 제2기 예정신고·납부를 준비해야 합니다. 직전 과세기간 납부세액의 50%가 예정고지되며…"
                rows={6}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors placeholder:text-muted-foreground/70 resize-y"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">줄바꿈(빈 줄)은 문단으로 표시돼요.</p>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">연결 질문 · 근거 법령</h2>
            <p className="text-sm text-muted-foreground mb-5">항목 클릭 시 시작되는 질문과 근거 법령을 입력해 주세요.</p>
            <div className="space-y-5">
              <div>
                <FieldLabel required>연결 질문</FieldLabel>
                <textarea
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="예: 부가가치세 예정신고 일정과 준비 서류 체크리스트를 알려주세요."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-white text-sm leading-relaxed outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors placeholder:text-muted-foreground/70 resize-y"
                />
                {submitted && errors.question && <p className="mt-1 text-xs text-red-500">{errors.question}</p>}
              </div>
              <div>
                <FieldLabel>근거 법령</FieldLabel>
                <input value={lawsText} onChange={(e) => setLawsText(e.target.value)} placeholder="예: 부가가치세법 제48조, 소득세법 제70조의2" className={inputCls} />
                <p className="mt-1.5 text-xs text-muted-foreground">쉼표(,)로 구분해 여러 개 입력할 수 있어요.</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-base font-bold text-foreground mb-1">노출 기간</h2>
            <p className="text-sm text-muted-foreground mb-5" style={{ wordBreak: "keep-all" }}>
              기간 외에는 자동으로 노출되지 않아요. 설정하지 않으면 상시 노출돼요. 시작을 미래로 지정하면 예약 노출돼요.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <FieldLabel>노출 시작</FieldLabel>
                <input type="datetime-local" value={publishStart} onChange={(e) => setPublishStart(e.target.value)} className={inputCls} />
              </div>
              <div>
                <FieldLabel>노출 종료</FieldLabel>
                <input type="datetime-local" value={publishEnd} onChange={(e) => setPublishEnd(e.target.value)} className={inputCls} />
              </div>
            </div>
            {submitted && errors.period && <p className="mt-1.5 text-xs text-red-500">{errors.period}</p>}
            {isReserved && !errors.period && (
              <p className="mt-3 text-xs text-primary font-medium">지정한 시작 시각부터 예약 노출돼요.</p>
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

        {/* 우측: 라이브 미리보기 (CUR-003) — 서비스 체크포인트 카드 렌더 */}
        <div className="w-[340px] flex-shrink-0">
          <Card className="p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">서비스 미리보기 — 체크포인트 항목</p>
            <div className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <span className="flex-1 min-w-0 text-[15px] font-bold text-foreground" style={{ wordBreak: "keep-all" }}>
                  {title || "제목이 여기에 표시돼요"}
                </span>
                <span className="text-[11px] font-extrabold text-white bg-rose-500 rounded-md px-2 py-0.5 flex-shrink-0">
                  {deadline ? ddayLabel(deadline) : "D-??"}
                </span>
              </div>
              {sub && <p className="text-[12.5px] text-muted-foreground mt-1" style={{ wordBreak: "keep-all" }}>{sub}</p>}
              {laws.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {laws.map((law, li) => (
                    <span key={li} className="text-[11px] font-medium text-primary bg-primary/10 rounded-md px-2 py-0.5">{law}</span>
                  ))}
                </div>
              )}
            </div>
            {!active && <p className="mt-3 text-xs text-muted-foreground">현재 <b>비활성</b> 상태라 서비스에는 노출되지 않아요.</p>}
          </Card>
        </div>
      </div>
    </div>
  );
}
