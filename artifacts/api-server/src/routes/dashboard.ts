import { Router } from "express";
import {
  db,
  gradesTable,
  attendanceTable,
  assignmentsTable,
  eventsTable,
  announcementsTable,
  subjectsTable,
  classesTable,
  scheduleTable,
  appointmentsTable,
  justificationsTable,
  usersTable,
} from "@workspace/db";
import { mapTeacherToday, mapStaffToday } from "./dashboardToday";
import { eq, gte } from "drizzle-orm";
import { requireAuth, getOrCreateUser } from "./auth";
import { getAuth } from "@clerk/express";

const router = Router();

router.get("/summary", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const today = new Date().toISOString().split("T")[0];

    // Role-aware summary for separate OS experiences
    if (user.role === "teacher") {
      // Teacher view: focus on their activity
      const myAssignments = await db
        .select()
        .from(assignmentsTable)
        .where(eq(assignmentsTable.teacherId, user.id));

      const upcomingEvents = await db
        .select()
        .from(eventsTable)
        .where(gte(eventsTable.startDate, today));

      return res.json({
        role: "teacher",
        myAssignmentsCount: myAssignments.length,
        upcomingEvents: upcomingEvents.length,
        message: "Benvenuto nel tuo cockpit docente",
      });
    }

    if (["segreteria", "admin"].includes(user.role)) {
      // Management / staff view
      const allUsers = await db.select().from(
        (await import("@workspace/db")).usersTable
      );
      const pendingJust = await db
        .select()
        .from((await import("@workspace/db")).justificationsTable);

      return res.json({
        role: user.role,
        totalUsers: allUsers.length,
        pendingItems: pendingJust.length,
        message: user.role === "segreteria"
          ? "Portale Segreteria - gestione operativa"
          : "Pannello Tecnici",
      });
    }

    // Default: student view (existing logic)
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
      role: "student",
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

router.get("/today", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const dayOfWeek = now.getDay(); // 0=Sun .. 6=Sat (Italian Mon-Fri = 1..5)

    const classes = await db.select().from(classesTable);
    const classNames = new Map(classes.map((c) => [c.id, c.name]));

    const allUsers = await db.select().from(usersTable);
    const studentNames = new Map(allUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));

    if (user.role === "teacher") {
      const schedule = await db.select().from(scheduleTable).where(eq(scheduleTable.teacherId, user.id));
      const todayAttendance = await db.select().from(attendanceTable).where(eq(attendanceTable.date, today));
      const assignments = await db.select().from(assignmentsTable).where(eq(assignmentsTable.teacherId, user.id));
      const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.teacherId, user.id));
      const subjects = await db.select().from(subjectsTable);
      const subjectNames = new Map(subjects.map((s) => [s.id, s.name]));

      const payload = mapTeacherToday({
        today, dayOfWeek, schedule, attendance: todayAttendance,
        assignments, appointments: appts, classNames, subjectNames, studentNames,
      });
      return res.json({ role: "teacher", date: today, ...payload });
    }

    if (["segreteria", "admin"].includes(user.role)) {
      const pendingJust = await db.select().from(justificationsTable).where(eq(justificationsTable.status, "pending"));
      const todayAttendance = await db.select().from(attendanceTable).where(eq(attendanceTable.date, today));
      const schedule = await db.select().from(scheduleTable);
      const studentClassIds = new Map(allUsers.map((u) => [u.id, u.classId ?? -1]));

      const payload = mapStaffToday({
        today, dayOfWeek,
        justifications: pendingJust.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() })),
        attendance: todayAttendance, schedule, classNames, studentNames, studentClassIds,
      });
      return res.json({ role: user.role, date: today, ...payload });
    }

    // Student keeps using /dashboard/summary; return a light payload here.
    return res.json({ role: "student", date: today });
  } catch (err) {
    req.log.error({ err }, "Error getting today dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
