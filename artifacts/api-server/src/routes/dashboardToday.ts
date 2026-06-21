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
