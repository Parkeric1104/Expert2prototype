# BO 구축 프롬프트 — 전문가 인증 심사 (SVC/EXP)

> Expert2prototype BO(백오피스)에 **전문가 인증 심사** 기능을 구축하기 위한 스펙/프롬프트.
> 근거: 세법/노무도우미 법무검토 결과보고(260928). FE 전문가 인증(자격 검증)은 이미 적용됨(커밋 `1d61a8d`).

## 0. 배경 (법무 요건)
세법/노무도우미의 **상세분석·의견서 발행**은 무자격자 유상 법률/세무/노무 사무 리스크가 있어,
**자격 검증 + 전문가 업무보조 + 운영 통제**를 전제로 **전문가(세무사·공인노무사·변호사)** 에게만 제공한다.
협회·공공API 자동 자격확인이 **불가**하므로 검증은 **BO 관리자 수기 심사**로 처리한다.

## 1. 목적
- 전문가 인증 **신청 건을 BO에서 수기 심사**(승인/반려/보완요청)한다.
- 승인 시 해당 사용자에게 **전문가 권한**을 부여(FE 상세분석·의견서 발행 활성).
- 모든 심사 처리에 **사유·감사로그**를 남긴다(운영 통제).

## 2. FE 연동 (이미 구현됨 — 재사용)
- 스토어: `src/app/data/expert-auth.ts`
  - 상태값: `none | pending | verified | rejected`
  - 함수: `getExpertAuth()`, `applyExpertVerification()`, `approveExpert()`, `rejectExpert(reason)`, `resetExpertAuth()`
  - 훅: `useExpertAuth()` (localStorage + custom event `expert-auth-changed` + storage/focus 동기화)
- FE는 이 상태를 읽어 ▲사이드바 배지 ▲의견서 운영통제(초안 워터마크·전문가 검토·승인)에 사용.
- **BO 심사에서 `approveExpert()`/`rejectExpert()`를 호출하면 FE에 즉시 반영**된다(같은 스토어·이벤트).

> 프로토타입은 단일 사용자 모델이라 `expert-auth`는 '현재 사용자(me)' 1건 상태를 보유.
> BO 심사 목록의 현실감을 위해 **데모 신청 시드 + me 신청(현재 상태)** 를 함께 노출한다.

## 3. 데이터 모델 (BO)
신규 스토어 `src/app/bo/expert-review-store.ts` (localStorage, bo-store 패턴 준용):

```ts
type ExpertLicenseType = "tax" | "labor" | "law";       // 세무사/공인노무사/변호사
type ExpertReviewStatus = "pending" | "verified" | "rejected" | "hold"; // hold=보완요청

interface ExpertApplication {
  id: string;                 // 'me' = FE 현재 사용자 신청, 그 외 데모 시드
  licenseType: ExpertLicenseType;
  name: string;
  licenseNo: string;
  office?: string;
  evidenceFileName?: string;  // 증빙(프로토타입: 파일명만)
  status: ExpertReviewStatus;
  submittedAt: string;        // ISO
  decidedAt?: string;
  decidedBy?: string;         // 심사 관리자 loginId
  reason?: string;            // 반려/보완 사유
}

interface ExpertAuditLog {
  at: string; actor: string; action: "approve"|"reject"|"hold"; targetId: string; reason?: string;
}
```
- 시드: pending 2건 + verified 1건(데모).
- 목록 = 데모 시드 + `getExpertAuth()`가 `none`이 아니면 me 행(현재 상태) 합성.
- 심사 처리:
  - 대상이 me → `approveExpert()` / `rejectExpert(reason)` 호출(FE 반영) + 감사로그.
  - 대상이 데모 → 스토어 업데이트 + 감사로그.

## 4. 화면 (BOApp 섹션 추가)
`src/app/bo/BOApp.tsx`의 `Section`에 `"expert"` 추가, nav item **"전문가 인증"**(아이콘 `ShieldCheck`).
컴포넌트 `src/app/bo/expert-review-admin.tsx` (bo-ui 재사용: PageHeader/Card/ChipButton/ConfirmModal/Pagination/inputCls).

### 4-1. 심사 목록
- 컬럼: 신청일 · 자격유형 · 성명 · 등록번호 · 소속 · 증빙 · 상태 · 처리
- 상태 필터: 전체/심사중(pending)/승인(verified)/반려(rejected)/보완요청(hold)
- 상태 배지 색: 승인=emerald, 심사중=amber, 반려=red, 보완=slate
- 페이지네이션(PAGE_SIZE 5, account-admin 준용)

### 4-2. 심사 상세(모달)
- 신청 정보 전체 + **증빙 파일명(프로토타입)** 표시(실서비스는 뷰어)
- 액션: **승인 / 반려 / 보완요청** — 반려·보완은 **사유 필수**
- 승인 확인 문구: "해당 전문가를 승인하면 상세분석·의견서 발행이 전문가 명의로 활성화됩니다."
- 처리 시 감사로그 기록(누가·언제·무엇을·사유)

### 4-3. 감사로그(선택 탭/섹션)
- 심사 이력 리스트(at·actor·action·target·reason) 조회 전용

## 5. 상태 전이
```
pending ──승인──▶ verified
pending ──반려(사유)──▶ rejected ──재신청(FE)──▶ pending
pending ──보완요청(사유)──▶ hold ──재제출(FE)──▶ pending
```
- rejected/hold 사유는 FE 신청 모달에 노출(이미 rejected 사유 노출 구현됨 — hold도 동일 패턴 권장).

## 6. 권한·접근
- BO 로그인 필수. 전문가 인증 심사는 **관리자(admin) 또는 지정 운영자** 권한만 노출(ACC-002 준용).
- 회사(운영자)는 **자격 검증·통계만** 수행하고 **의견 내용에는 개입하지 않는다**(법무: 지휘통제 방지). → 심사 화면에 의견서 내용 편집 기능 두지 않음.

## 7. 구현 가이드 (파일)
- 신규: `src/app/bo/expert-review-store.ts`, `src/app/bo/expert-review-admin.tsx`
- 수정: `src/app/bo/BOApp.tsx` (Section·nav·라우팅)
- 재사용: `src/app/bo/bo-ui.tsx`, `src/app/data/expert-auth.ts`
- 실행/검증: `npm run dev:bo` (5283) 또는 `?bo` · UI 검증 뷰포트 1024×760
- 커밋 규칙(CLAUDE.md): `src/**` 수정 시 커밋 + `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` + main·claude/cool-euler 푸시

## 8. 수용 기준 (Acceptance)
- [ ] BO에 '전문가 인증' 메뉴 노출(관리자 권한)
- [ ] 심사 목록·필터·상태 배지·페이지네이션 동작
- [ ] 상세 모달에서 승인/반려/보완(사유 필수) 처리
- [ ] me 신청 **승인 시 FE가 즉시 verified**로 반영(상세분석·의견서 발행 활성)
- [ ] me 신청 **반려/보완 시 FE 신청 모달에 사유 노출**
- [ ] 모든 처리 감사로그 기록
- [ ] 심사 화면에 **의견 내용 개입 기능 없음**(운영 통제)

## 9. 향후(범위 밖, 실서비스 전환 시)
- 실제 사용자·계정 체계 연동(다중 신청), 증빙 파일 업로드/뷰어, 협회 조회 연계(가능 시),
  전문가 권한 **유효기간·재검증·정지**, 통계(승인율·처리시간).
