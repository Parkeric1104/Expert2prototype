---
name: figma-spec-doc
description: Figma "AI Expert" 기획서 파일에 화면 기획 프레임을 추가·수정할 때 사용. 기획서 프레임 관례(2238×1259, Title 헤더, Description 컴포넌트 표, Num_Tag 주석)와 컴포넌트 ID, 폰트 함정, use_figma 레시피를 담고 있다. "기획서 프레임 추가", "Figma 기획서 작성", "Description 주석" 등의 요청에서 트리거.
---

# Figma 기획서 작성 규칙 (AI Expert 파일)

Expert 2(세법/노무 AI 도우미) 기획서를 Figma에 작성할 때 따르는 규칙. **반드시 figma-use 스킬(skill://figma/figma-use/SKILL.md)을 먼저 로드**하고 use_figma로 작업한다.

## 대상 파일

- 파일: **AI Expert** — fileKey `FqkbW0MWm5Z6jpsFv4L6A9`
- 페이지 구성: COVER / INDEX / HISTORY / 00. IA / 01. MAIN / 02. CHAT / 03. HR_POLICY_MANAGE / 04. DEMO / **05. BO**(id `3235:86`) / Prototype / KPI / 매뉴얼 / Appendix / Archive / 99. COMPONENT
- 페이지 = 도메인(`NN. 이름`), 프레임 = 화면 상태. 새 도메인 페이지를 만들면 **INDEX 테이블(섹션 `11:1344`)에 행 추가 + 페이지 하이퍼링크**(`text.hyperlink = {type:"NODE", value: pageId}`) 필수.

## 프레임 관례 (2238×1259)

새 프레임은 **기존 프레임을 clone해서 시작**한다 (예: 05. BO의 프레임 하나를 복제 → 목업 영역만 삭제).

| 영역 | 위치/크기 | 내용 |
|---|---|---|
| Title | (0,0) 1640×105 | Project/Reported/Page Name 셀 — clone 후 Page Name 값 텍스트를 화면명으로 교체 |
| Frame 12647/12648 | (1640,0)/(1640,52) 598×53 | Version·PageCode 표 |
| Frame 650 | (1640,105) 598 | **Description 패널** (아래 구조) |
| 화면 목업 | (59,128) 1299×874 | 실제 UI 목업. 배경 프레임 fill #E8E8E8 유지 |

## Description 패널 구조 (컴포넌트 인스턴스 필수)

Frame 650 = VERTICAL auto-layout(hug), 내용:
1. `Description bar` 인스턴스 — 컴포넌트 id **`10:1141`** (회색 헤더 599×53)
2. 행(HORIZONTAL auto-layout) 반복:
   - `Description Numbering` 인스턴스 — **`10:1144`** (70px, 번호 텍스트 교체, `layoutSizingVertical="FILL"`)
   - `Description` 인스턴스 — **`10:1146`** (529px, 내용 텍스트 교체)

⚠️ **폰트 함정 (중요)**:
- 마스터 컴포넌트 `10:1146`의 텍스트에는 **Pretendard 세그먼트**가 섞여 있고 이 환경에 Pretendard가 없어 직접 인스턴스 생성 후 텍스트 편집이 실패한다.
- 해결: **05. BO 페이지에 이미 있는 Description 인스턴스(텍스트가 Inter로 통일됨)를 `clone()`** 해서 사용하고 characters만 교체한다.
- `Description Numbering` 텍스트 편집 전 `NanumGothic ExtraBold` 로드 필요 (try/catch로 ExtraBold/Bold/Regular 모두 로드).
- 새 텍스트는 모두 **Inter** (한글은 폴백 렌더, 파일 전체가 동일 방식).

⚠️ **textAutoResize 함정**: `resize()`를 호출하면 textAutoResize가 NONE으로 리셋되어 텍스트가 잘린다. 순서: `t.resize(490, h)` → **마지막에** `t.textAutoResize = "HEIGHT"`.

## Num_Tag (번호 주석)

- 30×30 FRAME, fill **#FC3D3D**(rgb 252,61,61), cornerRadius 0(사각형), 자식: Inter **Bold 18** 흰색 숫자(중앙 정렬).
- 프레임 최상위에 배치, 대상 UI 요소의 좌상단 근처. **Description 행 번호와 1:1 대응** 필수.
- 컴포넌트가 아님 — 매번 생성해도 됨.

## Description 내용 작성 규칙

- 형식: `제목 [REQ-ID]` + 줄바꿈 + 동작·규칙 나열 (예: `공지 등록 [NTC-002]\n선택 시 등록 화면으로 이동\n…`)
- REQ ID는 BO_PRD.md(SYS/NTC/POP/VER) 또는 서비스 요구사항 정의서(SVC/CHA/DAT) 기준.
- BO 화면 내용은 배포 프로토타입(https://parkeric1104.github.io/Expert2prototype/?bo) 최신 상태와 일치시킨다.

## 작업 순서 (권장)

1. 읽기 전용 스크립트로 대상 페이지·기존 프레임 확인
2. 기존 프레임 clone → 이름·Page Name 교체 → 목업 영역 비우기
3. 화면 목업 생성 (한 프레임 = 한 use_figma 호출, 팔레트: primary #5784FF≈rgb(0.341,0.518,1), 배경 #F4F6F8, 카드 흰색 rounded 14)
4. Description 행 + Num_Tag 추가 (인스턴스 clone 방식)
5. `await frame.screenshot()`으로 검증 — 텍스트 잘림·겹침 확인
