/**
 * BO 홈 구성 관리 (HOME-001).
 * 서비스 홈(메인) 우측 콘텐츠 영역에 노출할 블록을 선택한다 — 체크포인트(큐레이션) / 게시판.
 * 최소 1개·최대 2개, 노출 순서는 고정(큐레이션 → 게시판). 저장 시 서비스 FE에 무배포 반영.
 */
import { useState } from "react";
import { toast } from "sonner";
import { Megaphone, ClipboardList, Check } from "lucide-react";
import { loadHomeLayout, saveHomeLayout } from "@/app/bo/bo-store";
import type { HomeBlockKey } from "@/app/data/service-content";
import { PageHeader, Card } from "@/app/bo/bo-ui";

const BLOCK_META: { key: HomeBlockKey; label: string; desc: string; Icon: typeof Megaphone; iconColor: string }[] = [
  { key: "curation", label: "체크포인트(큐레이션)", desc: "시즌 세무·노무 체크포인트를 D-day 태그와 함께 노출해요.", Icon: Megaphone, iconColor: "text-primary" },
  { key: "board", label: "게시판", desc: "공지·릴리즈노트를 카테고리 탭 메뉴와 함께 노출해요.", Icon: ClipboardList, iconColor: "text-foreground/60" },
];
const ORDER: HomeBlockKey[] = ["curation", "board"];

export function HomeLayoutAdmin() {
  const [blocks, setBlocks] = useState<HomeBlockKey[]>(() => loadHomeLayout().blocks);
  const [dirty, setDirty] = useState(false);

  const isOn = (k: HomeBlockKey) => blocks.includes(k);
  const shown = ORDER.filter((b) => blocks.includes(b)); // 노출 순서 정규화

  const toggle = (k: HomeBlockKey) => {
    const on = isOn(k);
    if (on && blocks.length <= 1) {
      toast.error("최소 1개 블록은 노출해야 해요.");
      return;
    }
    setBlocks(on ? blocks.filter((b) => b !== k) : [...blocks, k]);
    setDirty(true);
  };

  const handleSave = () => {
    saveHomeLayout({ blocks });
    setBlocks(loadHomeLayout().blocks);
    setDirty(false);
    toast.success("홈 구성이 저장되었어요. 서비스에 바로 반영돼요.");
  };

  return (
    <div>
      <PageHeader
        title="홈 구성"
        desc="서비스 홈 우측 영역에 노출할 콘텐츠 블록을 선택해요(최소 1 · 최대 2). 노출 순서는 체크포인트 → 게시판으로 고정돼요."
      />

      <div className="flex items-start gap-6">
        {/* 좌: 블록 선택 */}
        <div className="flex-1 min-w-0 space-y-4">
          <Card className="p-5">
            <h2 className="text-base font-bold text-foreground mb-1">노출 블록</h2>
            <p className="text-sm text-muted-foreground mb-4" style={{ wordBreak: "keep-all" }}>
              켜둔 블록만 홈 우측 영역에 노출돼요. 1개만 켜면 해당 블록이 영역 전체를 사용해요.
            </p>

            <div className="space-y-2.5">
              {BLOCK_META.map(({ key, label, desc, Icon, iconColor }) => {
                const on = isOn(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggle(key)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-colors ${
                      on ? "border-primary bg-primary/5" : "border-border bg-white hover:bg-gray-50"
                    }`}
                  >
                    <span className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${on ? "bg-primary/10" : "bg-gray-100"}`}>
                      <Icon className={`w-5 h-5 ${iconColor}`} />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-bold text-foreground">{label}</span>
                      <span className="block text-xs text-muted-foreground mt-0.5" style={{ wordBreak: "keep-all" }}>{desc}</span>
                    </span>
                    <span className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 transition-colors ${on ? "bg-primary text-white" : "border border-border bg-white"}`}>
                      {on && <Check className="w-4 h-4" />}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2 mt-5">
              <button
                onClick={handleSave}
                disabled={!dirty}
                className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                저장하기
              </button>
            </div>
          </Card>
        </div>

        {/* 우: 라이브 미리보기 — 홈 우측 영역 구성 */}
        <div className="w-[320px] flex-shrink-0">
          <Card className="p-5">
            <p className="text-xs font-semibold text-muted-foreground mb-3">서비스 미리보기 — 홈 우측 영역</p>
            <div className="rounded-xl border border-border p-3 space-y-2.5">
              {shown.length === 0 && (
                <p className="py-6 text-center text-xs text-muted-foreground">노출할 블록을 1개 이상 선택해 주세요.</p>
              )}
              {shown.map((b, i) => {
                const meta = BLOCK_META.find((m) => m.key === b)!;
                return (
                  <div key={b}>
                    {i > 0 && <div className="h-px bg-border/60 mb-2.5" />}
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <meta.Icon className={`w-4 h-4 ${meta.iconColor}`} />
                      <span className="text-[13px] font-extrabold text-foreground">{b === "curation" ? "이달의 체크포인트" : "게시판"}</span>
                    </div>
                    {b === "board" && (
                      <div className="flex gap-1 mb-1.5">
                        {["전체", "공지", "릴리즈"].map((t, ti) => (
                          <span key={t} className={`text-[10px] px-2 py-0.5 rounded-full ${ti === 0 ? "bg-primary/10 text-primary" : "text-muted-foreground/70 bg-gray-50"}`}>{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="h-6 rounded-md bg-gray-100" />
                      <div className="h-6 rounded-md bg-gray-100" />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-muted-foreground" style={{ wordBreak: "keep-all" }}>
              현재 <b className="text-foreground">{shown.length}개</b> 블록이 {shown.map((b) => (b === "curation" ? "체크포인트" : "게시판")).join(" → ")} 순서로 노출돼요.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
