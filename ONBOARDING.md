# Expert2prototype — 작업 인수인계 (ONBOARDING)

세법/노무 AI 도우미 프로토타입. 다른 계정/환경의 Claude Code에서 이 문서를 읽고 **동일하게 이어서 작업**하기 위한 안내.

## 1. 저장소 / 브랜치
- 레포: `Parkeric1104/Expert2prototype`
- 작업 브랜치: `claude/cool-euler` (그리고 `main` — 둘 다 동일하게 유지)
- 최신 커밋: `0858c38` (이 문서 추가 시점 기준)

## 2. 환경 / 실행
- 스택: React + TypeScript + Vite, Tailwind, lucide-react, sonner(toast)
- 개발: `npm install` → `npm run dev` (포트 **5273**, `vite.config.ts`의 `server.port` + `strictPort`)
- 빌드: `npm run build` (esbuild — 미사용 import 등은 관대)
- 미리보기 검증: 가능하면 preview 도구로 5273 포트에서 확인

## 3. 배포 (GitHub Pages)
- `.github/workflows/deploy-pages.yml` — **main 푸시 시 자동 빌드·배포**
- 배포 URL: https://parkeric1104.github.io/Expert2prototype/
- `vite.config.ts`: 프로덕션 빌드에서만 `base: '/Expert2prototype/'` (개발/프리뷰는 루트)

## 4. Git 작업 규칙
- 사용자가 요청할 때 커밋/푸시.
- 커밋 후 **두 곳에 푸시**: `git push origin claude/cool-euler` 와 `git push origin claude/cool-euler:main`
- 커밋 메시지 말미:
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`
- ⚠️ **Figma Make 푸시 중단 (코드가 정본/SSOT).** Figma Make로 다시 푸시하면 전체 스냅샷으로 코드 수정·`.github/workflows/deploy-pages.yml`·`vite.config.ts` base·문서가 덮어써지므로 **더 이상 Figma Make에서 푸시하지 않는다.** 디자인 가이드도 `guidelines/Guidelines.md`(저장소)에서 편집. (과거 푸시로 유실 시 직전 커밋에서 복원)

## 5. 핵심 화면/플로우 (현재 정책)
- 답변 유형 3종: 간단답변(`isSimpleResponse`) / 상세답변(`isEnhancedResponse`, 인라인 문서형) / 멀티턴(`isMultiTurnResponse`, 대화형 줄글).
  - 최초 답변은 질문 복잡도로 분류. 후속(멀티턴)은 **항상 멀티턴 답변**.
- 멀티턴 횟수: **3회**(최초 질문 미포함) → `MAX_QUESTIONS = 4`. 초과 시 세션 전환 모달.
- 상세답변 하단: **AI 상세의견**(그라데이션/진입카드) → 토론 오버레이(`ai-opinion-debate-panel.tsx`, 페르소나 2인 2라운드) → **반영하기** 시 답변에 `AI 의견 요약` 2카드(법률학자/분석가) + 하단 고지 노출. (`aiOpinionSummary`는 항상 객체형 pro/con이어야 2카드로 보임)
- **의견서 작성**: 채팅 하단 플로팅 버튼.
  - 라벨 분기: 최초 간단답변 → "상세 답변 받기" / 최초 상세답변·반영 후 → "의견서 작성"
  - 멀티턴 수행 시: 주제 선택 **바텀시트**(제안 2개 + 기타 1개, `opinion-topic-bottom-sheet.tsx`)
  - 단일 턴: 바텀시트 없이 — 최초 상세답변→바로 의견서 / 최초 간단답변→바로 상세답변
- 서비스 피드백 모달(`service-feedback-modal.tsx`): 긍정 5 / 부정 4 문항, 세션 종료 시 빈도 게이팅.

## 6. 주요 파일
- `src/app/components/modern-chat-interface.tsx` — 채팅/답변/플로우 메인
- `src/app/components/inline-detailed-answer.tsx` — 인라인 상세답변(+AI 의견 요약)
- `src/app/components/ai-opinion-debate-panel.tsx` — AI 상세의견 토론
- `src/app/components/opinion-topic-bottom-sheet.tsx` — 의견서 주제 선택
- `src/app/components/modern-home-view.tsx` — 홈/추천질문
- `src/app/data/dummy-responses.ts` — 더미 응답(`getDummyResponse`), `aiOpinionSummary` 등

## 7. 시작 체크리스트
1. `npm install` → `npm run dev` 동작 확인(5273)
2. `git log --oneline -15`로 최근 변경 맥락 파악
3. 변경 후 빌드 통과 확인 → 커밋 → 두 브랜치 푸시 → Pages 배포 확인
