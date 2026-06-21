#!/usr/bin/env node
// Local development Postgres, powered by embedded-postgres.
// Runs a real Postgres instance with no system install / no sudo.
// Data lives in .dev/pgdata (git-ignored). Dev-only — never used in deploy.
//
// Usage:
//   node scripts/dev-db.mjs start   # initialise (first run) + start, then stay alive
//   node scripts/dev-db.mjs stop    # stop a running instance
//
// Connection string (matches .env.local):
//   postgres://postgres:postgres@localhost:5433/fauser

import EmbeddedPostgres from "embedded-postgres";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, ".dev", "pgdata");

const PORT = 5433;
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "fauser";

const pg = new EmbeddedPostgres({
  databaseDir: dataDir,
  user: USER,
  password: PASSWORD,
  port: PORT,
  persistent: true,
});

const command = process.argv[2] ?? "start";

async function start() {
  const firstRun = !existsSync(dataDir);
  if (firstRun) {
    console.log("[dev-db] Initialising new Postgres cluster…");
    await pg.initialise();
  }

  await pg.start();
  console.log(`[dev-db] Postgres listening on localhost:${PORT}`);

  if (firstRun) {
    await pg.createDatabase(DB_NAME);
    console.log(`[dev-db] Created database "${DB_NAME}"`);
  }

  console.log(
    `[dev-db] DATABASE_URL=postgres://${USER}:${PASSWORD}@localhost:${PORT}/${DB_NAME}`,
  );
  console.log("[dev-db] Ready. Press Ctrl-C to stop.");

  const shutdown = async () => {
    console.log("\n[dev-db] Stopping…");
    try {
      await pg.stop();
    } finally {
      process.exit(0);
    }
  };
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function stop() {
  await pg.stop();
  console.log("[dev-db] Stopped.");
}

try {
  if (command === "stop") {
    await stop();
  } else {
    await start();
  }
} catch (err) {
  console.error("[dev-db] Error:", err);
  process.exit(1);
}
