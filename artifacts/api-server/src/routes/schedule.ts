import { Router } from "express";
import { db, scheduleTable, subjectsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/", requireAuth, async (req: any, res: any) => {
  try {
    const classId = parseInt(req.query.classId as string);
    if (isNaN(classId)) return res.status(400).json({ error: "classId required" });

    const entries = await db.select().from(scheduleTable).where(eq(scheduleTable.classId, classId));

    const subjects = await db.select().from(subjectsTable);
    const teachers = await db.select().from(usersTable);
    const subjectMap = new Map(subjects.map(s => [s.id, s.name]));
    const teacherMap = new Map(teachers.map(t => [t.id, `${t.firstName} ${t.lastName}`]));

    res.json(entries.map(e => ({
      ...e,
      subjectName: subjectMap.get(e.subjectId) ?? "Unknown",
      teacherName: teacherMap.get(e.teacherId) ?? "Unknown",
    })));
  } catch (err) {
    req.log.error({ err }, "Error listing schedule");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", requireAuth, async (req: any, res: any) => {
  try {
    const { classId, dayOfWeek, hour, subjectId, teacherId, room } = req.body;
    if (!classId || !dayOfWeek || !hour || !subjectId || !teacherId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const existing = await db
      .select()
      .from(scheduleTable)
      .where(and(eq(scheduleTable.classId, classId), eq(scheduleTable.dayOfWeek, dayOfWeek), eq(scheduleTable.hour, hour)))
      .limit(1);

    if (existing.length > 0) {
      return res.status(409).json({ error: "Slot already occupied" });
    }

    const [entry] = await db.insert(scheduleTable).values({ classId, dayOfWeek, hour, subjectId, teacherId, room }).returning();

    const subjects = await db.select().from(subjectsTable).where(eq(subjectsTable.id, entry.subjectId)).limit(1);
    const teacher = await db.select().from(usersTable).where(eq(usersTable.id, entry.teacherId)).limit(1);

    res.status(201).json({
      ...entry,
      subjectName: subjects[0]?.name ?? "Unknown",
      teacherName: teacher[0] ? `${teacher[0].firstName} ${teacher[0].lastName}` : "Unknown",
    });
  } catch (err) {
    req.log.error({ err }, "Error creating schedule entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(scheduleTable).where(eq(scheduleTable.id, id));
    res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Error deleting schedule entry");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
