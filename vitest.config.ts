import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["{lib,artifacts,scripts}/**/*.test.{ts,tsx}"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/.dev/**"],
    // Backend tests need these defined at import time (lib/db throws otherwise).
    // The dev DB (scripts/dev-db.mjs) provides this URL; tests that don't hit
    // the DB never connect.
    env: {
      NODE_ENV: "test",
      DATABASE_URL:
        process.env.DATABASE_URL ??
        "postgres://postgres:postgres@localhost:5433/fauser",
      SESSION_SECRET: process.env.SESSION_SECRET ?? "test-session-secret",
    },
  },
});
