# 세법/노무도우미 디자인 가이드

법률 검색 및 의견서 작성 AI 챗봇의 디자인 언어. 신뢰감·명료함·접근성을 핵심 가치로 한다.

---

## 1. 색상 (Color Tokens)

모든 색상은 CSS 변수로 관리되며, Tailwind 유틸리티(`bg-primary`, `text-foreground` 등)로 사용한다.

### 라이트 모드 토큰

| 토큰 | 값 | 용도 |
|---|---|---|
| `--background` | `#FAFAFC` | 전체 페이지 배경 |
| `--foreground` | `#1A1A1E` | 본문 텍스트 |
| `--card` | `#ffffff` | 카드·입력창 배경 |
| `--primary` | `#6366F1` | 인디고 강조색 (칩 선택, 링크, 아이콘) |
| `--primary-foreground` | `#ffffff` | primary 위 텍스트 |
| `--muted` | `#F3F4F6` | 비활성 배경 |
| `--muted-foreground` | `#666673` | 보조 텍스트·아이콘 |
| `--border` | `#E5E5EB` | 경계선 |
| `--destructive` | `#EF4444` | 에러·경고 |
| `--radius` | `0.75rem` | 기본 라운드 반경 |

### 고정 색상 (예외 허용)

| 값 | 용도 |
|---|---|
| `#3182F6` | 의견서 작성·플로팅 버튼 (토스 블루) |
| `linear-gradient(180deg, #FFFFFF 0%, #FFFFFF 35%, #E9EAFB 75%, #C9CCF4 100%)` | 전체 화면 배경 그라데이션 |

### AI 페르소나 색상 (고정)

```
AI 엄격한 법률학자  ring-blue-200 / text-blue-600  / 말풍선 bg-blue-600 (우측)
AI 실무형 분석가    ring-purple-200 / text-purple-600 / 말풍선 bg-purple-600 (좌측)
사회자(도비)        bg-muted (좌측)
```

---

## 2. 타이포그래피

폰트: 시스템 sans-serif. 별도 Google Fonts 없음.

### 크기 체계

| 클래스 | 용도 |
|---|---|
| `text-[22px]` | 메인 인삿말 |
| `text-xl` / `text-lg` | 섹션 제목, 모달 헤더 |
| `text-base` (16px) | UI 레이블, 버튼 |
| `text-sm` (14px) | 카드 본문, 답변 텍스트 |
| `text-xs` (12px) | 보조 라벨, 메타 정보 |
| `text-[11px]` | 최소 레이블 (`(상세답변)` 접미사) |
| `text-[10px]` | AI 페르소나 이름 태그 |

### 굵기 규칙

- `font-bold` — 섹션 제목, 강조 키워드
- `font-semibold` — 버튼, 활성 탭
- `font-medium` — 레이블, 칩
- `font-normal` — 본문, 멀티턴 답변

### 한국어 줄바꿈

```tsx
style={{ wordBreak: "keep-all" }}   // 단어 중간 줄바꿈 방지 — 필수
```

---

## 3. 간격 & 라운드

### 패딩 패턴

| 컨텍스트 | 패딩 |
|---|---|
| 카드 내부 (본문) | `px-6 py-5` |
| 카드 내부 (항목 행) | `px-5 py-4` |
| 원형 아이콘 버튼 | `w-9 h-9` |
| 텍스트 버튼 | `px-4 py-2` |
| 칩 | `px-3.5 py-1.5` |
| 법령 칩 | `pl-1.5 pr-3 py-1.5` |

### 라운드 패턴

| 값 | 용도 |
|---|---|
| `rounded-full` | 원형 버튼, 칩, 아바타, 플로팅 버튼 |
| `rounded-2xl` | 입력 카드, 인라인 답변 메인 카드, 바텀시트 항목 |
| `rounded-xl` | 추천질문 카드, 법령·해석례 항목 |
| `rounded-lg` | 법령 배지 칩 |
| `rounded-t-3xl` | 바텀시트 상단 |

---

## 4. 배경 & 표면

