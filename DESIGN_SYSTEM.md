# Expert2prototype — 디자인 시스템 (DESIGN SYSTEM)

세법/노무 AI 도우미 프로토타입의 디자인 토큰·컴포넌트·패턴 정리.
Claude(Code) 또는 다른 작업자가 **새 UI를 만들거나 수정할 때 이 문서를 기준**으로 삼는다.
모든 값은 실제 코드(`src/styles/theme.css`, `src/app/components/**`)에서 추출한 것이며, 임의 색/사이즈를 새로 만들지 말고 아래 토큰을 재사용한다.

---

## 0. 스택 / 기반
- **Tailwind CSS v4** (`@import 'tailwindcss'`) — config 파일 없이 `src/styles/theme.css`의 `@theme inline`으로 토큰 정의.
- **shadcn/ui** 프리미티브 48종 (`src/app/components/ui/`) + Radix UI 기반.
- 아이콘: **lucide-react** (전 컴포넌트 공통, 기본 `size-4` = 16px).
- 토스트: **sonner** (`<Toaster />` + `toast(...)`).
- 애니메이션: **tw-animate-css** 유틸 (`animate-in` / `animate-out` / `animate-pulse` / `animate-bounce`). framer-motion 미사용.
- 폰트: 별도 웹폰트 로드 없음 → **시스템 기본 sans 스택**(Tailwind 기본) 사용. (`fonts.css`는 비어 있음)
- 다크 모드: `.dark` 클래스 기반 (`@custom-variant dark`). 토큰은 정의되어 있으나 현재 프로토타입은 **라이트 모드 중심**.

> 색/반경/폰트는 **CSS 변수 → Tailwind 시맨틱 클래스**로 쓴다. 예: `bg-primary`, `text-muted-foreground`, `border-border`, `rounded-lg`. 가능하면 raw hex 대신 시맨틱 토큰을 쓴다.

---

## 1. 컬러 토큰 (Light — `:root`)

| 토큰 | 값 | Tailwind 클래스 | 용도 |
|---|---|---|---|
| `--background` | `#FAFAFC` | `bg-background` | 페이지 배경 |
| `--foreground` | `#1A1A1E` | `text-foreground` | 기본 텍스트 |
| `--card` | `#FFFFFF` | `bg-card` | 카드/표면 |
| `--card-foreground` | `#1A1A1E` | `text-card-foreground` | 카드 위 텍스트 |
| `--popover` | `#FFFFFF` | `bg-popover` | 팝오버/드롭다운 |
| **`--primary`** | **`#6366F1`** (Indigo) | `bg-primary` `text-primary` | **브랜드 주색 / 강조 / CTA** |
| `--primary-foreground` | `#FFFFFF` | `text-primary-foreground` | primary 위 텍스트 |
| `--secondary` | `#F3F4F6` | `bg-secondary` | 보조 표면/버튼 |
| `--secondary-foreground` | `#1A1A1E` | — | secondary 위 텍스트 |
| `--muted` | `#F3F4F6` | `bg-muted` | 약한 배경 |
| `--muted-foreground` | `#666673` | `text-muted-foreground` | 보조/설명 텍스트 |
| `--accent` | `#6366F1` | `bg-accent` | hover/선택 강조 |
| `--destructive` | `#EF4444` | `bg-destructive` | 삭제/경고/에러 |
| `--border` | `#E5E5EB` | `border-border` | 테두리/구분선 |
| `--input-background` | `#FFFFFF` | — | 입력 배경 |
| `--switch-background` | `#CBCED4` | — | 스위치 off |
| `--ring` | `#6366F1` | `ring-ring` | 포커스 링 |
| `--sidebar` | `#1C3A63` (네이비) | `bg-sidebar` | 사이드바 배경 |
| `--sidebar-primary` | `#007BFF` | — | 사이드바 강조 |

차트: `--chart-1`~`--chart-5` (oklch, shadcn 기본 팔레트).

> **Primary는 인디고 `#6366F1`** 가 단일 브랜드 컬러다. CTA·활성 칩·강조 텍스트는 모두 여기서 파생(`bg-primary`, `bg-primary/90` hover, `bg-primary/10` 연한 배경).

### 다크 모드 (`.dark`)
shadcn 기본 oklch 무채색 팔레트(`--background: oklch(0.145 0 0)` 등). 라이트와 동일한 토큰 이름을 재정의하므로 컴포넌트는 시맨틱 클래스만 쓰면 자동 대응.

---

## 2. 실사용 보조 컬러 (컴포넌트에서 직접 쓰는 hex)

