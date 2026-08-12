/**
 * BO 버전정보 관리 (VER-001~002) — apps in toss '앱 출시' 패턴.
 * 진입 화면 = 현재 버전 요약 카드 + 변경 이력 리스트(페이지네이션),
 * 우상단 '버전 등록' → 모달 폼으로 등록. 이력은 시각·변경 항목·값 기록(LOG-001 라이트).
 */
import { useState } from "react";
import { Plus } from "lucide-react";
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
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(log.length / PAGE_SIZE));
  const pageItems = log.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="버전정보"
        desc="서비스 푸터와 법령 카테고리에 표기되는 버전정보를 관리할 수 있어요."
        action={
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-1.5 px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            버전 등록
          </button>
        }
      />

      {/* 현재 값 요약 카드 (apps in toss '현재 출시된 버전' 패턴) */}
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

      {showModal && (
        <VersionModal
          current={current}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            setCurrent(loadVersion());
            setLog(loadVersionLog());
            setPage(1);
            toast.success("버전정보가 등록되었어요. 서비스에 바로 반영돼요.");
          }}
        />
      )}
    </div>
  );
}

// ── 버전 등록 모달 (apps in toss '버전 등록하기' 패턴) ──
function VersionModal({ current, onClose, onSaved }: {
  current: { service: string; lawDataUpdatedAt: string };
  onClose: () => void;
  onSaved: () => void;
}) {
  const [service, setService] = useState(current.service);
  const [lawDate, setLawDate] = useState(current.lawDataUpdatedAt);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    service: service.trim() ? "" : "서비스 버전을 입력해 주세요.",
    lawDate: lawDate ? "" : "법령 DB 갱신일을 선택해 주세요.",
  };
  const hasError = Object.values(errors).some(Boolean);
  const dirty = service.trim() !== current.service || lawDate !== current.lawDataUpdatedAt;

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    saveVersion({ service: service.trim(), lawDataUpdatedAt: lawDate });
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[480px] bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-5">버전 등록하기</h3>

        <div className="space-y-5">
          <div>
            <FieldLabel required>서비스 버전</FieldLabel>
            <input value={service} onChange={(e) => setService(e.target.value)} placeholder="예: v1.4.0" className={inputCls} />
            <p className="mt-1.5 text-xs text-muted-foreground">메인 푸터에 표기돼요.</p>
            {submitted && errors.service && <p className="mt-1 text-xs text-red-500">{errors.service}</p>}
          </div>
          <div>
            <FieldLabel required>법령 DB 갱신일</FieldLabel>
            <input type="date" value={lawDate} onChange={(e) => setLawDate(e.target.value)} className={inputCls} />
            <p className="mt-1.5 text-xs text-muted-foreground">푸터와 법령 카테고리 하단에 표기돼요.</p>
            {submitted && errors.lawDate && <p className="mt-1 text-xs text-red-500">{errors.lawDate}</p>}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 h-10 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
            닫기
          </button>
          <button
            onClick={handleSave}
            disabled={!dirty}
            className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            등록하기
          </button>
        </div>
      </div>
    </div>
  );
}
