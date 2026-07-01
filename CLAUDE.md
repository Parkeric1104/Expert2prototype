# Expert2prototype — Claude 작업 지침

세법/노무 AI 도우미 프로토타입 (React + TypeScript + Vite + Tailwind v4, shadcn/ui, lucide-react).

## 문서 (작업 전 참조)
- **[guidelines/Guidelines.md](guidelines/Guidelines.md) — 디자인 단일 기준(SSOT).** Figma Make가 관리하는 정본 디자인 가이드. UI를 만들거나 수정할 때 반드시 먼저 읽고 그 토큰·패턴·금지사항을 따른다.
- [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) — 코드에서 추출한 디자인 시스템 요약.
- [ONBOARDING.md](ONBOARDING.md) — 저장소·실행·배포·플로우.
- [FIGMA_COMPONENT_TRANSFER_PLAN.md](FIGMA_COMPONENT_TRANSFER_PLAN.md) — 코드→Figma 컴포넌트 이관 계획.

## 디자인 하드룰 (guidelines/Guidelines.md §11 — 절대 위반 금지)
- 전체 화면 배경은 그라데이션 사용: `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 35%, #E9EAFB 75%, #C9CCF4 100%)` (단색 흰 배경만 쓰지 말 것). App 루트에 적용돼 있으며, 새 전체화면 뷰는 배경을 투명히 두어 상속받거나 동일 그라데이션을 준다.
- `#3182F6`(토스 블루)는 **의견서/플로팅 버튼 전용**. `primary`(인디고 `#6366F1`)와 혼용 금지.
- AI 페르소나 색 고정: **법률학자 = 파랑(blue-600/ring-blue-200)**, **분석가 = 보라(purple-600/ring-purple-200)**. 혼용 금지.
- 모든 요소에 라운드 필수(`rounded-none` 금지). 모달·바텀시트는 `shadow-xl` 이상 필수.
- 한국어 줄바꿈은 `wordBreak: "keep-all"` (절대 `break-all` 금지).
- Tailwind 토큰으로 대체 가능한 값을 인라인 `style`로 쓰지 말 것.

## 실행/배포
- 개발: `npm install` → `npm run dev` (포트 5273). 빌드: `npm run build`.
- 배포: main 푸시 시 GitHub Pages 자동 배포. `vite.config.ts`의 `base`는 프로덕션에서만 `/Expert2prototype/`.
- ⚠️ Figma Make 재푸시 시 스냅샷 덮어쓰기로 인프라 설정이 삭제될 수 있음 → 복원 필요.

## 작업 규칙 (커밋)
- **프로토타입 코드(`src/**`)를 수정하면 그 작업 단위가 끝날 때마다 반드시 커밋한다** (사용자 상시 요청).
- 커밋 메시지 말미: `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- ONBOARDING 규칙대로 커밋 후 두 곳에 푸시: `git push origin claude/cool-euler` 와 `git push origin claude/cool-euler:main` (현재 로컬은 main에서 작업 중이면 그에 맞춰 푸시).
