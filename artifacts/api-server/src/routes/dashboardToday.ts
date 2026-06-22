// Pure, DB-free data-shaping helpers for GET /dashboard/today.
// Kept free of Drizzle/DB imports so they can be unit-tested without a database.

export type TodayLesson = {
  scheduleId: number;
  classId: number;
  className: string;
  subjectName: string;
  hour: number;
  room: string | null;
  attendanceTaken: boolean;
};
export type TodayAssignment = { id: number; title: string; className: string; dueDate: string };
export type TodayAppointment = { id: number; date: string; timeSlot: string; studentName: string };
export type PendingJustification = { id: number; studentName: string; className: string; reason: string; createdAt: string };
export type TodayAbsence = { studentId: number; studentName: string; className: string };
export type TodayRoom = { room: string; slots: number; conflict: boolean };

export type ScheduleRow = { id: number; classId: number; dayOfWeek: number; hour: number; subjectId: number; teacherId: number; room: string | null };
export type AttendanceRow = { classId: number; studentId: number; date: string; status: string };
export type AssignmentRow = { id: number; title: string; classId: number; dueDate: string };
export type AppointmentRow = { id: number; teacherId: number; studentId: number; date: string; timeSlot: string; status: string };
export type JustificationRow = { id: number; studentId: number; reason: string; status: string; createdAt: string };

const DASH = "—";

export function mapTeacherToday(args: {
  today: string;
  dayOfWeek: number;
  schedule: ScheduleRow[];
  attendance: AttendanceRow[];
  assignments: AssignmentRow[];
  appointments: AppointmentRow[];
  classNames: Map<number, string>;
  subjectNames: Map<number, string>;
  studentNames: Map<number, string>;
}): { todayLessons: TodayLesson[]; assignmentsDue: TodayAssignment[]; nextAppointment: TodayAppointment | null } {
  const { today, dayOfWeek, schedule, attendance, assignments, appointments, classNames, subjectNames, studentNames } = args;

  const todayLessons: TodayLesson[] = schedule
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.hour - b.hour)
    .map((s) => ({
      scheduleId: s.id,
      classId: s.classId,
      className: classNames.get(s.classId) ?? DASH,
      subjectName: subjectNames.get(s.subjectId) ?? DASH,
      hour: s.hour,
      room: s.room,
      attendanceTaken: attendance.some((a) => a.classId === s.classId && a.date === today),
    }));

  const assignmentsDue: TodayAssignment[] = assignments
    .filter((a) => a.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((a) => ({ id: a.id, title: a.title, className: classNames.get(a.classId) ?? DASH, dueDate: a.dueDate }));

  const upcoming = appointments
    .filter((a) => a.date >= today && a.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
  const nextAppointment: TodayAppointment | null = upcoming.length > 0
    ? { id: upcoming[0].id, date: upcoming[0].date, timeSlot: upcoming[0].timeSlot, studentName: studentNames.get(upcoming[0].studentId) ?? DASH }
    : null;

  return { todayLessons, assignmentsDue, nextAppointment };
}

export function mapStaffToday(args: {
  today: string;
  dayOfWeek: number;
  justifications: JustificationRow[];
  attendance: AttendanceRow[];
  schedule: ScheduleRow[];
  classNames: Map<number, string>;
  studentNames: Map<number, string>;
  studentClassIds: Map<number, number>;
}): { pendingJustifications: PendingJustification[]; todayAbsences: TodayAbsence[]; roomsToday: TodayRoom[]; pendingTotal: number } {
  const { today, dayOfWeek, justifications, attendance, schedule, classNames, studentNames, studentClassIds } = args;

  const pendingJustifications: PendingJustification[] = justifications
    .filter((j) => j.status === "pending")
    .map((j) => ({
      id: j.id,
      studentName: studentNames.get(j.studentId) ?? DASH,
      className: classNames.get(studentClassIds.get(j.studentId) ?? -1) ?? DASH,
      reason: j.reason,
      createdAt: j.createdAt,
    }));

  const todayAbsences: TodayAbsence[] = attendance
    .filter((a) => a.date === today && a.status === "assente")
    .map((a) => ({
      studentId: a.studentId,
      studentName: studentNames.get(a.studentId) ?? DASH,
      className: classNames.get(a.classId) ?? DASH,
    }));

  const todaySched = schedule.filter((s) => s.dayOfWeek === dayOfWeek && s.room);
  const byRoom = new Map<string, ScheduleRow[]>();
  for (const s of todaySched) {
    const arr = byRoom.get(s.room as string) ?? [];
    arr.push(s);
    byRoom.set(s.room as string, arr);
  }
  const roomsToday: TodayRoom[] = [...byRoom.entries()]
    .map(([room, rows]) => {
      const hourCounts = new Map<number, number>();
      for (const r of rows) hourCounts.set(r.hour, (hourCounts.get(r.hour) ?? 0) + 1);
      return { room, slots: rows.length, conflict: [...hourCounts.values()].some((c) => c > 1) };
    })
    .sort((a, b) => a.room.localeCompare(b.room));

  return { pendingJustifications, todayAbsences, roomsToday, pendingTotal: pendingJustifications.length };
}

export type StudentGradeRow = {
  id: number;
  subjectId: number;
  value: string | number;
  type: string;
  date: string;
  description: string | null;
  createdAt: string;
};
export type StudentRecentGrade = {
  id: number;
  subjectId: number;
  value: number;
  type: string;
  date: string;
  description: string | null;
  subjectName: string;
  createdAt: string;
};

export function mapStudentSummary(args: {
  grades: StudentGradeRow[];
  attendance: { status: string }[];
  pendingAssignmentsCount: number;
  upcomingEventsCount: number;
  unreadAnnouncementsCount: number;
  subjectNames: Map<number, string>;
}): {
  role: "student";
  gradeAverage: number | null;
  totalGrades: number;
  attendancePercentage: number | null;
  pendingAssignments: number;
  upcomingEvents: number;
  unreadAnnouncements: number;
  recentGrades: StudentRecentGrade[];
} {
  const {
    grades,
    attendance,
    pendingAssignmentsCount,
    upcomingEventsCount,
    unreadAnnouncementsCount,
    subjectNames,
  } = args;

  const values = grades.map((g) => parseFloat(String(g.value)));
  const gradeAverage =
    values.length > 0
      ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) /
        100
      : null;

  const presenti = attendance.filter((a) => a.status === "presente").length;
  const attendancePercentage =
    attendance.length > 0
      ? Math.round((presenti / attendance.length) * 100)
      : null;

  const recentGrades: StudentRecentGrade[] = [...grades]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((g) => ({
      id: g.id,
      subjectId: g.subjectId,
      value: parseFloat(String(g.value)),
      type: g.type,
      date: g.date,
      description: g.description,
      subjectName: subjectNames.get(g.subjectId) ?? "Unknown",
      createdAt: g.createdAt,
    }));

  return {
    role: "student",
    gradeAverage,
    totalGrades: grades.length,
    attendancePercentage,
    pendingAssignments: pendingAssignmentsCount,
    upcomingEvents: upcomingEventsCount,
    unreadAnnouncements: unreadAnnouncementsCount,
    recentGrades,
  };
}
