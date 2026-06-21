import { Router } from "express";
import { db, competenciesTable, studentCompetenciesTable, subjectsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const filters: any[] = [];
    if (req.query.subjectId) filters.push(eq(competenciesTable.subjectId, parseInt(req.query.subjectId as string)));

    const items = filters.length > 0
      ? await db.select().from(competenciesTable).where(and(...filters))
      : await db.select().from(competenciesTable);

    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));

    res.json(items.map(c => ({ ...c, subjectName: subjectMap.get(c.subjectId) ?? "Unknown", createdAt: c.createdAt.toISOString() })));
  } catch (err) {
    req.log.error({ err }, "Error listing competencies");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { subjectId, name, description } = req.body;
    if (!subjectId || !name) return res.status(400).json({ error: "Missing fields" });

    const [comp] = await db.insert(competenciesTable).values({ subjectId, name, description }).returning();
    const [subject] = await db.select().from(subjectsTable).where(eq(subjectsTable.id, comp.subjectId)).limit(1);
    res.status(201).json({ ...comp, subjectName: subject?.name ?? "Unknown", createdAt: comp.createdAt.toISOString() });
  } catch (err) {
    req.log.error({ err }, "Error creating competency");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/student", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : (user.role === "student" ? user.id : undefined);

    const filters: any[] = [];
    if (studentId) filters.push(eq(studentCompetenciesTable.studentId, studentId));

    const items = filters.length > 0
      ? await db.select().from(studentCompetenciesTable).where(and(...filters))
      : await db.select().from(studentCompetenciesTable);

    const competencies = await db.select().from(competenciesTable);
    const subjects = await db.select().from(subjectsTable);
    const users = await db.select().from(usersTable);
    const compMap = new Map(competencies.map(c => [c.id, c]));
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
    const userMap = new Map(users.map(u => [u.id, `${u.firstName} ${u.lastName}`]));

    res.json(items.map(sc => {
      const comp = compMap.get(sc.competencyId);
      return {
        ...sc,
        competencyName: comp?.name ?? "Unknown",
        subjectName: comp ? (subjectMap.get(comp.subjectId) ?? "Unknown") : "Unknown",
        studentName: userMap.get(sc.studentId) ?? "Unknown",
        teacherName: userMap.get(sc.teacherId) ?? "Unknown",
        createdAt: sc.createdAt.toISOString(),
      };
    }));
  } catch (err) {
    req.log.error({ err }, "Error listing student competencies");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/student", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { studentId, competencyId, level, date, notes } = req.body;
    if (!studentId || !competencyId || level === undefined || !date) return res.status(400).json({ error: "Missing fields" });

    const existing = await db.select().from(studentCompetenciesTable)
      .where(and(eq(studentCompetenciesTable.studentId, studentId), eq(studentCompetenciesTable.competencyId, competencyId)))
      .limit(1);

    let sc;
    if (existing.length > 0) {
      [sc] = await db.update(studentCompetenciesTable).set({ level, teacherId: user.id, date, notes }).where(eq(studentCompetenciesTable.id, existing[0].id)).returning();
    } else {
      [sc] = await db.insert(studentCompetenciesTable).values({ studentId, competencyId, level, teacherId: user.id, date, notes }).returning();
    }

    const [comp] = await db.select().from(competenciesTable).where(eq(competenciesTable.id, sc.competencyId)).limit(1);
    const [subject] = comp ? await db.select().from(subjectsTable).where(eq(subjectsTable.id, comp.subjectId)).limit(1) : [null];
    const [student] = await db.select().from(usersTable).where(eq(usersTable.id, sc.studentId)).limit(1);
    const [teacher] = await db.select().from(usersTable).where(eq(usersTable.id, sc.teacherId)).limit(1);

    res.status(201).json({
      ...sc,
      competencyName: comp?.name ?? "Unknown",
      subjectName: subject?.name ?? "Unknown",
      studentName: student ? `${student.firstName} ${student.lastName}` : "Unknown",
      teacherName: teacher ? `${teacher.firstName} ${teacher.lastName}` : "Unknown",
      createdAt: sc.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Error assessing student competency");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