토큰 외에 컴포넌트에서 반복 등장하는 값. **새 화면도 가급적 이 팔레트 안에서** 고른다.

| 색 | hex | 쓰임 |
|---|---|---|
| 인디고(브랜드) | `#6366F1`, `#4F46E5`(짙게) | 강조, 그라데이션 |
| 블루 | `#155DFC`, `#3182F6` | 링크/정보/액션 |
| 네이비(텍스트) | `#191F28`, `#111111` | 진한 헤딩 |
| 그레이 텍스트 | `#1A1A1E`, `#666673`, `#6B7280`, `#9CA3AF` | 본문~보조 |
| 보더/배경 그레이 | `#E5E7EB`, `#F3F4F6`, `#F9FAFB`, `#FAFAFB` | 구분선/면 |
| 앰버(주의/하이라이트) | `#F59E0B`, `#FDE68A`, `#FFFBEB`, `#FFF7ED` | 경고 배너/배지 |
| 그린(성공) | `#10B981`, `#ECFDF5` | 성공/긍정 |
| 인디고 연배경 | `#EEF2FF` | 강조 영역 배경 |

### 그라데이션 (AI 강조 영역의 시그니처)
AI 상세의견 진입 카드 등에서 사용:
```
bg-gradient-to-br from-purple-50 to-indigo-50      /* 연한 진입 카드 */
bg-gradient-to-r  from-purple-600 to-indigo-600    /* 강조 버튼/헤더 */
from-purple-500 / from-purple-700 / to-indigo-700  /* 변형 */
from-amber-400 to-orange-500                        /* 주의/하이라이트 */
```
**규칙:** AI/지능형 기능 = 퍼플→인디고 그라데이션, 주의/프리미엄 = 앰버→오렌지.

---

## 3. 반경 (Radius)

기준 변수 `--radius: 0.75rem (12px)`. 파생: `--radius-sm/md/lg/xl`.

| 클래스 | 값 | 쓰임 (빈도순) |
|---|---|---|
| `rounded-full` | 9999px | 칩, 아바타, 아이콘 버튼, 배지 (가장 많이 씀) |
| `rounded-lg` | `var(--radius)` 12px | 버튼/입력/작은 카드 (기본) |
| `rounded-xl` | 16px | 카드 |
| `rounded-2xl` | — | 큰 카드/모달/바텀시트 |
| `rounded-md` | 10px | shadcn 기본(버튼 등) |
| `rounded-[16px]` | 16px | 일부 커스텀 카드 |

> 기본 컨테이너는 `rounded-xl`~`rounded-2xl`, 인터랙티브 요소는 `rounded-lg`, pill 형태는 `rounded-full`.

---

## 4. 그림자 (Shadow)

| 클래스 | 쓰임 |
|---|---|
| `shadow-sm` | 카드/입력 기본 떠 있음 (가장 많음) |
| `shadow-md` | hover 상승, 약한 강조 |
| `shadow-lg` | 떠 있는 패널 |
| `shadow-xl` / `shadow-2xl` | 모달, 바텀시트, 플로팅 오버레이 |

> 기본 표면은 `shadow-sm`, 오버레이(모달/시트)는 `shadow-2xl`.

---

## 5. 타이포그래피

`--font-size: 16px` (html base). 폰트 패밀리는 시스템 sans. weight 토큰: `--font-weight-normal: 400`, `--font-weight-medium: 500`.

### HTML 기본 (`@layer base`, line-height 1.5)
| 요소 | 크기 | weight |
|---|---|---|
| `h1` | `text-2xl` | medium(500) |
| `h2` | `text-xl` | medium |
| `h3` | `text-lg` | medium |
| `h4` / `label` / `button` | `text-base` | medium |
| `input` | `text-base` | normal(400) |

> Tailwind 유틸(`text-sm` 등)을 붙이면 위 기본을 덮어쓴다.

### 실사용 크기 분포 (빈도순)
`text-sm`(본문 기본, 압도적) → `text-xs`(보조/캡션/배지) → `text-base` → `text-lg` → `text-xl` → `text-2xl`/`text-3xl`(히어로/타이틀).

> **본문 기본은 `text-sm`**, 메타/캡션은 `text-xs`, 제목만 `text-lg` 이상. weight는 강조 시 `font-medium`/`font-semibold`.

---

## 6. 컴포넌트

