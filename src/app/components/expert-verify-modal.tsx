import { useState } from "react";
import { X, ShieldCheck, Upload, Clock, CheckCircle2, AlertCircle, FileCheck2 } from "lucide-react";
import {
  useExpertAuth,
  applyExpertVerification,
  approveExpert,
  rejectExpert,
  resetExpertAuth,
  LICENSE_LABELS,
  LICENSE_ASSOC,
  type ExpertLicenseType,
} from "@/app/data/expert-auth";

interface ExpertVerifyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LICENSE_TYPES: ExpertLicenseType[] = ["tax", "labor", "law"];

/**
 * 전문가 인증(자격 검증) 모달.
 * 법무검토(260928) 반영: 자격 검증 → 승인된 전문가에게만 상세분석·의견서 발행 제공.
 * 자동 자격확인 불가 → 관리자 수기 심사(프로토타입은 데모 승인/반려로 대체).
 */
export function ExpertVerifyModal({ isOpen, onClose }: ExpertVerifyModalProps) {
  const auth = useExpertAuth();
  const [licenseType, setLicenseType] = useState<ExpertLicenseType>("labor");
  const [name, setName] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [office, setOffice] = useState("");
  const [evidenceFileName, setEvidenceFileName] = useState("");

  if (!isOpen) return null;

  const canSubmit = name.trim() && licenseNo.trim() && evidenceFileName;

  const handleSubmit = () => {
    if (!canSubmit) return;
    applyExpertVerification({
      licenseType,
      name: name.trim(),
      licenseNo: licenseNo.trim(),
      office: office.trim() || undefined,
      evidenceFileName,
    });
  };

  const showForm = auth.status === "none" || auth.status === "rejected";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ wordBreak: "keep-all" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-[18px] h-[18px] text-primary" />
            </div>
            <h2 className="text-base font-bold text-gray-900">전문가 인증</h2>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 overflow-y-auto">
          {/* ── 신청 폼 (미인증 / 반려 후 재신청) ── */}
          {showForm && (
            <div className="space-y-5">
              <p className="text-sm text-gray-500 leading-relaxed">
                세무사·공인노무사·변호사 등 <b className="text-gray-700">자격 보유자</b>만 상세분석 및
                의견서 발행 기능을 이용할 수 있습니다. 자격 정보를 제출하면 관리자 심사 후 승인됩니다.
              </p>

              {auth.status === "rejected" && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-100 px-3 py-2.5">
                  <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-600 leading-relaxed">
                    이전 신청이 반려되었습니다{auth.rejectReason ? ` — ${auth.rejectReason}` : ""}. 정보를 확인해 다시 신청해 주세요.
                  </p>
                </div>
              )}

              {/* 자격 유형 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">자격 유형 <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {LICENSE_TYPES.map((t) => (
                    <button
                      key={t}
                      onClick={() => setLicenseType(t)}
                      className={`py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                        licenseType === t
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {LICENSE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              {/* 성명 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">성명 <span className="text-red-500">*</span></label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="자격증상 성명"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* 자격(등록)번호 */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">자격(등록)번호 <span className="text-red-500">*</span></label>
                <input
                  value={licenseNo}
                  onChange={(e) => setLicenseNo(e.target.value)}
                  placeholder={`${LICENSE_ASSOC[licenseType]} 등록번호`}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
                />
                <p className="mt-1.5 text-xs text-gray-400">
                  {LICENSE_ASSOC[licenseType]} 발급 등록번호를 입력해 주세요. (진위는 관리자 심사에서 확인)
                </p>
              </div>

              {/* 소속(선택) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">소속 사무소 <span className="text-gray-400 font-normal">(선택)</span></label>
                <input
                  value={office}
                  onChange={(e) => setOffice(e.target.value)}
                  placeholder="예: OO세무회계"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-primary transition-colors"
                />
              </div>

              {/* 증빙 업로드(자격증/등록증) */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-2">자격증·등록증 사본 <span className="text-red-500">*</span></label>
                <label className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-dashed border-gray-300 text-sm text-gray-500 cursor-pointer hover:border-primary/50 transition-colors">
                  <Upload className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{evidenceFileName || "파일 선택 (PDF·이미지)"}</span>
                  <input
                    type="file"
                    accept=".pdf,image/*"
                    className="hidden"
                    onChange={(e) => setEvidenceFileName(e.target.files?.[0]?.name ?? "")}
                  />
                </label>
              </div>

              <div className="rounded-xl bg-gray-50 px-3.5 py-3 text-xs text-gray-500 leading-relaxed">
                제출 자격 정보는 <b className="text-gray-700">관리자 수기 심사</b>를 거쳐 승인되며, 승인 시에만
                상세분석·의견서 발행이 <b className="text-gray-700">전문가 명의</b>로 제공됩니다. 발행 문서의 최종
                검토·책임은 이용 전문가에게 있습니다.
              </div>

              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className={`w-full py-3 rounded-xl text-sm font-bold transition-colors ${
                  canSubmit ? "bg-primary text-white hover:bg-primary/90" : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                인증 신청
              </button>
            </div>
          )}

          {/* ── 심사 중(pending) ── */}
          {auth.status === "pending" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7 text-amber-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">심사 중입니다</p>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  제출하신 자격 정보를 관리자가 확인하고 있습니다. 승인 완료 시 상세분석·의견서 발행이 활성화됩니다.
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 px-4 py-3 text-left text-sm text-gray-600 space-y-1.5">
                <div className="flex justify-between"><span className="text-gray-400">자격 유형</span><span className="font-medium">{auth.licenseType ? LICENSE_LABELS[auth.licenseType] : "-"}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">성명</span><span className="font-medium">{auth.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">등록번호</span><span className="font-medium">{auth.licenseNo}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">증빙</span><span className="font-medium truncate max-w-[180px]">{auth.evidenceFileName}</span></div>
              </div>
              {/* 프로토타입 데모: 관리자 심사(BO) 대체 — 실서비스는 BO 인증 심사 화면에서 처리 */}
              <div className="rounded-xl border border-dashed border-gray-200 px-3 py-2.5">
                <p className="text-[11px] text-gray-400 mb-2">데모용 관리자 심사 (실서비스는 BO에서 처리)</p>
                <div className="flex gap-2">
                  <button onClick={() => rejectExpert("증빙 확인 필요")} className="flex-1 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">반려</button>
                  <button onClick={() => approveExpert()} className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">승인</button>
                </div>
              </div>
            </div>
          )}

          {/* ── 인증 완료(verified) ── */}
          {auth.status === "verified" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7 text-emerald-500" />
              </div>
              <div>
                <p className="text-base font-bold text-gray-900">전문가 인증 완료</p>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed">
                  상세분석·의견서 발행을 전문가 명의로 이용할 수 있습니다. 의견서는 검토·승인 후 발행됩니다.
                </p>
              </div>
              <div className="rounded-xl bg-emerald-50/60 px-4 py-3 text-left text-sm text-gray-700 space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-600 font-semibold mb-1"><FileCheck2 className="w-4 h-4" /> {auth.licenseType ? LICENSE_LABELS[auth.licenseType] : ""} 인증</div>
                <div className="flex justify-between"><span className="text-gray-400">성명</span><span className="font-medium">{auth.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">등록번호</span><span className="font-medium">{auth.licenseNo}</span></div>
                {auth.office && <div className="flex justify-between"><span className="text-gray-400">소속</span><span className="font-medium">{auth.office}</span></div>}
              </div>
              <button onClick={() => resetExpertAuth()} className="text-xs text-gray-400 hover:text-gray-600 transition-colors underline underline-offset-2">
                데모: 인증 초기화
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
