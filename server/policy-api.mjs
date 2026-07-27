// 기획 정책 챗봇 — 로컬 API (Vite 개발서버 미들웨어, POC)
//
// `npm run dev` 하나로 프론트 + API가 같은 포트(5273)에서 동작한다.
// 데이터는 로컬 SQLite(data/policy-bot.db)에 저장 — server/policy-db.mjs 참조.
//
// 엔드포인트:
//   GET    /api/policy-bot/health     → { ok, docs, dbPath }
//   GET    /api/policy-bot/policies   → { docs: [{id,title,source,content,updated_at}] }
//   POST   /api/policy-bot/policies   → 문서 추가/수정 { id?, title, content, source? }
//   DELETE /api/policy-bot/policies?id=...
//   GET    /api/policy-bot/logs       → { logs: [...] } (최근 50건)
//   POST   /api/policy-bot/logs      → 대화 로그 저장 { question, answer, sources, offline }
//
// ⚠️ 프로덕션 빌드(GitHub Pages)에는 포함되지 않는다 — 프론트는 API 실패 시 번들 문서로 폴백.

import {
  DB_PATH,
  listPolicies,
  upsertPolicy,
  deletePolicy,
  insertChatLog,
  listChatLogs,
} from "./policy-db.mjs";

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

function json(res, status, data) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

/** @returns {import('vite').Plugin} */
export function policyBotApi() {
  return {
    name: "policy-bot-local-api",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url, "http://localhost");
        if (!url.pathname.startsWith("/api/policy-bot/")) return next();

        try {
          const route = url.pathname.replace("/api/policy-bot/", "");

          if (route === "health" && req.method === "GET") {
            return json(res, 200, { ok: true, docs: listPolicies().length, dbPath: DB_PATH });
          }

          if (route === "policies" && req.method === "GET") {
            return json(res, 200, { docs: listPolicies() });
          }

          if (route === "policies" && req.method === "POST") {
            const body = await readBody(req);
            if (!body.title || !body.content)
              return json(res, 400, { error: "title과 content는 필수입니다." });
            return json(res, 200, { saved: upsertPolicy(body) });
          }

          if (route === "policies" && req.method === "DELETE") {
            const id = url.searchParams.get("id");
            if (!id) return json(res, 400, { error: "id 쿼리 파라미터가 필요합니다." });
            deletePolicy(id);
            return json(res, 200, { deleted: id });
          }

          if (route === "logs" && req.method === "GET") {
            return json(res, 200, { logs: listChatLogs() });
          }

          if (route === "logs" && req.method === "POST") {
            const body = await readBody(req);
            insertChatLog({
              question: String(body.question ?? ""),
              answer: String(body.answer ?? ""),
              sources: body.sources,
              offline: !!body.offline,
            });
            return json(res, 200, { ok: true });
          }

          return json(res, 404, { error: "unknown route" });
        } catch (e) {
          console.error("[policy-bot-api]", e);
          return json(res, 500, { error: String(e?.message ?? e) });
        }
      });
    },
  };
}
