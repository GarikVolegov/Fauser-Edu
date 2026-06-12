import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);

    const records = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.userId, user.id))
      .orderBy(notificationsTable.createdAt);

    res.json(records.map(n => ({ ...n, createdAt: n.createdAt.toISOString() })).reverse());
  } catch (err) {
    req.log.error({ err }, "Error listing notifications");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id/read", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const [record] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, id))
      .returning();

    res.json({ ...record, createdAt: record.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error marking notification read");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/read-all", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);

    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(and(eq(notificationsTable.userId, user.id), eq(notificationsTable.read, false)));

    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Error marking all notifications read");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
