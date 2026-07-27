// 기획 정책 챗봇 — 로컬 SQLite DB (POC)
//
// Node 22.5+ 내장 node:sqlite 사용 — 외부 의존성 없음.
// DB 파일: data/policy-bot.db (gitignore — 로컬에만 존재)
// 최초 실행 시 docs/policies/*.md + 저장소 문서로 자동 시드된다.
//
// 나중에 정식 배포 시 이 스키마를 그대로 Neon/Supabase(Postgres)로 옮기면 된다.

import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(ROOT, "data");
export const DB_PATH = path.join(DATA_DIR, "policy-bot.db");

let db = null;

export function getDb() {
  if (db) return db;
  mkdirSync(DATA_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS policies (
      id         TEXT PRIMARY KEY,
      title      TEXT NOT NULL,
      source     TEXT NOT NULL,
      content    TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
    CREATE TABLE IF NOT EXISTS chat_logs (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      question   TEXT NOT NULL,
      answer     TEXT NOT NULL,
      sources    TEXT NOT NULL DEFAULT '[]',
      offline    INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);
  seedIfEmpty(db);
  return db;
}

function titleOf(content, fallback) {
  const m = content.match(/^#\s+(.+)$/m);
  return m ? m[1].trim() : fallback;
}

/** 저장소 문서 → 시드 대상 목록 (프론트 번들 KB와 동일한 소스 셋) */
function collectSeedDocs() {
  const docs = [];
  const policiesDir = path.join(ROOT, "docs", "policies");
  if (existsSync(policiesDir)) {
    for (const file of readdirSync(policiesDir)) {
      if (!file.endsWith(".md") || file.toLowerCase() === "readme.md") continue;
      const content = readFileSync(path.join(policiesDir, file), "utf-8");
      docs.push({
        id: `policies/${file}`,
        title: titleOf(content, file),
        source: `docs/policies/${file}`,
        content,
      });
    }
  }
  for (const [id, rel] of [
    ["onboarding", "ONBOARDING.md"],
    ["guidelines", "guidelines/Guidelines.md"],
    ["design-system", "DESIGN_SYSTEM.md"],
  ]) {
    const p = path.join(ROOT, rel);
    if (!existsSync(p)) continue;
    const content = readFileSync(p, "utf-8");
    docs.push({ id, title: titleOf(content, rel), source: rel, content });
  }
  return docs;
}

export function seedIfEmpty(database, { force = false } = {}) {
  const count = database.prepare("SELECT COUNT(*) AS n FROM policies").get().n;
  if (count > 0 && !force) return { seeded: 0, skipped: true };
  if (force) database.exec("DELETE FROM policies");
  const upsert = database.prepare(
    `INSERT INTO policies (id, title, source, content) VALUES (?, ?, ?, ?)
     ON CONFLICT(id) DO UPDATE SET title=excluded.title, source=excluded.source,
       content=excluded.content, updated_at=datetime('now', 'localtime')`,
  );
  const docs = collectSeedDocs();
  for (const d of docs) upsert.run(d.id, d.title, d.source, d.content);
  return { seeded: docs.length, skipped: false };
}

// ── 쿼리 헬퍼 ──

export function listPolicies() {
  return getDb().prepare("SELECT id, title, source, content, updated_at FROM policies ORDER BY id").all();
}

export function upsertPolicy({ id, title, source, content }) {
  const database = getDb();
  const docId = id || `policies/${title.replace(/\s+/g, "-").toLowerCase()}.md`;
  database
    .prepare(
      `INSERT INTO policies (id, title, source, content) VALUES (?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET title=excluded.title, source=excluded.source,
         content=excluded.content, updated_at=datetime('now', 'localtime')`,
    )
    .run(docId, title, source || docId, content);
  return database.prepare("SELECT id, title, source, updated_at FROM policies WHERE id = ?").get(docId);
}

export function deletePolicy(id) {
  getDb().prepare("DELETE FROM policies WHERE id = ?").run(id);
}

export function insertChatLog({ question, answer, sources, offline }) {
  getDb()
    .prepare("INSERT INTO chat_logs (question, answer, sources, offline) VALUES (?, ?, ?, ?)")
    .run(question, answer, JSON.stringify(sources ?? []), offline ? 1 : 0);
}

export function listChatLogs(limit = 50) {
  return getDb()
    .prepare("SELECT id, question, answer, sources, offline, created_at FROM chat_logs ORDER BY id DESC LIMIT ?")
    .all(limit);
}
