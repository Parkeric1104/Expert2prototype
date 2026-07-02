# 멀티턴 답변 LLM 프록시 (Gemini 무료 티어)

프론트엔드는 제공사에 종속되지 않은 `{ body, sources:[{name,url}] }` 계약만 알면 되도록 설계돼 있다.
이 프록시가 Google Gemini(무료 티어)를 호출해 그 형태로 되돌려준다.

- 프론트 계약: [`src/app/services/multi-turn-answer.ts`](../src/app/services/multi-turn-answer.ts) 의 `llmProvider`
- 요청: `POST { question, priorQuestions }`  →  응답: `{ body, sources:[{name,url}] }`

## 1. Gemini 무료 API 키 발급
1. https://aistudio.google.com/apikey (Google 계정으로 접속)
2. **Create API key** → `AIza...` 키 복사
3. 무료 티어는 분당/일당 요청 한도가 있음(프로토타입엔 충분). 결제수단 불필요.

> ⚠️ 이 키를 코드/깃/`.env`에 넣지 말 것. 아래 `wrangler secret`로만 등록한다.

## 2. 프록시 배포 (Cloudflare Workers, 무료)
```bash
npm i -g wrangler
wrangler login
cd proxy
wrangler deploy                       # 배포 → https://expert2-llm-proxy.<계정>.workers.dev URL 획득
wrangler secret put GEMINI_API_KEY    # 프롬프트에 AIza... 붙여넣기 (암호화 저장, 코드/깃에 안 들어감)
```
(선택) 허용 도메인 좁히기: `wrangler.toml`의 `ALLOW_ORIGIN` 주석 해제 후 내 GitHub Pages 도메인 지정.

## 3. 프론트엔드 연결
저장소 루트에 `.env.local` (git 커밋 금지 — URL만, 키 아님):
```
VITE_MULTI_TURN_PROVIDER=llm
VITE_LLM_ENDPOINT=https://expert2-llm-proxy.<계정>.workers.dev
```
`npm run dev` 재시작 → 멀티턴 답변이 실제 LLM(Gemini) 경유로 나온다.
되돌리려면 `VITE_MULTI_TURN_PROVIDER`를 빼거나 `llm`이 아니게 두면 즉시 더미로 복귀.

## 4. 프록시 단독 테스트
```bash
curl -X POST https://expert2-llm-proxy.<계정>.workers.dev \
  -H "Content-Type: application/json" \
  -d '{"question":"수습기간에도 최저임금이 적용되나요?","priorQuestions":[]}'
# → {"body":"...","sources":[{"name":"...","url":"..."}]} 형태면 정상
```

## 참고
- 로컬 개발용 실행: `wrangler dev` (로컬 URL을 `VITE_LLM_ENDPOINT`에 넣어 테스트 가능).
- 나중에 Claude(유료)로 바꾸려면 이 워커의 fetch 대상만 Anthropic API로 교체하면 됨(프론트 불변).
  요청 형태는 `src/app/services/multi-turn-answer.ts` 상단 주석 참고.
- Vercel/Netlify Functions로도 동일 로직 배포 가능(키는 각 대시보드 Environment Variables에 등록).
