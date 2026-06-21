import { Router } from "express";
import { db, classMessagesTable, usersTable } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/messages", requireAuth, async (req: any, res: any) => {
  try {
    const classId = parseInt(String(req.query.classId));
    if (!classId) return res.status(400).json({ error: "classId required" });

    const messages = await db
      .select()
      .from(classMessagesTable)
      .where(eq(classMessagesTable.classId, classId))
      .orderBy(asc(classMessagesTable.createdAt));

    const users = await db.select().from(usersTable);
    const userMap = new Map(
      users.map((u) => [
        u.id,
        `${u.firstName} ${u.lastName}`.trim() || u.email,
      ]),
    );

    res.json(
      messages.map((m) => ({
        ...m,
        senderName: userMap.get(m.senderId) ?? "Utente",
        createdAt: m.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing group messages");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/messages", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { classId, content } = req.body;
    if (!classId || !content?.trim())
      return res.status(400).json({ error: "classId and content required" });

    const [msg] = await db
      .insert(classMessagesTable)
      .values({
        classId: parseInt(String(classId)),
        senderId: user.id,
        content: content.trim(),
      })
      .returning();

    res.status(201).json({
      ...msg,
      senderName: `${user.firstName} ${user.lastName}`.trim() || user.email,
      createdAt: msg.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating group message");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
