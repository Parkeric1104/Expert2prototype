/**
 * BO 버전정보 관리 (VER-001~002).
 * 현재 값 요약 카드 + 수정 폼 + 변경 이력(시각·변경 항목·값, 페이지네이션 — LOG-001 라이트).
 * 서비스 푸터(서비스+법령DB)·법령 카테고리 하단(법령DB)에 반영.
 */
import { useState } from "react";
import { toast } from "sonner";
import { loadVersion, saveVersion, loadVersionLog, BOVersionLog } from "@/app/bo/bo-store";
import { PageHeader, Card, StatusDot, FieldLabel, Pagination, inputCls } from "@/app/bo/bo-ui";

const PAGE_SIZE = 5;

const CHANGED_LABEL: Record<BOVersionLog["changed"][number], string> = {
  service: "서비스 버전",
  lawDataUpdatedAt: "법령 DB 갱신일",
};

export function VersionAdmin() {
  const [current, setCurrent] = useState(() => loadVersion());
  const [log, setLog] = useState<BOVersionLog[]>(() => loadVersionLog());
  const [service, setService] = useState(current.service);
  const [lawDate, setLawDate] = useState(current.lawDataUpdatedAt);
  const [submitted, setSubmitted] = useState(false);
  const [page, setPage] = useState(1);

  const errors = {
    service: service.trim() ? "" : "서비스 버전을 입력해 주세요.",
    lawDate: lawDate ? "" : "법령 DB 갱신일을 선택해 주세요.",
  };
  const hasError = Object.values(errors).some(Boolean);
  const dirty = service !== current.service || lawDate !== current.lawDataUpdatedAt;

  const totalPages = Math.max(1, Math.ceil(log.length / PAGE_SIZE));
  const pageItems = log.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    const next = { service: service.trim(), lawDataUpdatedAt: lawDate };
    saveVersion(next);
    setCurrent(next);
    setLog(loadVersionLog());
    setPage(1);
    setSubmitted(false);
    toast.success("버전정보가 저장되었어요. 서비스에 바로 반영돼요.");
  };

  return (
    <div>
      <PageHeader title="버전정보" desc="서비스 푸터와 법령 카테고리에 표기되는 버전정보를 관리할 수 있어요." />

      {/* 현재 값 요약 카드 */}
      <Card className="p-5 mb-4">
        <StatusDot tone="green" label="현재 표기 중인 버전" />
        <div className="mt-2 flex items-end gap-8">
          <div>
            <p className="text-2xl font-bold text-foreground">{current.service}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">서비스 버전 — 메인 푸터 표기</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-foreground">{current.lawDataUpdatedAt}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">법령 DB 갱신일 — 푸터·법령 카테고리 하단 표기</p>
          </div>
        </div>
      </Card>

      <Card className="p-6 max-w-[560px] mb-4">
        <h2 className="text-base font-bold text-foreground mb-1">버전 수정</h2>
        <p className="text-sm text-muted-foreground mb-5">저장하면 서비스에 바로 반영돼요.</p>

        <div className="space-y-5">
          <div>
            <FieldLabel required>서비스 버전</FieldLabel>
            <input value={service} onChange={(e) => setService(e.target.value)} placeholder="예: v1.4.0" className={inputCls} />
            {submitted && errors.service && <p className="mt-1.5 text-xs text-red-500">{errors.service}</p>}
          </div>
          <div>
            <FieldLabel required>법령 DB 갱신일</FieldLabel>
            <input type="date" value={lawDate} onChange={(e) => setLawDate(e.target.value)} className={inputCls} />
            {submitted && errors.lawDate && <p className="mt-1.5 text-xs text-red-500">{errors.lawDate}</p>}
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={!dirty}
              className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              저장하기
            </button>
          </div>
        </div>
      </Card>

      {/* 변경 이력 — 계정 없음 전제라 시각·변경 내용만 기록(읽기 전용) */}
      <Card className="p-5">
        <h2 className="text-base font-bold text-foreground mb-4">변경 이력</h2>
        <table className="w-full border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="font-medium px-3 py-1">변경일시</th>
              <th className="font-medium px-3 py-1">변경 항목</th>
              <th className="font-medium px-3 py-1">서비스 버전</th>
              <th className="font-medium px-3 py-1">법령 DB 갱신일</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((l) => (
              <tr key={l.id} className="bg-gray-50/80 text-[13px] text-foreground/90">
                <td className="px-3 py-2.5 rounded-l-lg whitespace-nowrap text-muted-foreground">{l.changedAt}</td>
                <td className="px-3 py-2.5">
                  <div className="flex items-center gap-1">
                    {l.changed.length === 0 ? (
                      <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-200/70 text-gray-600">최초 등록</span>
                    ) : (
                      l.changed.map((c) => (
                        <span key={c} className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary whitespace-nowrap">
                          {CHANGED_LABEL[c]}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className={`px-3 py-2.5 whitespace-nowrap ${l.changed.includes("service") ? "font-semibold" : "text-muted-foreground"}`}>{l.service}</td>
                <td className={`px-3 py-2.5 rounded-r-lg whitespace-nowrap ${l.changed.includes("lawDataUpdatedAt") ? "font-semibold" : "text-muted-foreground"}`}>{l.lawDataUpdatedAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {log.length === 0 && <p className="py-14 text-center text-sm text-muted-foreground">변경 이력이 없어요.</p>}
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>
    </div>
  );
}
