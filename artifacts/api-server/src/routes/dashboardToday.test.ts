import { describe, it, expect } from "vitest";
import { mapTeacherToday, mapStaffToday } from "./dashboardToday";

describe("mapTeacherToday", () => {
  it("returns today's lessons sorted by hour with attendanceTaken flag", () => {
    const result = mapTeacherToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      schedule: [
        { id: 10, classId: 3, dayOfWeek: 1, hour: 2, subjectId: 7, teacherId: 99, room: "A1" },
        { id: 11, classId: 3, dayOfWeek: 1, hour: 1, subjectId: 7, teacherId: 99, room: "A1" },
        { id: 12, classId: 4, dayOfWeek: 2, hour: 1, subjectId: 7, teacherId: 99, room: "B2" },
      ],
      attendance: [{ classId: 3, studentId: 1, date: "2026-06-22", status: "presente" }],
      assignments: [],
      appointments: [],
      classNames: new Map([[3, "3A"], [4, "4B"]]),
      subjectNames: new Map([[7, "Informatica"]]),
      studentNames: new Map(),
    });
    expect(result.todayLessons.map((l) => l.hour)).toEqual([1, 2]);
    expect(result.todayLessons[0]).toMatchObject({
      scheduleId: 11,
      className: "3A",
      subjectName: "Informatica",
      attendanceTaken: true,
    });
    expect(result.todayLessons.find((l) => l.scheduleId === 12)).toBeUndefined();
  });

  it("lists upcoming assignments by due date and picks earliest upcoming appointment", () => {
    const result = mapTeacherToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      schedule: [],
      attendance: [],
      assignments: [
        { id: 1, title: "Esercizi SQL", classId: 3, dueDate: "2026-06-30" },
        { id: 2, title: "Relazione", classId: 3, dueDate: "2026-06-24" },
        { id: 3, title: "Vecchio", classId: 3, dueDate: "2026-06-01" },
      ],
      appointments: [
        { id: 1, teacherId: 99, studentId: 5, date: "2026-06-25", timeSlot: "10:00", status: "confirmed" },
        { id: 2, teacherId: 99, studentId: 6, date: "2026-06-23", timeSlot: "09:00", status: "requested" },
        { id: 3, teacherId: 99, studentId: 7, date: "2026-06-20", timeSlot: "09:00", status: "confirmed" },
      ],
      classNames: new Map([[3, "3A"]]),
      subjectNames: new Map(),
      studentNames: new Map([[6, "Mario Rossi"]]),
    });
    expect(result.assignmentsDue.map((a) => a.id)).toEqual([2, 1]);
    expect(result.nextAppointment).toMatchObject({ id: 2, date: "2026-06-23", studentName: "Mario Rossi" });
  });

  it("returns null appointment when none upcoming", () => {
    const result = mapTeacherToday({
      today: "2026-06-22", dayOfWeek: 1,
      schedule: [], attendance: [], assignments: [], appointments: [],
      classNames: new Map(), subjectNames: new Map(), studentNames: new Map(),
    });
    expect(result.nextAppointment).toBeNull();
  });
});

describe("mapStaffToday", () => {
  it("maps pending justifications and today's absences with names and classes", () => {
    const result = mapStaffToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      justifications: [{ id: 1, studentId: 5, reason: "Visita medica", status: "pending", createdAt: "2026-06-22T08:00:00.000Z" }],
      attendance: [
        { classId: 3, studentId: 5, date: "2026-06-22", status: "assente" },
        { classId: 3, studentId: 6, date: "2026-06-22", status: "presente" },
      ],
      schedule: [],
      classNames: new Map([[3, "3A"]]),
      studentNames: new Map([[5, "Mario Rossi"], [6, "Lucia Bianchi"]]),
      studentClassIds: new Map([[5, 3], [6, 3]]),
    });
    expect(result.pendingJustifications).toEqual([
      { id: 1, studentName: "Mario Rossi", className: "3A", reason: "Visita medica", createdAt: "2026-06-22T08:00:00.000Z" },
    ]);
    expect(result.todayAbsences).toEqual([{ studentId: 5, studentName: "Mario Rossi", className: "3A" }]);
    expect(result.pendingTotal).toBe(1);
  });

  it("flags a room conflict when two lessons share room+hour today", () => {
    const result = mapStaffToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      justifications: [],
      attendance: [],
      schedule: [
        { id: 1, classId: 3, dayOfWeek: 1, hour: 1, subjectId: 7, teacherId: 9, room: "A1" },
        { id: 2, classId: 4, dayOfWeek: 1, hour: 1, subjectId: 8, teacherId: 10, room: "A1" },
        { id: 3, classId: 5, dayOfWeek: 1, hour: 2, subjectId: 8, teacherId: 10, room: "B2" },
        { id: 4, classId: 6, dayOfWeek: 2, hour: 1, subjectId: 8, teacherId: 10, room: "C3" },
      ],
      classNames: new Map(),
      studentNames: new Map(),
      studentClassIds: new Map(),
    });
    expect(result.roomsToday.find((r) => r.room === "A1")).toMatchObject({ slots: 2, conflict: true });
    expect(result.roomsToday.find((r) => r.room === "B2")).toMatchObject({ slots: 1, conflict: false });
    expect(result.roomsToday.find((r) => r.room === "C3")).toBeUndefined();
  });
});