### 6-1. UI 프리미티브 (`src/app/components/ui/`, 48종, shadcn/ui)
button, input, textarea, select, checkbox, radio-group, switch, slider, label, form,
dialog, alert-dialog, sheet, drawer, popover, hover-card, tooltip, dropdown-menu, context-menu, menubar, navigation-menu,
accordion, collapsible, tabs, card, badge, alert, table, pagination, breadcrumb,
avatar, separator, scroll-area, resizable, sidebar, skeleton, progress, calendar, carousel, command, input-otp, chart, sonner, toggle, toggle-group, aspect-ratio, sheet 등.
→ **새 UI는 raw HTML 대신 이 프리미티브를 우선 사용.**

### 6-2. Button 변형 (`ui/button.tsx`, cva)
공통: `rounded-md text-sm font-medium`, 포커스 링 `focus-visible:ring-[3px]`, 아이콘 자동 `size-4`.

| variant | 스타일 | 용도 |
|---|---|---|
| `default` | `bg-primary text-primary-foreground hover:bg-primary/90` | 주 CTA |
| `secondary` | `bg-secondary hover:bg-secondary/80` | 보조 |
| `outline` | `border bg-background hover:bg-accent` | 외곽선 |
| `ghost` | `hover:bg-accent` | 저강조 |
| `destructive` | `bg-destructive text-white` | 위험 |
| `link` | `text-primary underline` | 링크형 |

| size | 높이 |
|---|---|
| `default` | h-9 / px-4 |
| `sm` | h-8 / px-3 |
| `lg` | h-10 / px-6 |
| `icon` | size-9 정사각 |

### 6-3. 피처 컴포넌트 (`src/app/components/*.tsx`, 51종) — 핵심만
- `modern-chat-interface.tsx` — 채팅/답변/플로우 메인 (오케스트레이터)
- `modern-home-view.tsx` — 홈/추천 질문
- `inline-detailed-answer.tsx` — 인라인 상세답변(+AI 의견 요약 2카드)
- `ai-opinion-debate-panel.tsx` — AI 상세의견 토론 오버레이(퍼플→인디고 그라데이션 시그니처)
- `opinion-topic-bottom-sheet.tsx` — 의견서 주제 선택 바텀시트
- `multi-turn-response.tsx` / `simple-response-card.tsx` — 답변 유형별 표현
- `service-feedback-modal.tsx` / `opinion-feedback-modal.tsx` — 피드백 모달
- `top-header.tsx` — 상단 GNB
- 모달/시트 다수(`*-modal.tsx`, `*-sidebar.tsx`, `*-bottom-sheet.tsx`)

---

## 7. 패턴 / 컨벤션

- **시맨틱 토큰 우선**: 색은 `bg-primary`/`text-muted-foreground`/`border-border` 등으로. raw hex는 그라데이션 등 토큰에 없는 경우만.
- **카드**: `bg-card rounded-xl border border-border shadow-sm p-4~6`.
- **모달/시트**: shadcn `Dialog`/`Sheet`/`Drawer` + `shadow-2xl rounded-2xl`. 바텀시트는 `Drawer`/`Sheet` 하단 변형.
- **칩/배지**: `rounded-full px-3 py-1 text-xs`. 활성 = `bg-primary text-primary-foreground`, 비활성 = `bg-secondary text-secondary-foreground`.
- **아이콘**: lucide-react, 기본 16px(`size-4`), 텍스트와 `gap-2`.
- **토스트**: `import { toast } from 'sonner'` → `toast.success/error(...)`. 루트에 `<Toaster />` 1개.
- **애니메이션**: 진입/퇴장은 `animate-in fade-in slide-in-from-*` / `animate-out`. 로딩은 `animate-pulse`(스켈레톤)·`animate-bounce`.
- **AI 강조 영역**: 퍼플→인디고 그라데이션 + 별/스파클 아이콘으로 "지능형" 시각 언어 통일.
- **간격**: gap/padding은 4의 배수(`gap-2/3/4`, `p-4/6`) 유지.

---

## 8. 새 컴포넌트 추가 체크리스트
1. shadcn 프리미티브로 해결되는지 먼저 확인 (`ui/`).
2. 색은 시맨틱 토큰(`bg-card`, `text-foreground`, `border-border`)으로. 브랜드 강조는 `primary`(인디고).
3. 반경 `rounded-xl`(카드)/`rounded-lg`(버튼·입력)/`rounded-full`(칩), 그림자 `shadow-sm`(면)/`shadow-2xl`(오버레이).
4. 본문 `text-sm`, 캡션 `text-xs`, 제목 `text-lg+` + `font-medium`.
5. 아이콘은 lucide, 토스트는 sonner, 진입 애니메이션은 `animate-in`.
6. 다크 모드 깨지지 않게 raw hex 남발 금지(시맨틱 토큰이 자동 대응).
