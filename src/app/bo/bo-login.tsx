/**
 * BO 로그인 (ACC-001) — BO 진입 시 로그인 필수.
 * 프로토타입: bo-store의 로컬 계정으로 인증(데모 계정 힌트 노출).
 */
import { useState } from "react";
import { Check } from "lucide-react";
import { login, logout, getSavedLoginId, setSavedLoginId, validatePassword, changePassword, DEFAULT_PASSWORD, BOAccount } from "@/app/bo/bo-store";
import { FieldLabel, inputCls } from "@/app/bo/bo-ui";

// 체크박스 (아이디 저장 / 자동 로그인)
function CheckOption({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <button type="button" onClick={onToggle} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
      <span className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${checked ? "bg-primary border-primary" : "bg-white border-gray-300"}`}>
        {checked && <Check className="w-3 h-3 text-white" />}
      </span>
      {label}
    </button>
  );
}

export function BOLogin({ onLogin }: { onLogin: (account: BOAccount) => void }) {
  const savedId = getSavedLoginId();
  const [loginId, setLoginId] = useState(savedId);       // '아이디 저장' 되어 있으면 프리필
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(!!savedId);
  const [autoLogin, setAutoLogin] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!loginId.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    const acc = login(loginId.trim(), password, { autoLogin });
    if (!acc) {
      setError("아이디 또는 비밀번호가 올바르지 않아요.");
      return;
    }
    setSavedLoginId(rememberId ? acc.loginId : null);
    onLogin(acc);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
      <div className="w-full max-w-[400px] px-4">
        <p className="text-center text-xl font-extrabold tracking-tight text-foreground mb-1">
          Expert <span className="text-primary">BO</span>
        </p>
        <p className="text-center text-sm text-muted-foreground mb-6">세법노무도우미 운영 콘솔</p>

        <div className="bg-white rounded-2xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6">
          <h1 className="text-base font-bold text-foreground mb-5">로그인</h1>
          <div className="space-y-4">
            <div>
              <FieldLabel required>아이디</FieldLabel>
              <input
                value={loginId}
                onChange={(e) => { setLoginId(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="입력하기"
                className={inputCls}
                autoFocus
              />
            </div>
            <div>
              <FieldLabel required>비밀번호</FieldLabel>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="입력하기"
                className={inputCls}
              />
            </div>
            <div className="flex items-center gap-4 pt-0.5">
              <CheckOption checked={rememberId} onToggle={() => setRememberId(!rememberId)} label="아이디 저장" />
              <CheckOption checked={autoLogin} onToggle={() => setAutoLogin(!autoLogin)} label="자동 로그인" />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleSubmit}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              로그인
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground" style={{ wordBreak: "keep-all" }}>
          데모 계정 — 관리자: admin / expert2! · 운영자: operator / expert2!
        </p>
      </div>
    </div>
  );
}

// ── 최초 로그인 비밀번호 변경 (ACC-006) — 초기 비밀번호(0000) 상태면 콘솔 진입 전 강제 노출 ──
export function BOPasswordChange({ account, onDone, onCancel }: {
  account: BOAccount;
  onDone: (updated: BOAccount) => void;
  onCancel: () => void; // 로그아웃하고 돌아가기
}) {
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    const ruleError = validatePassword(pw);
    if (ruleError) { setError(ruleError); return; }
    if (pw === DEFAULT_PASSWORD) { setError("초기 비밀번호와 다른 비밀번호를 사용해 주세요."); return; }
    if (pw !== pw2) { setError("비밀번호 확인이 일치하지 않아요."); return; }
    const updated = changePassword(account.id, pw);
    if (updated) onDone(updated);
  };

  return (
    <div className="h-screen flex items-center justify-center bg-[#F4F6F8]">
      <div className="w-full max-w-[400px] px-4">
        <p className="text-center text-xl font-extrabold tracking-tight text-foreground mb-1">
          Expert <span className="text-primary">BO</span>
        </p>
        <p className="text-center text-sm text-muted-foreground mb-6">세법노무도우미 운영 콘솔</p>

        <div className="bg-white rounded-2xl border border-black/[0.04] shadow-[0_1px_2px_rgba(0,0,0,0.03)] p-6">
          <h1 className="text-base font-bold text-foreground mb-1">비밀번호 변경</h1>
          <p className="text-xs text-muted-foreground mb-5" style={{ wordBreak: "keep-all" }}>
            초기 비밀번호로 로그인했어요. 보안을 위해 새 비밀번호로 변경해야 이용할 수 있어요.
          </p>
          <div className="space-y-4">
            <div>
              <FieldLabel required>새 비밀번호</FieldLabel>
              <input
                type="password"
                value={pw}
                onChange={(e) => { setPw(e.target.value); setError(""); }}
                placeholder="입력하기"
                className={inputCls}
                autoFocus
              />
              <p className="mt-1.5 text-[11px] text-muted-foreground" style={{ wordBreak: "keep-all" }}>
                8자 이상, 영문·숫자·특수문자를 각 1자 이상 포함해야 해요.
              </p>
            </div>
            <div>
              <FieldLabel required>새 비밀번호 확인</FieldLabel>
              <input
                type="password"
                value={pw2}
                onChange={(e) => { setPw2(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder="한 번 더 입력하기"
                className={inputCls}
              />
            </div>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <button
              onClick={handleSubmit}
              className="w-full h-11 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              변경하고 시작하기
            </button>
            <button
              onClick={() => { logout(); onCancel(); }}
              className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              로그아웃하고 돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
