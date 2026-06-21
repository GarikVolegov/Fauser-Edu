import { Router } from "express";
import {
  db,
  usersTable,
  classesTable,
  gradesTable,
  attendanceTable,
  subjectsTable,
  quizzesTable,
} from "@workspace/db";
import { requireRole } from "./auth";

const router = Router();

router.get("/summary", requireRole(["teacher", "segreteria", "admin"]), async (req: any, res: any) => {
  try {
    const users = await db.select().from(usersTable);
    const totalStudents = users.filter((u) => u.role === "student").length;
    const totalTeachers = users.filter((u) => u.role === "teacher").length;
    const classes = await db.select().from(classesTable);
    const totalClasses = classes.length;

    const grades = await db.select().from(gradesTable);
    const gradeValues = grades.map((g) => parseFloat(String(g.value)));
    const avgGrade =
      gradeValues.length > 0
        ? gradeValues.reduce((a, b) => a + b, 0) / gradeValues.length
        : 0;

    const attendance = await db.select().from(attendanceTable);
    const present = attendance.filter((a) => a.status === "presente").length;
    const attendanceRate =
      attendance.length > 0
        ? Math.round((present / attendance.length) * 100)
        : 100;

    const quizzes = await db.select().from(quizzesTable);
    const activeQuizzes = quizzes.filter((q) => q.status === "active").length;

    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    const gradesBySubjectMap = new Map<number, number[]>();
    for (const g of grades) {
      if (!gradesBySubjectMap.has(g.subjectId))
        gradesBySubjectMap.set(g.subjectId, []);
      gradesBySubjectMap.get(g.subjectId)!.push(parseFloat(String(g.value)));
    }
    const gradesBySubject = Array.from(gradesBySubjectMap.entries()).map(
      ([subjectId, vals]) => ({
        subjectName: subjectMap.get(subjectId) ?? "Unknown",
        average:
          Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 10) / 10,
      }),
    );

    const monthNames = [
      "Gen",
      "Feb",
      "Mar",
      "Apr",
      "Mag",
      "Giu",
      "Lug",
      "Ago",
      "Set",
      "Ott",
      "Nov",
      "Dic",
    ];
    const byMonth = new Map<string, { total: number; present: number }>();
    for (const a of attendance) {
      const d = new Date(a.date);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!byMonth.has(key)) byMonth.set(key, { total: 0, present: 0 });
      const m = byMonth.get(key)!;
      m.total++;
      if (a.status === "presente") m.present++;
    }
    const attendanceByMonth = Array.from(byMonth.entries()).map(
      ([month, { total, present }]) => ({
        month,
        rate: total > 0 ? Math.round((present / total) * 100) : 100,
      }),
    );

    const ranges = [
      { range: "< 5", min: 0, max: 5 },
      { range: "5-6", min: 5, max: 6 },
      { range: "6-7", min: 6, max: 7 },
      { range: "7-8", min: 7, max: 8 },
      { range: "8-9", min: 8, max: 9 },
      { range: "9-10", min: 9, max: 10.1 },
    ];
    const gradeDistribution = ranges.map((r) => ({
      range: r.range,
      count: gradeValues.filter((v) => v >= r.min && v < r.max).length,
    }));

    res.json({
      totalStudents,
      totalTeachers,
      totalClasses,
      avgGrade: Math.round(avgGrade * 10) / 10,
      attendanceRate,
      activeQuizzes,
      gradesBySubject,
      attendanceByMonth,
      gradeDistribution,
    });
  } catch (err) {
    req.log.error({ err }, "Error getting analytics summary");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
