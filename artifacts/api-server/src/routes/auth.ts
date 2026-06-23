import { Router, type Request, type Response, type NextFunction } from "express";
import { getAuth } from "@clerk/express";

type Role = "student" | "teacher" | "segreteria" | "admin";

/** Minimal shape we read off an auth result (Clerk's getAuth or the dev-auth fn). */
type AuthResult = { userId?: string | null } | null | undefined;
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  req.clerkId = userId;
  next();
};

/**
 * Centralized role authorization middleware.
 * Usage:
 *   router.post("/", requireAuth, requireRole(["teacher", "admin"]), handler)
 *   or
 *   router.post("/", requireRole(["teacher", "admin"]), handler)  // includes auth
 *
 * Populates req.user with the DB user row (from getOrCreateUser).
 * Returns 401 if unauthenticated, 403 if role not allowed.
 */
export const requireRole = (allowedRoles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Prefer the dev/test auth function if present, else Clerk's getAuth.
    // `req.auth` is a callable under devAuthMiddleware and in unit tests, but
    // Clerk types it differently in prod — read it through a narrow cast.
    let auth: AuthResult = null;
    const authProp = (req as { auth?: unknown }).auth;
    if (typeof authProp === "function") {
      try { auth = (authProp as () => AuthResult)(); } catch { /* ignore */ }
    }
    if (!auth || !auth.userId) {
      try { auth = getAuth(req); } catch { /* ignore */ }
    }
    const clerkId = auth?.userId;
    if (!clerkId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const user = await getOrCreateUser(clerkId);
    req.user = user;
    req.clerkId = clerkId;
    if (!allowedRoles.includes(user.role as Role)) {
      res.status(403).json({
        error: "Forbidden",
        requiredRoles: allowedRoles,
        currentRole: user.role,
      });
      return;
    }
    next();
  };
};

export const getOrCreateUser = async (
  clerkId: string,
  email?: string,
  firstName?: string,
  lastName?: string,
) => {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.clerkId, clerkId))
    .limit(1);
  if (existing.length > 0) return existing[0];

  const [newUser] = await db
    .insert(usersTable)
    .values({
      clerkId,
      email: email ?? "",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      role: "student",
    })
    .returning();
  return newUser;
};

export default router;
