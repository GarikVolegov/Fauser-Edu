import { Router } from "express";
import { db, gradesTable, subjectsTable } from "@workspace/db";
import { eq, and, avg, min, max, count } from "drizzle-orm";
import { requireAuth, requireRole, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";
import { resolveStudentScope, parseId } from "../lib/requestHelpers";
import {
  CreateGradeBody,
  UpdateGradeBody,
  ListGradesQueryParams,
  GetGradesSummaryQueryParams,
} from "@workspace/api-zod";

const router = Router();

router.get("/summary", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const parsed = GetGradesSummaryQueryParams.safeParse(req.query);
    const user = await getOrCreateUser(auth.userId!);
    const requested = parsed.success ? parsed.data.studentId : undefined;
    const studentId = resolveStudentScope(user, requested) ?? user.id;

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
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    res.json(
      summaries.map((s) => ({
        subjectId: s.subjectId,
        subjectName: subjectMap.get(s.subjectId) ?? "Unknown",
        average: parseFloat(String(s.average ?? 0)),
        count: s.count,
        min: parseFloat(String(s.min ?? 0)),
        max: parseFloat(String(s.max ?? 0)),
      })),
    );
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
      const scoped = resolveStudentScope(user, parsed.data.studentId);
      if (scoped !== undefined)
        filters.push(eq(gradesTable.studentId, scoped));
      if (parsed.data.subjectId)
        filters.push(eq(gradesTable.subjectId, parsed.data.subjectId));
    } else {
      const scoped = resolveStudentScope(user, undefined);
      if (scoped !== undefined)
        filters.push(eq(gradesTable.studentId, scoped));
    }

    const grades =
      filters.length > 0
        ? await db
            .select()
            .from(gradesTable)
            .where(and(...filters))
        : await db.select().from(gradesTable);

    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    res.json(
      grades.map((g) => ({
        ...g,
        value: parseFloat(String(g.value)),
        subjectName: subjectMap.get(g.subjectId) ?? "Unknown",
        createdAt: g.createdAt.toISOString(),
      })),
    );
  } catch (err) {
    req.log.error({ err }, "Error listing grades");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireRole(["teacher", "admin"]), async (req: any, res: any) => {
  try {
    const user = req.user;
    const parsed = CreateGradeBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });

    const grade = await db.transaction(async (tx) => {
      const [g] = await tx
        .insert(gradesTable)
        .values({
          ...parsed.data,
          value: String(parsed.data.value),
          teacherId: user.id,
        })
        .returning();
      return g;
    });

    const subjects = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, grade.subjectId))
      .limit(1);

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

router.patch("/:id", requireRole(["teacher", "admin"]), async (req: any, res: any) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const parsed = UpdateGradeBody.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({ error: "Invalid input" });
    const updateData: any = { ...parsed.data };
    if (parsed.data.value !== undefined)
      updateData.value = String(parsed.data.value);

    const [grade] = await db
      .update(gradesTable)
      .set(updateData)
      .where(eq(gradesTable.id, id))
      .returning();
    if (!grade) return res.status(404).json({ error: "Not found" });
    const subjects = await db
      .select()
      .from(subjectsTable)
      .where(eq(subjectsTable.id, grade.subjectId))
      .limit(1);

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

router.delete("/:id", requireRole(["teacher", "admin"]), async (req: any, res: any) => {
  try {
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const deleted = await db
      .delete(gradesTable)
      .where(eq(gradesTable.id, id))
      .returning();
    if (deleted.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting grade");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
