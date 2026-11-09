# Expert Back-Office (BO) — 코드 미러

> ⚠️ 이 저장소(`Expert2prototype-bo`)는 **읽기 전용 미러**입니다.
> 원본: [Expert2prototype/src/app/bo](https://github.com/Parkeric1104/Expert2prototype/tree/main/src/app/bo) — 수정은 반드시 원본 저장소에서 하세요(여기에 푸시해도 다음 동기화 때 덮어써집니다).
> 용도: **Figma 동기화 등 BO 코드만 참조**할 때 FE 코드와 섞이지 않도록 분리 제공. FE 모듈(`@/app/components/ui/*`, `@/app/data/service-content`)에 의존하므로 **단독 빌드는 불가**한 참조용 스냅샷입니다.

세법/노무 AI 도우미의 운영 백오피스(SVC-004). 실물 화면: https://parkeric1104.github.io/Expert2prototype/?bo (데모: admin / expert2!)

## 파일 ↔ 화면 맵 (Figma 프레임 대응)

| 파일 | 화면 |
|---|---|
| `BOApp.tsx` | 콘솔 셸 — 사이드바·로그인 게이트·메뉴·로그아웃 |
| `bo-login.tsx` | BO_LOGIN(아이디 저장·자동 로그인) + BO_PW_CHANGE(초기 비밀번호 변경 강제) |
| `account-admin.tsx` | BO_ACCOUNT_LIST + BO_ACCOUNT_REGIST_POPUP (초기 PW 0000) |
| `notice-admin.tsx` | BO_NOTICE_LIST + BO_NOTICE_REGIST (유형 직접입력·미리보기) |
| `popup-admin.tsx` | BO_POPUP_LIST + BO_POPUP_REGIST (순차 큐 최대 3개·미리보기) |
| `version-admin.tsx` | BO_VERSION (조회 전용 — 자동 기록) |
| `curation-admin.tsx` | 체크포인트(큐레이션) 관리 |
| `expert-review-admin.tsx` | 전문가 검토 관리 |
| `bo-ui.tsx` | 공용 UI — 카드·상태 dot·칩·세그먼트·확인 모달·페이지네이션 |
| `bo-store.ts` / `expert-review-store.ts` | 데이터 모델·노출 규칙 (localStorage 프로토타입) |

## 디자인 기준

apps in toss 콘솔 룩 — 원본 저장소의 [BO_DESIGN_REFERENCE.md](https://github.com/Parkeric1104/Expert2prototype/blob/main/BO_DESIGN_REFERENCE.md) 참조. 요지: 옅은 회색 배경(#F4F6F8) + 흰 카드(rounded-2xl), Primary #5784FF, 상태 dot 테이블, 라벨 빨간 dot 필수표시, 폼 미리보기 패널.
