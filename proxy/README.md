# 멀티턴 답변 LLM 프록시 (Gemini 무료 티어 · Vercel)

프론트엔드는 제공사에 종속되지 않은 `{ body, sources:[{name,url}] }` 계약만 알면 되도록 설계돼 있다.
이 프록시(Vercel 서버리스 함수)가 Google Gemini(무료 티어)를 호출해 그 형태로 되돌려준다.

- 프론트 계약: [`src/app/services/multi-turn-answer.ts`](../src/app/services/multi-turn-answer.ts) 의 `llmProvider`
- 함수: [`api/multi-turn.js`](api/multi-turn.js)
- 요청: `POST { question, priorQuestions }`  →  응답: `{ body, sources:[{name,url}] }`
- 배포 후 엔드포인트: `https://<project>.vercel.app/api/multi-turn`

## 1. Gemini 무료 API 키 발급 (이미 완료)
1. https://aistudio.google.com/apikey → **Create API key** → `AIza...` 복사
2. 무료 티어는 분당/일당 요청 한도가 있음(프로토타입엔 충분). 결제수단 불필요.

> ⚠️ 이 키를 코드/깃/`.env`에 넣지 말 것. 아래 Vercel 환경변수로만 등록한다.

## 2. Vercel 배포 (GitHub 계정으로 로그인 — 별도 가입 불필요)
`proxy/` 폴더에서:
```
npx vercel login       # 브라우저 열림 → "Continue with GitHub" 로 로그인
npx vercel             # 첫 배포. 물어보면: 새 프로젝트 생성 / 현재 디렉터리(proxy)를 루트로 / 기본값 엔터
```
그다음 키를 환경변수로 등록하고 프로덕션 배포:
```
npx vercel env add GEMINI_API_KEY        # 값 프롬프트에 AIza... 붙여넣기, 적용 환경은 Production 선택
npx vercel --prod                         # 프로덕션 배포 → https://<project>.vercel.app URL 확정
```
(선택) 허용 도메인 좁히기: `npx vercel env add ALLOW_ORIGIN` → 값에 내 GitHub Pages 도메인.

> 대시보드로 해도 됨: vercel.com → Add New Project → GitHub 저장소 import →
> **Root Directory = `proxy`** 지정 → Environment Variables에 `GEMINI_API_KEY` 추가 → Deploy.

## 3. 프론트엔드 연결
저장소 루트에 `.env.local` (git 커밋 금지 — URL만, 키 아님):
```
VITE_MULTI_TURN_PROVIDER=llm
VITE_LLM_ENDPOINT=https://<project>.vercel.app/api/multi-turn
```
`npm run dev` 재시작 → 멀티턴 답변이 실제 LLM(Gemini) 경유로 나온다.
되돌리려면 `VITE_MULTI_TURN_PROVIDER`를 빼거나 `llm`이 아니게 두면 즉시 더미로 복귀.

## 4. 프록시 단독 테스트
```
curl -X POST https://<project>.vercel.app/api/multi-turn \
  -H "Content-Type: application/json" \
  -d '{"question":"수습기간에도 최저임금이 적용되나요?","priorQuestions":[]}'
# → {"body":"...","sources":[{"name":"...","url":"..."}]} 형태면 정상
```

## 참고
- 나중에 Claude(유료)로 바꾸려면 `api/multi-turn.js`의 fetch 대상만 Anthropic API로 교체(프론트 불변).
  요청 형태는 `src/app/services/multi-turn-answer.ts` 상단 주석 참고.
- Netlify Functions로도 동일 로직 배포 가능(키는 대시보드 Environment Variables에 등록).