### 전체 화면 배경 (모든 뷰 동일)

```css
background: linear-gradient(180deg,
  #FFFFFF 0%,   #FFFFFF 35%,
  #E9EAFB 75%,  #C9CCF4 100%
);
```

### 카드 표면 계층

```
배경(#FAFAFC)
  └─ 카드(#ffffff · border-border/60 · shadow-sm)
       └─ 강조 섹션(bg-primary/5 · border-primary/20)
            └─ 배지/칩(bg-primary/10 · bg-indigo-50)
```

---

## 5. 컴포넌트 패턴

### 기본 카드

```tsx
<div className="bg-card border border-border/60 rounded-xl px-5 py-4 shadow-sm">
```

호버 인터랙션 포함:
```tsx
className="... hover:border-primary/40 hover:bg-primary/5 transition-all group"
```

### 원형 버튼

```tsx
// 아웃라인
<button className="h-9 w-9 rounded-full border border-border bg-card
  text-foreground/70 hover:text-foreground hover:bg-muted/60 transition-colors
  flex items-center justify-center">

// Primary fill (전송)
<button className="h-9 w-9 bg-primary text-primary-foreground rounded-full
  hover:bg-primary/90 transition-all
  disabled:bg-muted disabled:text-muted-foreground/50 disabled:cursor-not-allowed
  flex items-center justify-center">
```

### 플로팅 액션 버튼

```tsx
<div className="fixed bottom-28 left-0 right-0 z-30 flex justify-center pointer-events-none">
  <button
    className="pointer-events-auto flex items-center gap-1.5 rounded-full
      pl-4 pr-5 py-3 shadow-xl text-sm font-semibold text-white
      transition-all hover:opacity-90 active:scale-95"
    style={{ background: '#3182F6' }}
  >
    <FileText className="w-4 h-4" />
    {label}
  </button>
</div>
```

### 카테고리 칩

```tsx
// 비선택
<button className="px-3.5 py-1.5 rounded-full text-xs font-medium
  bg-card border border-border text-foreground/70
  hover:border-primary/40 transition-all">

// 선택됨
<button className="px-3.5 py-1.5 rounded-full text-xs font-medium
  bg-primary text-primary-foreground border border-primary shadow-sm">
```

### AI 페르소나 카드 (AI 의견 요약)

```tsx
<div className="flex items-start gap-4 bg-card border border-border/60 rounded-xl p-4">
  <div className="flex flex-col items-center gap-1 flex-shrink-0 w-16">
    <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-blue-200">
      <img src={characterImg} alt="AI 엄격한 법률학자" className="w-full h-full object-cover" />
    </div>
    <span className="text-[10px] font-semibold text-blue-600 text-center leading-tight">
      AI 엄격한<br/>법률학자
    </span>
  </div>
  <p className="text-sm leading-relaxed text-foreground flex-1 pt-0.5">{내용}</p>
</div>
```

### 바텀시트

```tsx
<div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
<div className="fixed bottom-0 left-0 right-0 z-50 bg-background rounded-t-3xl shadow-2xl
  animate-in slide-in-from-bottom duration-300">
  <div className="mx-auto w-full max-w-3xl px-6 pt-5 pb-7">
    <div className="w-10 h-1 rounded-full bg-border mx-auto mb-4" />
    {/* 내용 */}
  </div>
</div>
```

---

## 6. 아이콘

`lucide-react`만 사용한다.

### 크기 기준

| 크기 | 용도 |
|---|---|
| `w-3 h-3` | 인라인 소형 |
| `w-3.5 h-3.5` | 칩 내부 |
| `w-4 h-4` | 버튼·헤더 (기본) |
| `w-5 h-5` | 섹션 헤더 |
| `w-6 h-6` | 강조 아이콘 |

### 주요 아이콘 매핑

