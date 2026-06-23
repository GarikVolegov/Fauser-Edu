/**
 * Parse a comma-separated CORS allowlist (e.g. the `CORS_ORIGINS` env var) into
 * a trimmed list of exact origins. Undefined/empty/all-blank yields `[]`.
 */
export function parseCorsAllowlist(raw: string | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/**
 * Decide whether a request `Origin` may be reflected by CORS.
 *
 * Requests with no Origin header (same-origin navigations, curl, server-to-
 * server) are allowed. Cross-origin requests are allowed only when the exact
 * origin is on the allowlist — this closes the `origin: true` + credentials
 * reflection hole, where any website could make credentialed cross-origin
 * calls to the API.
 */
export function isAllowedOrigin(
  origin: string | undefined,
  allowlist: string[],
): boolean {
  if (!origin) return true;
  return allowlist.includes(origin);
}
