import { Router } from "express";
import { db, tutoringPostsTable, usersTable, subjectsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

async function enrichPost(p: typeof tutoringPostsTable.$inferSelect) {
  const [author] = await db.select().from(usersTable).where(eq(usersTable.id, p.authorId)).limit(1);
  const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, p.subjectId)).limit(1);
  return {
    ...p,
    authorName: author ? `${author.firstName} ${author.lastName}` : "Unknown",
    subjectName: subject?.name ?? "Unknown",
    createdAt: p.createdAt.toISOString(),
  };
}

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const filters: any[] = [];
    if (req.query.subjectId) filters.push(eq(tutoringPostsTable.subjectId, parseInt(req.query.subjectId as string)));
    if (req.query.type) filters.push(eq(tutoringPostsTable.type, req.query.type as string));

    const records = filters.length > 0
      ? await db.select().from(tutoringPostsTable).where(and(...filters))
      : await db.select().from(tutoringPostsTable);

    res.json(await Promise.all(records.map(enrichPost)));
  } catch (err) {
    req.log.error({ err }, "Error listing tutoring posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { subjectId, type, description, classId } = req.body;

    if (!subjectId || !type || !description) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [record] = await db
      .insert(tutoringPostsTable)
      .values({
        authorId: user.id,
        subjectId,
        type,
        description,
        classId: classId ?? user.classId ?? null,
        status: "active",
      })
      .returning();

    res.status(201).json(await enrichPost(record));
  } catch (err) {
    req.log.error({ err }, "Error creating tutoring post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    if (!["active", "closed"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const [record] = await db
      .update(tutoringPostsTable)
      .set({ status })
      .where(eq(tutoringPostsTable.id, id))
      .returning();

    res.json(await enrichPost(record));
  } catch (err) {
    req.log.error({ err }, "Error updating tutoring post");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tutoringPostsTable).where(eq(tutoringPostsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting tutoring post");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
