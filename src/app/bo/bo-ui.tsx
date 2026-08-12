/**
 * BO 공용 UI — apps in toss 콘솔 스타일 (BO_DESIGN_REFERENCE.md).
 * 옅은 회색 바탕 위 흰색 라운드 카드, 상태 dot, 칩 액션, 라벨 빨간 dot 필수표시.
 */
import { ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// ── 페이지 헤더: 타이틀 + 한 줄 설명(해요체) + 우상단 Primary 액션 ──
export function PageHeader({ title, desc, action }: { title: string; desc: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5">
      <div>
        <h1 className="text-[22px] font-bold text-foreground">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground" style={{ wordBreak: "keep-all" }}>{desc}</p>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${className}`}>{children}</div>;
}

// ── 상태 dot + 텍스트 (뱃지 박스보다 가벼운 표현) ──
const DOT_TONE = {
  green: "bg-emerald-500",
  gray: "bg-gray-400",
  blue: "bg-primary",
  amber: "bg-amber-500",
} as const;

export function StatusDot({ tone, label }: { tone: keyof typeof DOT_TONE; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-foreground/80 whitespace-nowrap">
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${DOT_TONE[tone]}`} />
      {label}
    </span>
  );
}

// ── 필수 표시: 라벨 우상단 빨간 dot(별표 아님) ──
export function FieldLabel({ children, required }: { children: ReactNode; required?: boolean }) {
  return (
    <label className="inline-flex items-start gap-0.5 text-sm font-semibold text-foreground mb-1.5">
      {children}
      {required && <span className="w-1 h-1 rounded-full bg-red-500 mt-0.5" />}
    </label>
  );
}

export const inputCls =
  "w-full h-10 px-3 rounded-lg border border-border bg-white text-sm text-foreground placeholder:text-muted-foreground/70 outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-colors";

// ── 세그먼트 컨트롤 ──
export function Segment<T extends string>({ options, value, onChange }: {
  options: { value: T; label: ReactNode }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 h-8 rounded-md text-sm transition-all ${
            value === o.value ? "bg-white shadow-sm font-semibold text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ── 칩 버튼 (행 액션) ──
const CHIP_TONE = {
  gray: "bg-gray-100 text-gray-700 hover:bg-gray-200",
  blue: "bg-primary/10 text-primary hover:bg-primary/15",
  red: "bg-red-50 text-red-600 hover:bg-red-100",
} as const;

export function ChipButton({ tone = "gray", children, onClick }: { tone?: keyof typeof CHIP_TONE; children: ReactNode; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className={`px-2.5 h-7 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${CHIP_TONE[tone]}`}>
      {children}
    </button>
  );
}

// ── 확인 모달 (삭제 등 파괴적 동작 필수) ──
export function ConfirmModal({ open, title, desc, confirmLabel, danger, onCancel, onConfirm }: {
  open: boolean;
  title: string;
  desc: string;
  confirmLabel: string;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[400px] bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-base font-bold text-foreground" style={{ wordBreak: "keep-all" }}>{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed" style={{ wordBreak: "keep-all" }}>{desc}</p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="px-4 h-10 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
            닫기
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 h-10 rounded-lg text-sm font-semibold text-white transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-primary hover:bg-primary/90"}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 페이지네이션 (우하단, 최소 형태) ──
export function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (p: number) => void }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1 mt-3">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground disabled:opacity-30 hover:bg-gray-100 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={`w-7 h-7 rounded-full text-xs font-medium transition-colors ${p === page ? "bg-gray-900 text-white" : "text-muted-foreground hover:bg-gray-100"}`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        className="w-7 h-7 rounded-full flex items-center justify-center text-muted-foreground disabled:opacity-30 hover:bg-gray-100 transition-colors"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

// ── 날짜·시간 표기 (게시 기간 컬럼) ──
export function fmtDT(s?: string): string {
  return s ? s.replace("T", " ") : "—";
}

/** 게시기간 셀 — 시작·종료를 한 컬럼 2줄로 표기해 표 폭 절약. 미설정 시 '상시' */
export function PeriodCell({ start, end }: { start?: string; end?: string }) {
  if (!start && !end) return <span className="text-muted-foreground">상시</span>;
  return (
    <div className="text-muted-foreground leading-snug whitespace-nowrap text-xs">
      <div>{start ? `${start.replace("T", " ")} ~` : "~"}</div>
      <div>{end ? end.replace("T", " ") : "제한 없음"}</div>
    </div>
  );
}
