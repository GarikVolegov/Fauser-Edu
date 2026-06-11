import { Router } from "express";
import { db, gradesTable, subjectsTable, usersTable } from "@workspace/db";
import { eq, and, avg, min, max, count, sql } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { CreateGradeBody, UpdateGradeBody, ListGradesQueryParams, GetGradesSummaryQueryParams } from "@workspace/api-zod";

const router = Router();

router.get("/summary", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const parsed = GetGradesSummaryQueryParams.safeParse(req.query);
    let studentId: number | undefined;

    if (parsed.success && parsed.data.studentId) {
      studentId = parsed.data.studentId;
    } else {
      const user = await getOrCreateUser(auth.userId!);
      studentId = user.id;
    }

    const summaries = await db
      .select({
        subjectId: gradesTable.subjectId,
        average: avg(gradesTable.value),
        count: count(gradesTable.id),
        min: min(gradesTable.value),
        max: max(gradesTable.value),
      })
      .from(gradesTable)
      .where(eq(gradesTable.studentId, studentId))
      .groupBy(gradesTable.subjectId);

    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    res.json(summaries.map(s => ({
      subjectId: s.subjectId,
      subjectName: subjectMap.get(s.subjectId) ?? "Unknown",
      average: parseFloat(String(s.average ?? 0)),
      count: s.count,
      min: parseFloat(String(s.min ?? 0)),
      max: parseFloat(String(s.max ?? 0)),
    })));
  } catch (err) {
    req.log.error({ err }, "Error getting grades summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const parsed = ListGradesQueryParams.safeParse(req.query);
    const user = await getOrCreateUser(auth.userId!);
    const filters: any[] = [];

    if (parsed.success) {
      if (parsed.data.studentId) filters.push(eq(gradesTable.studentId, parsed.data.studentId));
      else if (user.role === "student") filters.push(eq(gradesTable.studentId, user.id));
      if (parsed.data.subjectId) filters.push(eq(gradesTable.subjectId, parsed.data.subjectId));
    } else if (user.role === "student") {
      filters.push(eq(gradesTable.studentId, user.id));
    }

    const grades = filters.length > 0
      ? await db.select().from(gradesTable).where(and(...filters))
      : await db.select().from(gradesTable);

    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    res.json(grades.map(g => ({
      ...g,
      value: parseFloat(String(g.value)),
      subjectName: subjectMap.get(g.subjectId) ?? "Unknown",
      createdAt: g.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Error listing grades");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const parsed = CreateGradeBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });

    const [grade] = await db.insert(gradesTable).values({
      ...parsed.data,
      value: String(parsed.data.value),
      teacherId: user.id,
    }).returning();

    const subjects = await db.select().from(subjectsTable).where(eq(subjectsTable.id, grade.subjectId)).limit(1);

    res.status(201).json({
      ...grade,
      value: parseFloat(String(grade.value)),
      subjectName: subjects[0]?.name ?? "Unknown",
      createdAt: grade.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error creating grade");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    const parsed = UpdateGradeBody.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: "Invalid input" });
    const updateData: any = { ...parsed.data };
    if (parsed.data.value !== undefined) updateData.value = String(parsed.data.value);

    const [grade] = await db.update(gradesTable).set(updateData).where(eq(gradesTable.id, id)).returning();
    const subjects = await db.select().from(subjectsTable).where(eq(subjectsTable.id, grade.subjectId)).limit(1);

    res.json({
      ...grade,
      value: parseFloat(String(grade.value)),
      subjectName: subjects[0]?.name ?? "Unknown",
      createdAt: grade.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error updating grade");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(gradesTable).where(eq(gradesTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting grade");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
