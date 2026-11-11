/**
 * BO 계정관리 (ACC-002~004) — 최고관리자 전용.
 * 역할 구분이 아니라 계정별 CRUD 권한(조회·등록·수정·삭제)으로 관리. 신규 계정 기본 = 조회(보기)만.
 * 목록(이름·아이디·권한·생성일·최근 접속) + 등록/수정 모달 + 삭제(본인 삭제 불가).
 */
import { useMemo, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  BOAccount, BOPerms, DEFAULT_PERMS, PERM_LABEL, accountPerms,
  loadAccounts, saveAccount, deleteAccount, isLoginIdTaken, DEFAULT_PASSWORD, todayStr, newId,
} from "@/app/bo/bo-store";
import { PageHeader, Card, FieldLabel, ChipButton, ConfirmModal, Pagination, inputCls } from "@/app/bo/bo-ui";

const PAGE_SIZE = 5;
const PERM_KEYS: (keyof BOPerms)[] = ["read", "create", "update", "delete"];

// 권한 요약: 최고관리자 / 승인 대기(조회 없음) / 활성 권한 나열(조회만=보기 전용)
function PermCell({ a }: { a: BOAccount }) {
  if (a.owner) return <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">최고관리자</span>;
  const p = accountPerms(a);
  const on = PERM_KEYS.filter((k) => p[k]);
  if (on.length === 1) return <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-gray-200/70 text-gray-600">보기 전용</span>;
  return (
    <span className="inline-flex flex-wrap gap-1">
      {on.map((k) => (
        <span key={k} className={`text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${k === "read" ? "bg-gray-200/70 text-gray-600" : "bg-primary/10 text-primary"}`}>{PERM_LABEL[k]}</span>
      ))}
    </span>
  );
}

export function AccountAdmin({ me }: { me: BOAccount }) {
  const [accounts, setAccounts] = useState<BOAccount[]>(() => loadAccounts());
  const [editing, setEditing] = useState<BOAccount | "new" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<BOAccount | null>(null);
  const [page, setPage] = useState(1);

  const refresh = () => setAccounts(loadAccounts());

  const sorted = useMemo(() => [...accounts].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)), [accounts]);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <PageHeader
        title="계정관리"
        desc="아마란스 로그인으로 들어온 계정의 권한을 관리해요. 로그인하면 기본 '조회'가 제공되고, 등록·수정·삭제는 계정별로 부여해요. 최고관리자(DB 지정)만 이 메뉴를 볼 수 있어요."
      />

      <Card className="p-5">
        <h2 className="text-base font-bold text-foreground mb-4">계정 목록</h2>
        <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] table-fixed border-separate border-spacing-y-1">
          <thead>
            <tr className="text-left text-xs text-muted-foreground">
              <th className="font-medium px-3 py-1 whitespace-nowrap">이름</th>
              <th className="w-[120px] font-medium px-3 py-1 whitespace-nowrap">아이디</th>
              <th className="w-[180px] font-medium px-3 py-1 whitespace-nowrap">권한</th>
              <th className="w-[96px] font-medium px-3 py-1 whitespace-nowrap max-lg:hidden">생성일</th>
              <th className="w-[136px] font-medium px-3 py-1 whitespace-nowrap max-lg:hidden">최근 접속</th>
              <th className="w-[122px] font-medium px-3 py-1 whitespace-nowrap text-right">관리</th>
            </tr>
          </thead>
          <tbody>
            {pageItems.map((a) => {
              const isMe = a.id === me.id;
              return (
                <tr key={a.id} className="bg-gray-50/80 text-[13px] text-foreground/90">
                  <td className="px-3 py-2.5 rounded-l-lg">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="truncate font-medium">{a.name}</span>
                      {isMe && <span className="flex-shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-primary/10 text-primary">내 계정</span>}
                      {a.mustChangePassword && <span className="flex-shrink-0 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-500/10 text-amber-600">초기 비밀번호</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{a.loginId}</td>
                  <td className="px-3 py-2.5"><PermCell a={a} /></td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground max-lg:hidden">{a.createdAt}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground max-lg:hidden">{a.lastLoginAt ?? "—"}</td>
                  <td className="px-3 py-2.5 rounded-r-lg">
                    <div className="flex items-center justify-end gap-1.5">
                      <ChipButton onClick={() => setEditing(a)}>수정</ChipButton>
                      {!isMe && !a.owner && <ChipButton tone="red" onClick={() => setDeleteTarget(a)}>삭제</ChipButton>}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        </div>
        <Pagination page={page} totalPages={totalPages} onChange={setPage} />
      </Card>

      {editing && (
        <AccountModal
          initial={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(wasEdit) => {
            setEditing(null);
            refresh();
            toast.success(wasEdit ? "계정 권한이 저장되었어요." : "계정이 등록되었어요.");
          }}
        />
      )}

      <ConfirmModal
        open={deleteTarget != null}
        title="계정을 삭제할까요?"
        desc={`"${deleteTarget?.name}(${deleteTarget?.loginId})" 계정이 삭제되고 더 이상 BO에 로그인할 수 없어요. 이 동작은 되돌릴 수 없어요.`}
        confirmLabel="삭제하기"
        danger
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) deleteAccount(deleteTarget.id);
          setDeleteTarget(null);
          refresh();
          toast.success("계정이 삭제되었어요.");
        }}
      />
    </div>
  );
}

