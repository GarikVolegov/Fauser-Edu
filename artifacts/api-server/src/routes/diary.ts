import { Router } from "express";
import { db, diaryEntriesTable, subjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

async function enrichEntry(e: typeof diaryEntriesTable.$inferSelect) {
  let subjectName: string | null = null;
  if (e.subjectId) {
    const [s] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, e.subjectId)).limit(1);
    subjectName = s?.name ?? null;
  }
  return {
    ...e,
    subjectName,
    createdAt: e.createdAt.toISOString(),
    updatedAt: e.updatedAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const entries = await db.select().from(diaryEntriesTable).where(eq(diaryEntriesTable.userId, user.id));
    res.json(await Promise.all(entries.map(enrichEntry)));
  } catch (err) {
    req.log.error({ err }, "Error listing diary entries");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { title, content, subjectId } = req.body;
    if (!title || !content) return res.status(400).json({ error: "Missing fields" });

    const [entry] = await db.insert(diaryEntriesTable).values({ userId: user.id, title, content, subjectId: subjectId ?? null }).returning();
    res.status(201).json(await enrichEntry(entry));
  } catch (err) {
    req.log.error({ err }, "Error creating diary entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const { title, content, subjectId } = req.body;
    const updates: any = { updatedAt: new Date() };
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (subjectId !== undefined) updates.subjectId = subjectId;

    const [entry] = await db.update(diaryEntriesTable).set(updates).where(eq(diaryEntriesTable.id, id)).returning();
    res.json(await enrichEntry(entry));
  } catch (err) {
    req.log.error({ err }, "Error updating diary entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(diaryEntriesTable).where(eq(diaryEntriesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting diary entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
