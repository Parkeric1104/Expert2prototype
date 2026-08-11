# BO ↔ FE 연동정보 — SVC-004 운영 콘텐츠

> 2026-08-11 | 프로토타입 연동 구조와 운영(실서비스) 전환 시 API 계약 정리.
> 관련 문서: [BO_PRD.md](BO_PRD.md)(요구사항) · [BO_DESIGN_REFERENCE.md](BO_DESIGN_REFERENCE.md)(디자인)

## 1. 연동 구조 개요

FE(서비스)는 **`src/app/data/service-content.ts`의 getter 3개에만 의존**한다. BO가 어떤 방식으로 콘텐츠를 공급하든 이 getter 내부만 바뀌고 FE 화면 코드는 변경되지 않는다.

| Getter | 반환 | FE 사용처 |
|---|---|---|
| `getNotices(): Notice[]` | 현재 노출 대상 공지(최신순) | 사이드패널 공지사항 목록/상세, 종 레드닷(`getUnreadCount`) |
| `getEmergency(): Emergency` | 현재 노출 팝업(없으면 `active:false`) | 메인 중앙 공지 팝업 |
| `getServiceVersion(): ServiceVersion` | 서비스 버전·법령 DB 갱신일 | 메인 푸터, 법령 카테고리 하단 |

```
[프로토타입]  BO 콘솔(?bo) ── 저장 ──> localStorage(bo_*) ── 읽기 ──> getter ──> FE 화면
[운영 전환]   BO 콘솔      ── 저장 ──> BO API/DB          ── fetch ──> getter ──> FE 화면
```

## 2. 데이터 계약 (엔티티 스키마)

### Notice (공지사항)
| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | string | 고유 id |
| `type` | `"공지" \| "릴리즈노트"` | 유형(코드 고정, BO는 선택만) |
| `title` | string | ≤60자 |
| `body` | string | 프리텍스트(제한 없음), 줄바꿈 유지(`whitespace-pre-line`) |
| `date` | string `YYYY-MM-DD` | 작성일 |
| `important` | boolean? | 중요 태그 |
| `views` | number? | 조회수(집계값) |

### Emergency (공지팝업 — FE 노출 형태)
| 필드 | 타입 | 설명 |
|---|---|---|
| `active` | boolean | 노출 여부(활성 + 게시 기간 내) |
| `severity` | `"info" \| "warning" \| "critical"` | 안내/주의/긴급 — 아이콘·색 매핑 |
| `title` | string | ≤30자 |
| `message` | string | ≤150자 |
| `popupId` | string? | BO 관리 팝업 id |
| `revision` | number? | 수정/재활성화 시 증가 — '다시 보지 않기' 해제 기준 |

### ServiceVersion (버전정보)
| 필드 | 타입 | 설명 |
|---|---|---|
| `service` | string | 예: `v1.4.1` |
| `lawDataUpdatedAt` | string `YYYY-MM-DD` | 법령 DB 갱신일 |

### BO 내부 저장 모델 (BONotice / BOPopup — `src/app/bo/bo-store.ts`)
FE 계약에 더해 BO만 갖는 필드:
- `publishStart?` / `publishEnd?` (`YYYY-MM-DDTHH:mm`) — 게시 기간. **기간 판정·필터링은 공급자(BO) 책임**이며 FE에는 노출 대상만 전달된다.
- `createdAt` — 작성일(FE `date`로 매핑).
- Popup: `active`(원본 플래그) + `revision`.

## 3. 노출 규칙 (공급자 책임)

1. **공지 노출**: `publishStart ≤ now ≤ publishEnd` (미설정 측은 무제한). 기간 밖 공지는 `getNotices()` 결과에서 제외 — 예약(시작 전)·종료(종료 후) 공지는 FE에 전달되지 않는다.
2. **팝업 노출**: `active === true` AND 기간 내인 팝업 **1건**만. 없으면 `{ active: false }`.
3. **단일 팝업**: BO에서 활성화 시 기존 활성 팝업은 자동 비활성(bo-store `setPopupActive`).
4. **정렬**: 공지는 `date` 내림차순(최신순) — getter에서 보장.

