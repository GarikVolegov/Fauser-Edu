#!/usr/bin/env node
// One-command local development: brings up Postgres + API + web together.
//
//   pnpm dev
//
// - Loads .env.local (if present) for DATABASE_URL / Clerk keys / ports.
// - Starts the embedded dev Postgres (skips if something already listens on it).
// - Builds + runs the API server, then runs the Vite dev server.
// - With no Clerk keys set, both tiers fall back to a mock signed-in user.
// - Ctrl-C tears everything down.

import { spawn, execSync } from "node:child_process";
import { createConnection } from "node:net";
import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import readline from "node:readline";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// --- env ---------------------------------------------------------------
function loadEnvLocal() {
  const file = path.join(repoRoot, ".env.local");
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || line.trimStart().startsWith("#")) continue;
    out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const envLocal = loadEnvLocal();
const env = { ...process.env, ...envLocal };
const API_PORT = env.API_PORT || "8080";
const WEB_PORT = env.WEB_PORT || "3100";
const BASE_PATH = env.BASE_PATH || "/";
const DATABASE_URL =
  env.DATABASE_URL || "postgres://postgres:postgres@localhost:5433/fauser";
const DB_PORT = Number(new URL(DATABASE_URL).port || 5432);

// --- helpers -----------------------------------------------------------
const children = [];
let dbChild = null;
let shuttingDown = false;

function prefix(child, tag, color) {
  const paint = (s) => `\x1b[${color}m[${tag}]\x1b[0m ${s}`;
  for (const stream of [child.stdout, child.stderr]) {
    readline.createInterface({ input: stream }).on("line", (line) =>
      console.log(paint(line)),
    );
  }
}

function portOpen(port) {
  return new Promise((resolve) => {
    const sock = createConnection({ port, host: "127.0.0.1" });
    sock.on("connect", () => {
      sock.destroy();
      resolve(true);
    });
    sock.on("error", () => resolve(false));
  });
}

function waitFor(child, re, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error("timeout waiting for readiness")),
      timeoutMs,
    );
    for (const stream of [child.stdout, child.stderr]) {
      readline.createInterface({ input: stream }).on("line", (line) => {
        if (re.test(line)) {
          clearTimeout(timer);
          resolve();
        }
      });
    }
  });
}

function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("\n[dev] shutting down…");
  for (const c of children) c.kill("SIGTERM");
  if (dbChild) dbChild.kill("SIGINT");
  setTimeout(() => process.exit(code), 800);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

// --- main --------------------------------------------------------------
async function main() {
  // 1) Database
  if (await portOpen(DB_PORT)) {
    console.log(`[dev] Postgres already up on :${DB_PORT} — reusing it.`);
  } else {
    console.log(`[dev] starting embedded Postgres on :${DB_PORT}…`);
    dbChild = spawn(process.execPath, ["scripts/dev-db.mjs", "start"], {
      cwd: repoRoot,
      stdio: ["ignore", "pipe", "pipe"],
    });
    prefix(dbChild, "db", "35");
    await waitFor(dbChild, /Ready\. Press|DATABASE_URL=/);
  }

  // 2) API server — build once, then run
  console.log("[dev] building API server…");
  execSync("pnpm --filter @workspace/api-server run build", {
    cwd: repoRoot,
    stdio: "inherit",
    env,
  });
  const apiEnv = {
    ...env,
    NODE_ENV: "development",
    PORT: API_PORT,
    DATABASE_URL,
  };
  const api = spawn(
    process.execPath,
    ["--enable-source-maps", "artifacts/api-server/dist/index.mjs"],
    { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"], env: apiEnv },
  );
  prefix(api, "api", "36");
  children.push(api);

  // 3) Web — Vite dev server
  const webEnv = {
    ...env,
    NODE_ENV: "development",
    PORT: WEB_PORT,
    BASE_PATH,
    API_PROXY_TARGET: `http://localhost:${API_PORT}`,
  };
  const web = spawn(
    "pnpm",
    [
      "--filter",
      "@workspace/fauser-platform",
      "exec",
      "vite",
      "--config",
      "vite.config.ts",
      "--host",
      "0.0.0.0",
    ],
    { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"], env: webEnv },
  );
  prefix(web, "web", "32");
  children.push(web);

  for (const c of children) {
    c.on("exit", (code) => {
      if (!shuttingDown) {
        console.error(`[dev] a process exited (code ${code}); tearing down.`);
        shutdown(code ?? 1);
      }
    });
  }

  console.log(
    `\n[dev] API → http://localhost:${API_PORT}  |  Web → http://localhost:${WEB_PORT}\n` +
      `[dev] No Clerk keys? Both tiers run as a mock user. Ctrl-C to stop.\n`,
  );
}

main().catch((err) => {
  console.error("[dev] failed to start:", err);
  shutdown(1);
});
