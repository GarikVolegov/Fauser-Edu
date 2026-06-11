import { Router } from "express";
import { getAuth } from "@clerk/express";
import { db, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { UpdateMeBody, ListUsersQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/me", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    res.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting me");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/me", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = UpdateMeBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const [updated] = await db
      .update(usersTable)
      .set(parsed.data)
      .where(eq(usersTable.clerkId, req.clerkId))
      .returning();

    res.json({ ...updated, createdAt: updated.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating me");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = ListUsersQueryParams.safeParse(req.query);
    const filters: any[] = [];
    if (parsed.success && parsed.data.role) {
      filters.push(eq(usersTable.role, parsed.data.role));
    }
    if (parsed.success && parsed.data.classId) {
      filters.push(eq(usersTable.classId, parsed.data.classId));
    }

    const users = filters.length > 0
      ? await db.select().from(usersTable).where(and(...filters))
      : await db.select().from(usersTable);

    res.json(users.map(u => ({ ...u, createdAt: u.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing users");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
