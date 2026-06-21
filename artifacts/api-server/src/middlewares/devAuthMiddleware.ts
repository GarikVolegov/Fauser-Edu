import type { RequestHandler } from "express";

/**
 * Development-only auth fallback.
 *
 * Clerk's `getAuth(req)` works by calling `req.auth(opts)` (it first checks
 * that `req.auth` is a function). This middleware installs such a function
 * returning a fixed mock identity, so every downstream route that relies on
 * `getAuth(req).userId` / `requireAuth` sees a signed-in user — with no Clerk
 * keys and no per-route changes.
 *
 * Wired in `app.ts` ONLY when NODE_ENV==="development" and CLERK_SECRET_KEY is
 * absent. Production always uses the real Clerk middleware.
 */
export const DEV_USER_CLERK_ID = "dev_user_local";

export const devAuthMiddleware: RequestHandler = (req, _res, next) => {
  (req as unknown as { auth: (opts?: unknown) => unknown }).auth = () => ({
    userId: DEV_USER_CLERK_ID,
    sessionId: "dev_session_local",
    sessionClaims: { sub: DEV_USER_CLERK_ID },
    orgId: null,
    orgRole: null,
    orgSlug: null,
    actor: null,
    tokenType: "session_token",
    getToken: async () => null,
    has: () => false,
    debug: () => ({}),
  });
  next();
};