// ── 등록/수정 모달 (ACC-004) — CRUD 권한 부여 ──
function AccountModal({ initial, onClose, onSaved }: {
  initial: BOAccount | null;
  onClose: () => void;
  onSaved: (wasEdit: boolean) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [loginId, setLoginId] = useState(initial?.loginId ?? "");
  const [resetPw, setResetPw] = useState(false);
  const [perms, setPerms] = useState<BOPerms>(initial && !initial.owner ? { ...DEFAULT_PERMS, ...initial.perms } : { ...DEFAULT_PERMS });
  const [submitted, setSubmitted] = useState(false);
  const isOwner = !!initial?.owner;

  const errors = {
    name: name.trim() ? "" : "이름을 입력해 주세요.",
    loginId: loginId.trim()
      ? isLoginIdTaken(loginId.trim(), initial?.id)
        ? "이미 사용 중인 아이디예요."
        : ""
      : "아이디를 입력해 주세요.",
  };
  const hasError = Object.values(errors).some(Boolean);

  // 조회는 로그인 기본 제공(해제 불가). 등록·수정·삭제만 토글.
  const toggle = (k: keyof BOPerms) => {
    if (k === "read") return;
    setPerms((p) => ({ ...p, read: true, [k]: !p[k] }));
  };

  const handleSave = () => {
    setSubmitted(true);
    if (hasError) return;
    saveAccount({
      id: initial?.id ?? newId("a"),
      loginId: loginId.trim(),
      name: name.trim(),
      password: initial ? (resetPw ? DEFAULT_PASSWORD : initial.password) : DEFAULT_PASSWORD,
      owner: initial?.owner ?? false,
      perms: isOwner ? initial!.perms : perms,
      createdAt: initial?.createdAt ?? todayStr(),
      lastLoginAt: initial?.lastLoginAt,
      mustChangePassword: initial ? (resetPw ? true : initial.mustChangePassword) : true,
    });
    onSaved(initial != null);
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[440px] bg-white rounded-2xl shadow-xl p-6">
        <h3 className="text-lg font-bold text-foreground mb-5">{initial ? "계정 수정하기" : "계정 등록하기"}</h3>

        <div className="space-y-4">
          <div>
            <FieldLabel required>이름</FieldLabel>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="입력하기" className={inputCls} />
            {submitted && errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
          </div>
          <div>
            <FieldLabel required>아이디</FieldLabel>
            <input value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="입력하기" className={inputCls} />
            {submitted && errors.loginId && <p className="mt-1 text-xs text-red-500">{errors.loginId}</p>}
          </div>
          {initial ? (
            <button
              type="button"
              onClick={() => setResetPw(!resetPw)}
              className="w-full flex items-start gap-2 px-3 py-2.5 rounded-lg bg-gray-50 border border-border text-left hover:bg-gray-100 transition-colors"
            >
              <span className={`mt-0.5 w-4 h-4 rounded flex-shrink-0 flex items-center justify-center border transition-colors ${resetPw ? "bg-primary border-primary" : "bg-white border-gray-300"}`}>
                {resetPw && <span className="text-white text-[10px] font-bold">✓</span>}
              </span>
              <span className="text-xs text-foreground/80" style={{ wordBreak: "keep-all" }}>
                비밀번호 초기화 — {DEFAULT_PASSWORD}으로 재설정되고, 다음 로그인 시 새 비밀번호로 변경해야 해요.
              </span>
            </button>
          ) : (
            <div className="px-3 py-2.5 rounded-lg bg-gray-50 border border-border">
              <p className="text-xs text-foreground/80" style={{ wordBreak: "keep-all" }}>
                초기 비밀번호는 <b>{DEFAULT_PASSWORD}</b>이에요. 최초 로그인 시 비밀번호 규칙에 맞는 새 비밀번호로 변경해야 해요.
              </p>
            </div>
          )}

          {/* CRUD 권한 */}
          <div>
            <FieldLabel>권한 (CRUD)</FieldLabel>
            {isOwner ? (
              <div className="px-3 py-2.5 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-xs text-foreground/80" style={{ wordBreak: "keep-all" }}>
                  <b className="text-primary">최고관리자</b> 계정으로 모든 콘텐츠·계정 권한을 가져요. 권한은 변경할 수 없어요.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-4 gap-1.5">
                  {PERM_KEYS.map((k) => {
                    const isRead = k === "read";
                    const on = isRead ? true : perms[k];
                    return (
                      <button
                        key={k}
                        type="button"
                        disabled={isRead}
                        onClick={() => toggle(k)}
                        className={`h-10 rounded-lg border text-sm font-medium inline-flex items-center justify-center gap-1 transition-colors ${
                          on ? "border-primary bg-primary/10 text-primary" : "border-border bg-white text-foreground/60 hover:bg-gray-50"
                        } ${isRead ? "opacity-70 cursor-default" : ""}`}
                      >
                        {on && <Check className="w-3.5 h-3.5" />}
                        {PERM_LABEL[k]}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-muted-foreground" style={{ wordBreak: "keep-all" }}>
                  조회는 로그인 시 기본 제공돼요(해제 불가). 등록·수정·삭제만 부여하며, 메뉴별 차등 없이 전체 콘텐츠에 동일 적용돼요.
                </p>
              </>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button onClick={onClose} className="px-4 h-10 rounded-lg bg-gray-100 text-sm font-semibold text-gray-700 hover:bg-gray-200 transition-colors">
            닫기
          </button>
          <button onClick={handleSave} className="px-4 h-10 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            {initial ? "저장하기" : "등록하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
