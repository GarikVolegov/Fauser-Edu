import { Router } from "express";
import { db, materialsTable, subjectsTable, classesTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { CreateMaterialBody, ListMaterialsQueryParams } from "@workspace/api-zod";

const router = Router();

const enrichMaterial = async (m: any) => {
  const subjects = await db.select().from(subjectsTable).where(eq(subjectsTable.id, m.subjectId)).limit(1);
  const classes = await db.select().from(classesTable).where(eq(classesTable.id, m.classId)).limit(1);
  return {
    ...m,
    subjectName: subjects[0]?.name ?? "Unknown",
    className: classes[0]?.name ?? "Unknown",
    createdAt: m.createdAt.toISOString(),
  };
};

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const parsed = ListMaterialsQueryParams.safeParse(req.query);
    const filters: any[] = [];

    if (parsed.success) {
      if (parsed.data.classId) filters.push(eq(materialsTable.classId, parsed.data.classId));
      if (parsed.data.subjectId) filters.push(eq(materialsTable.subjectId, parsed.data.subjectId));
    }

    const materials = filters.length > 0
      ? await db.select().from(materialsTable).where(and(...filters))
      : await db.select().from(materialsTable);

    const enriched = await Promise.all(materials.map(enrichMaterial));
    res.json(enriched);
  } catch (err) {
    req.log.error({ err }, "Error listing materials");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const parsed = CreateMaterialBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const [material] = await db.insert(materialsTable).values({
      ...parsed.data,
      uploadedById: user.id,
    }).returning();

    res.status(201).json(await enrichMaterial(material));
  } catch (err) {
    req.log.error({ err }, "Error creating material");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(materialsTable).where(eq(materialsTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting material");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
