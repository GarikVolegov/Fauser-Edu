#!/usr/bin/env node
// Guard against committing compiled build artifacts.
//
// The June 2026 incident ("app" commit) deleted the entire source tree and
// committed only `dist/` bundles. This guard fails CI if any tracked file is a
// build artifact, so that can never silently happen again.

import { execSync } from "node:child_process";

const tracked = execSync("git ls-files", { encoding: "utf8" })
  .split("\n")
  .filter(Boolean);

const isArtifact = (f) =>
  /(^|\/)dist\//.test(f) ||
  f.endsWith(".tsbuildinfo") ||
  /(^|\/)\.vite\//.test(f);

const offenders = tracked.filter(isArtifact);

if (offenders.length > 0) {
  console.error(
    "✗ Build artifacts must not be committed (they are .gitignored):\n" +
      offenders.map((o) => `    ${o}`).join("\n") +
      "\n\nRemove them with: git rm -r --cached <path>",
  );
  process.exit(1);
}

console.log(
  `✓ No committed build artifacts (${tracked.length} tracked files).`,
);
