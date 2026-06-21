import { Router } from "express";
import { db, subjectsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";
import { CreateSubjectBody, ListSubjectsQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = ListSubjectsQueryParams.safeParse(req.query);
    if (parsed.success && parsed.data.indirizzo) {
      const subjects = await db
        .select()
        .from(subjectsTable)
        .where(eq(subjectsTable.indirizzo, parsed.data.indirizzo));
      return res.json(subjects);
    }
    const subjects = await db.select().from(subjectsTable);
    res.json(subjects);
  } catch (err) {
    req.log.error({ err }, "Error listing subjects");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = CreateSubjectBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const [subject] = await db
      .insert(subjectsTable)
      .values(parsed.data)
      .returning();
    res.status(201).json(subject);
  } catch (err) {
    req.log.error({ err }, "Error creating subject");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
