import { Router } from "express";
import { db, classesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth, requireRole } from "./auth";
import { CreateClassBody, UpdateClassBody } from "@workspace/api-zod";
import { parseId } from "../lib/requestHelpers";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const classes = await db.select().from(classesTable);
    res.json(
      classes.map((c) => ({ ...c, createdAt: c.createdAt.toISOString() })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing classes");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireRole(["admin"]), async (req: any, res: any) => {
  try {
    const parsed = CreateClassBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const [cls] = await db.insert(classesTable).values(parsed.data).returning();
    res.status(201).json({ ...cls, createdAt: cls.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating class");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const [cls] = await db
      .select()
      .from(classesTable)
      .where(eq(classesTable.id, id))
      .limit(1);
    if (!cls) return res.status(404).json({ error: "Not found" });
    res.json({ ...cls, createdAt: cls.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error getting class");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireRole(["admin"]), async (req: any, res: any) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateClassBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const [cls] = await db
      .update(classesTable)
      .set(parsed.data)
      .where(eq(classesTable.id, id))
      .returning();
    if (!cls) return res.status(404).json({ error: "Not found" });
    res.json({ ...cls, createdAt: cls.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error updating class");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireRole(["admin"]), async (req: any, res: any) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const deleted = await db
      .delete(classesTable)
      .where(eq(classesTable.id, id))
      .returning();
    if (deleted.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting class");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
