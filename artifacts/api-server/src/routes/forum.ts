import { Router } from "express";
import {
  db,
  forumThreadsTable,
  forumPostsTable,
  subjectsTable,
  usersTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/threads", requireAuth, async (req: any, res: any) => {
  try {
    const filters: any[] = [];
    if (req.query.subjectId)
      filters.push(
        eq(
          forumThreadsTable.subjectId,
          parseInt(req.query.subjectId as string),
        ),
      );

    const threads =
      filters.length > 0
        ? await db
            .select()
            .from(forumThreadsTable)
            .where(and(...filters))
        : await db.select().from(forumThreadsTable);

    const subjects = await db.select().from(subjectsTable);
    const users = await db.select().from(usersTable);
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));
    const userMap = new Map(
      users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]),
    );

    const enriched = await Promise.all(
      threads.map(async (t) => {
        const posts = await db
          .select()
          .from(forumPostsTable)
          .where(eq(forumPostsTable.threadId, t.id));
        return {
          ...t,
          subjectName: subjectMap.get(t.subjectId) ?? "Unknown",
          authorName: userMap.get(t.authorId) ?? "Unknown",
          replyCount: posts.length,
          createdAt: t.createdAt.toISOString(),
        };
      }),
    );

    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing forum threads");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/threads", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { subjectId, title, classId } = req.body;
    if (!subjectId || !title)
      return res.status(400).json({ error: "Missing fields" });

    const [thread] = await db
      .insert(forumThreadsTable)
      .values({ subjectId, authorId: user.id, classId: classId ?? null, title })
      .returning();
    const [subject] = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, thread.subjectId))
      .limit(1);

    res.status(201).json({
      ...thread,
      subjectName: subject?.name ?? "Unknown",
      authorName: `${user.firstName} ${user.lastName}`,
      replyCount: 0,
      createdAt: thread.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating forum thread");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/threads/:id/posts", requireAuth, async (req: any, res: any) => {
  try {
    const threadId = parseInt(req.params.id);
    const posts = await db
      .select()
      .from(forumPostsTable)
      .where(eq(forumPostsTable.threadId, threadId));
    const users = await db.select().from(usersTable);
    const userMap = new Map(
      users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]),
    );

    res.json(
      posts.map((p) => ({
        ...p,
        authorName: userMap.get(p.authorId) ?? "Unknown",
        createdAt: p.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing forum posts");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/threads/:id/posts", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const threadId = parseInt(req.params.id);
    const { content } = req.body;
    if (!content) return res.status(400).json({ error: "Missing content" });

    const [post] = await db
      .insert(forumPostsTable)
      .values({ threadId, authorId: user.id, content })
      .returning();
    res.status(201).json({
      ...post,
      authorName: `${user.firstName} ${user.lastName}`,
      createdAt: post.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating forum post");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
