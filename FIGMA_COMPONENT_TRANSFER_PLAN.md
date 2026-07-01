# Figma 컴포넌트 이관 계획 (Code → Figma)

React 프로토타입(`src/app/components/**`)의 컴포넌트를 Figma 네이티브 컴포넌트(+Variants)로 이관하는 계획.
방법: **`use_figma`(Figma Plugin API) 재구성** — 코드의 Tailwind 클래스에서 토큰 추출 → dev 서버(5273) 실제 렌더 대조 → Figma 컴포넌트 생성 → 변수/텍스트 스타일 바인딩 → 서버 스크린샷 검증.

## 대상 파일
- 이관 대상: **Expert2_통합** (fileKey `FqkbW0MWm5Z6jpsFv4L6A9`) 내 **신규 페이지**.
- 선행: 해당 파일에 컬러/radius **변수** + **텍스트 스타일** 생성(디자인 시스템 파일과 동일 토큰). 그 후 컴포넌트를 변수에 바인딩.
- ⚠️ 폰트: 파일은 Pretendard 사용이나 자동화 환경에 Pretendard 없음 → 텍스트는 **Inter로 대체** 생성(추후 데스크톱에서 Pretendard 지정 가능).

## 전략
- **UI 프리미티브 46개 대부분은 shadcn 표준** → Figma 커뮤니티 shadcn/ui 킷으로 대체 권장. 직접 생성은 선별한 폼 컨트롤만.
- **피처 컴포넌트 51개 = 앱 고유 UI**, 여기에 집중.

## Wave 계획

### Wave 0 — 완료 (5) *(별도 DS 파일에 생성됨)*
Button · Card · Badge/Chip · Input · Modal/Dialog

### Wave 1 — 폼·기초 프리미티브 (선별 12) ← 시작점
textarea · select · checkbox · radio-group · switch · slider · label · tabs · tooltip · alert · progress · skeleton
> 대체 권장(직접 생성 안 함): table, calendar, carousel, chart, menubar, sidebar, command, navigation-menu, resizable, pagination, breadcrumb, context-menu, hover-card, aspect-ratio, collapsible, accordion, dropdown-menu, popover, sheet, drawer, avatar, separator, scroll-area, input-otp, toggle, toggle-group, form, alert-dialog, sonner

### Wave 2 — 채팅/답변 도메인 (14)
modern-ai-response · chat-bubble · user-message-bubble · simple-response-card · multi-turn-response · inline-detailed-answer · invalid-question-card · question-feedback-card · action-chip · refinement-box · progressive-loading · stop-response-dialog · prompt-card · scenario-card

### Wave 3 — AI 의견·의견서 (10)
ai-opinion-debate-panel · dual-persona-debate · ai-debate-result-modal · ai-box-selection-modal · opinion-topic-bottom-sheet · opinion-feedback-modal · document-view · document-complete-modal · export-modal · detail-modal

### Wave 4 — 히스토리/법령/사이드바 (8)
history-sidebar-panel · enhanced-chat-history-modal · sources-and-history-panel · answer-detail-sidebar · law-selection-modal · law-detail-sidebar · labor-sidebar · scope-selector

### Wave 5 — 정책 관리 (7)
policy-management-view · policy-registration-modal · policy-analysis-start-modal · auto-policy-review-modal · embedding-correction-view · policy-coach-mark · policy-coachmark

### Wave 6 — 피드백/세션/레이아웃 (8)
service-feedback-modal · session-limit-modal · chat-leave-confirm-modal · human-feedback-request · credit-status · top-header · dashboard-view · rotating-title

### 화면 컨테이너 (컴포넌트 준비 후 조립)
modern-chat-interface · modern-home-view · chat-interface

## 진행 방식
- Wave 단위로 진행, 각 Wave 종료 시 서버 스크린샷으로 검증 후 다음 Wave.
- 신규 페이지에 Wave별 섹션으로 배치, 컴포넌트명은 코드 파일명 기준.
