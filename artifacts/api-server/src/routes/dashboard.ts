import { Router } from "express";
import {
  db,
  gradesTable,
  attendanceTable,
  assignmentsTable,
  eventsTable,
  announcementsTable,
  subjectsTable,
} from "@workspace/db";
import { eq, gte } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/summary", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const today = new Date().toISOString().split("T")[0];

    const grades = await db
      .select()
      .from(gradesTable)
      .where(eq(gradesTable.studentId, user.id));
    const gradeAverage =
      grades.length > 0
        ? grades.reduce((sum, g) => sum + parseFloat(String(g.value)), 0) /
          grades.length
        : null;

    const attendance = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.studentId, user.id));
    const presenti = attendance.filter((a) => a.status === "presente").length;
    const attendancePercentage =
      attendance.length > 0
        ? Math.round((presenti / attendance.length) * 100)
        : null;

    const pendingAssignments = await db
      .select()
      .from(assignmentsTable)
      .where(gte(assignmentsTable.dueDate, today));
    const upcomingEvents = await db
      .select()
      .from(eventsTable)
      .where(gte(eventsTable.startDate, today));
    const allAnnouncements = await db.select().from(announcementsTable);

    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    const recentGrades = grades
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
      .map((g) => ({
        ...g,
        value: parseFloat(String(g.value)),
        subjectName: subjectMap.get(g.subjectId) ?? "Unknown",
        createdAt: g.createdAt.toISOString(),
      }));

    res.json({
      gradeAverage:
        gradeAverage !== null ? Math.round(gradeAverage * 100) / 100 : null,
      totalGrades: grades.length,
      attendancePercentage,
      pendingAssignments: pendingAssignments.length,
      upcomingEvents: upcomingEvents.length,
      unreadAnnouncements: allAnnouncements.length,
      recentGrades,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting dashboard summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/upcoming", requireAuth, async (req: any, res: any) => {
  try {
    const today = new Date().toISOString().split("T")[0];

    const assignments = await db
      .select()
      .from(assignmentsTable)
      .where(gte(assignmentsTable.dueDate, today));
    const events = await db
      .select()
      .from(eventsTable)
      .where(gte(eventsTable.startDate, today));
    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    const { classesTable } = await import("@workspace/db");
    const classes = await db.select().from(classesTable);
    const classMap = new Map(classes.map((c) => [c.id, c.name]));

    res.json({
      assignments: assignments.slice(0, 10).map((a) => ({
        ...a,
        subjectName: subjectMap.get(a.subjectId) ?? "Unknown",
        className: classMap.get(a.classId) ?? "Unknown",
        createdAt: a.createdAt.toISOString(),
      })),
      events: events
        .slice(0, 10)
        .map((e) => ({ ...e, createdAt: e.createdAt.toISOString() })),
    });
  } catch (err) {
    req.log.error({ err }, "Error getting upcoming items");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