| 아이콘 | 용도 |
|---|---|
| `FileText` | 의견서 작성 버튼, AI 의견 요약 헤더 |
| `Sparkles` | AI 상세의견 진입 카드 |
| `Scale` | 법률 관련 배경 아이콘, 브랜드 |
| `ArrowRight` | 추천질문 카드 화살표 |
| `X` | 닫기 버튼 |
| `ChevronRight` | 바텀시트 항목 화살표 |
| `Send` | 전송 버튼 |
| `Paperclip` | 파일 첨부 |
| `ExternalLink` | 멀티턴 출처 링크 |
| `Square` | 스트리밍 중단 |

---

## 7. 레이아웃

### 최대 너비

| 컨텍스트 | max-width |
|---|---|
| 홈 화면 콘텐츠 | `max-w-[760px]` |
| 채팅·인라인 답변 | `max-w-3xl` (768px) |
| 입력창·바텀시트 | `max-w-3xl` |

### Z-index 계층

```
배경 floating 아이콘   z-0
채팅 메시지           (흐름)
플로팅 버튼           z-30
사이드 패널           z-40
바텀시트 오버레이     z-50
바텀시트             z-50
```

---

## 8. 인터랙션

### 트랜지션

```tsx
transition-all      // 레이아웃 변화 포함 (기본 300ms)
transition-colors   // 색상만
```

### 호버 상태 패턴

```tsx
카드:           hover:border-primary/40 hover:bg-primary/5
버튼(아웃라인): hover:bg-muted/60 hover:text-foreground
버튼(primary):  hover:bg-primary/90
플로팅 버튼:    hover:opacity-90 active:scale-95
```

### 등장 애니메이션

```tsx
// 섹션 페이드인
className="animate-in fade-in duration-300"

// 바텀시트 슬라이드업
className="animate-in slide-in-from-bottom duration-300"
```

### 스트리밍 커서

```tsx
<span className="inline-block w-[2px] h-[1.1em] align-text-bottom ml-0.5
  bg-primary animate-pulse" />
```

---

## 9. 답변 형태별 스타일

### 간단 답변 (SimpleResponseCard)

- 흰 카드 `bg-card rounded-2xl shadow-sm border border-border/60`
- 제목 + 불릿 구조, 근거 법령 칩(인디고 배지)

### 멀티턴 답변 (MultiTurnResponse)

- 흰 카드 `rounded-2xl px-6 py-5`
- 서식 없는 줄글 `text-[15px] leading-relaxed font-normal whitespace-pre-line`
- 하단 출처 링크(사규 제외) `text-primary hover:underline`

### 인라인 상세 답변 (InlineDetailedAnswer)

- 메인 카드 `rounded-2xl shadow-sm border border-border/60 px-6 py-5`
- 섹션 제목 `text-[15px] font-bold text-primary mb-2`
- 섹션 구분선 `pt-4 border-t border-border`
- 섹션 순서: **사실관계 → 질의내용 → 검토내용 → 결론 → 근거법령 → 해석례 → 판례 → AI 상세의견**

---

## 10. 고지 문구 (법적 안내)

### 홈 화면 하단

> AI 답변은 참고용이며 법적 효력이 없습니다. 최종 의사결정 시 반드시 전문가의 확인을 거치시기 바랍니다.

`text-xs text-muted-foreground text-center`

### AI 의견 요약 하단

> AI 의견은 참고용이며 부정확한 정보가 포함될 수 있습니다. 중요한 결정은 전문가 상담을 권장드립니다.

`text-[11px] text-muted-foreground text-center leading-relaxed mt-4`

---

## 11. 금지 패턴

- ❌ Tailwind 토큰으로 대체 가능한 값을 인라인 `style`에 사용
- ❌ `#3182F6`(버튼 전용)을 `primary` 전체에 사용
- ❌ `rounded-none` — 모든 요소에 라운드 필수
- ❌ 모달·바텀시트에 그림자 생략 (`shadow-xl` 이상 필수)
- ❌ 배경 그라데이션 없이 단색 흰 배경만 사용
- ❌ AI 페르소나 색상 혼용 (법률학자=파랑, 분석가=보라 고정)
- ❌ `wordBreak: "break-all"` — 반드시 `keep-all` 사용
