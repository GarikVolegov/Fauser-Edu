import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

export const requireAuth = (req: any, res: any, next: any) => {
  const auth = getAuth(req);
  const userId = auth?.userId;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
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
export const requireRole = (allowedRoles: Array<"student" | "teacher" | "segreteria" | "admin">) => {
  return async (req: any, res: any, next: any) => {
    // Prefer direct auth fn (devAuth / tests) then fall back to Clerk getAuth
    let auth: any = null;
    if (typeof req.auth === "function") {
      try { auth = req.auth(); } catch { /* ignore */ }
    }
    if (!auth || !auth.userId) {
      try { auth = getAuth(req); } catch { /* ignore */ }
    }
    const clerkId = auth?.userId;
    if (!clerkId) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const user = await getOrCreateUser(clerkId);
    req.user = user;
    req.clerkId = clerkId;
    if (!allowedRoles.includes(user.role as any)) {
      return res.status(403).json({
        error: "Forbidden",
        requiredRoles: allowedRoles,
        currentRole: user.role,
      });
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
