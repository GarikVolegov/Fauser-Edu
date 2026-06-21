import { Router } from "express";
import { db, announcementsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { CreateAnnouncementBody } from "@workspace/api-zod";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const announcements = await db.select().from(announcementsTable);
    res.json(
      announcements.map((a) => ({
        ...a,
        publishedAt: a.publishedAt?.toISOString() ?? null,
        createdAt: a.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing announcements");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const parsed = CreateAnnouncementBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });

    const [announcement] = await db
      .insert(announcementsTable)
      .values({
        ...parsed.data,
        authorId: user.id,
        publishedAt: parsed.data.publishedAt
          ? new Date(parsed.data.publishedAt)
          : new Date(),
      })
      .returning();

    res.status(201).json({
      ...announcement,
      publishedAt: announcement.publishedAt?.toISOString() ?? null,
      createdAt: announcement.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const [announcement] = await db
      .select()
      .from(announcementsTable)
      .where(eq(announcementsTable.id, id))
      .limit(1);
    if (!announcement) return res.status(404).json({ error: "Not found" });
    res.json({
      ...announcement,
      publishedAt: announcement.publishedAt?.toISOString() ?? null,
      createdAt: announcement.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting announcement");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
