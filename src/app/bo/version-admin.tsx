/**
 * BO 버전정보 관리 (VER-001~002).
 * 현재 값 요약 카드 + 수정 폼. 서비스 푸터(서비스+법령DB)·법령 카테고리 하단(법령DB)에 반영.
 */
import { useState } from "react";
import { toast } from "sonner";
import { loadVersion, saveVersion } from "@/app/bo/bo-store";
import { PageHeader, Card, StatusDot, FieldLabel, inputCls } from "@/app/bo/bo-ui";

export function VersionAdmin() {
  const [current, setCurrent] = useState(() => loadVersion());
  const [service, setService] = useState(current.service);
  const [lawDate, setLawDate] = useState(current.lawDataUpdatedAt);
  const [submitted, setSubmitted] = useState(false);

  const errors = {
    service: service.trim() ? "" : "서비스 버전을 입력해 주세요.",
    lawDate: lawDate ? "" : "법령 DB 갱신일을 선택해 주세요.",
  };
  const hasError = Object.values(errors).some(Boolean);
  const dirty = service !== current.service || lawDate !== current.lawDataUpdatedAt;

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    const next = { service: service.trim(), lawDataUpdatedAt: lawDate };
    saveVersion(next);
    setCurrent(next);
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

      <Card className="p-6 max-w-[560px]">
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
    </div>
  );
}
