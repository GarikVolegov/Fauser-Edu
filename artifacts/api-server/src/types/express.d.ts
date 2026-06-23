// Augment Express's Request with the fields our auth middleware attaches, so
// handlers can be typed as `(req: Request, res: Response)` instead of `any`.
declare global {
  namespace Express {
    interface Request {
      /** DB user row, populated by `requireRole` (after `getOrCreateUser`). */
      user?: (typeof import("@workspace/db").usersTable)["$inferSelect"];
      /** Clerk user id, populated by `requireAuth` / `requireRole`. */
      clerkId?: string;
    }
  }
}

export {};
