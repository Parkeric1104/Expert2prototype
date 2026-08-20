/**
 * BO 로그인 (ACC-001) — BO 진입 시 로그인 필수.
 * 프로토타입: bo-store의 로컬 계정으로 인증(데모 계정 힌트 노출).
 */
import { useState } from "react";
import { login, BOAccount } from "@/app/bo/bo-store";
import { FieldLabel, inputCls } from "@/app/bo/bo-ui";

export function BOLogin({ onLogin }: { onLogin: (account: BOAccount) => void }) {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!loginId.trim() || !password) {
      setError("아이디와 비밀번호를 입력해 주세요.");
      return;
    }
    const acc = login(loginId.trim(), password);
    if (!acc) {
      setError("아이디 또는 비밀번호가 올바르지 않아요.");
      return;
    }
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