## 4. '다시 보지 않기' / 리비전 규칙

- FE는 `localStorage["notice_popup_hidden_rev"]`에 **`{popupId}:{revision}`** 을 저장한다(App.tsx `onDontShowAgain`).
- 자동 노출 판정: `getEmergency()`의 `{popupId}:{revision}`이 저장값과 같으면 억제, 다르면 노출.
- BO에서 **수정 저장 또는 재활성화하면 revision이 +1** 되므로 '다시 보지 않기' 사용자에게도 재노출된다(POP-003).
- 정적 소스 폴백일 때 키는 `static:0`.

## 5. 공지 읽음(종 레드닷) 규칙

- FE는 `localStorage["read_notice_ids"]`(id 배열)로 읽음을 관리한다(`service-content.ts`).
- `getUnreadCount()` = 노출 대상 공지 중 읽지 않은 개수 → 사이드패널 종 레드닷.
- **BO에서 새 공지를 등록하면 새 id가 생기므로 자동으로 '안 읽음' 처리**되어 레드닷이 다시 켜진다. 별도 연동 불필요.

## 6. 프로토타입 연동 (현재 구현)

| 항목 | 값 |
|---|---|
| BO 진입 | URL `?bo` (예: `https://parkeric1104.github.io/Expert2prototype/?bo`) — `main.tsx`에서 분기 |
| 저장소 | `localStorage` — `bo_notices`(BONotice[]) / `bo_popups`(BOPopup[]) / `bo_version`(ServiceVersion) |
| 시드 | BO 최초 진입 시 정적 소스와 동일한 내용으로 자동 시드 |
| 폴백 | `bo_*` 키가 없으면 getter는 정적 `SERVICE_CONTENT` 사용 |
| 반영 시점 | 같은 브라우저에서 서비스 화면 **로드/새로고침 시** 반영(localStorage 동기 읽기) |
| 한계 | 브라우저(기기)별 저장 — 다른 사용자에게는 전파되지 않음. 실연동은 API 필요(아래 §7) |

## 7. 운영 전환 시 API 계약 (초안)

getter 내부를 아래 fetch로 교체(응답 스키마 = §2와 동일):

```
# 서비스(읽기) — 인증 없음, 캐시 허용
GET /api/content/notices   → Notice[]        (노출 대상만, 최신순)
GET /api/content/popup     → Emergency       (없으면 active:false)
GET /api/content/version   → ServiceVersion

# BO(쓰기) — 사내망 전제(SYS-002)
GET/POST        /api/admin/notices
PUT/DELETE      /api/admin/notices/{id}
GET/POST        /api/admin/popups
PUT/DELETE      /api/admin/popups/{id}
PUT             /api/admin/popups/{id}/active   (단일 활성 보장·revision 증가는 서버 책임)
GET/PUT         /api/admin/version
```

- **반영 지연(SYS-003)**: 읽기 API 캐시 TTL ≤ 1분 권장, 팝업 활성/비활성은 캐시 무효화로 즉시 반영.
- **노출 규칙(§3)·리비전 규칙(§4)은 서버(공급자)로 이관** — FE 로직은 그대로.
- 조회수 집계 도입 시: `POST /api/content/notices/{id}/view` (Phase 2, 현재 미구현).

## 8. 연동 파일 맵

| 파일 | 역할 |
|---|---|
| `src/app/data/service-content.ts` | FE 유일 접점(getter 3개 + 읽음 처리). BO 저장값 우선, 정적 폴백 |
| `src/app/bo/bo-store.ts` | BO 저장 모델·CRUD·노출 규칙·리비전·FE 공급 함수 |
| `src/app/bo/BOApp.tsx` 외 `src/app/bo/*` | BO 콘솔 UI(공지/팝업/버전) |
| `src/main.tsx` | `?bo` 진입 분기 |
| `src/app/App.tsx` | 팝업 자동 노출 + '다시 보지 않기'(`notice_popup_hidden_rev`) |
