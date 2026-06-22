import { describe, it, expect } from "vitest";
import {
  resolveStudentScope,
  parseId,
  canSetAppointmentStatus,
} from "./requestHelpers";

describe("resolveStudentScope", () => {
  it("forces a student to their own id, ignoring a requested studentId (IDOR fix)", () => {
    expect(resolveStudentScope({ id: 5, role: "student" }, 9)).toBe(5);
    expect(resolveStudentScope({ id: 5, role: "student" }, undefined)).toBe(5);
  });

  it("lets staff filter by a requested studentId", () => {
    expect(resolveStudentScope({ id: 1, role: "teacher" }, 9)).toBe(9);
    expect(resolveStudentScope({ id: 1, role: "segreteria" }, 9)).toBe(9);
    expect(resolveStudentScope({ id: 1, role: "admin" }, 9)).toBe(9);
  });

  it("returns undefined (all students) for staff with no requested studentId", () => {
    expect(resolveStudentScope({ id: 1, role: "teacher" }, undefined)).toBeUndefined();
  });

  it("treats a null requested studentId like undefined", () => {
    expect(resolveStudentScope({ id: 1, role: "teacher" }, null)).toBeUndefined();
    expect(resolveStudentScope({ id: 5, role: "student" }, null)).toBe(5);
  });
});

describe("parseId", () => {
  it("parses a numeric string", () => {
    expect(parseId("42")).toBe(42);
  });
  it("returns null for a non-numeric id", () => {
    expect(parseId("abc")).toBeNull();
    expect(parseId("")).toBeNull();
  });
});

describe("canSetAppointmentStatus", () => {
  const appt = { studentId: 5 };
  it("lets staff confirm or cancel any appointment", () => {
    for (const role of ["teacher", "segreteria", "admin"]) {
      expect(canSetAppointmentStatus({ id: 1, role }, appt, "confirmed")).toBe(
        true,
      );
      expect(canSetAppointmentStatus({ id: 1, role }, appt, "cancelled")).toBe(
        true,
      );
    }
  });
  it("lets a student cancel only their own appointment", () => {
    expect(
      canSetAppointmentStatus({ id: 5, role: "student" }, appt, "cancelled"),
    ).toBe(true);
    expect(
      canSetAppointmentStatus({ id: 9, role: "student" }, appt, "cancelled"),
    ).toBe(false);
  });
  it("forbids a student from confirming", () => {
    expect(
      canSetAppointmentStatus({ id: 5, role: "student" }, appt, "confirmed"),
    ).toBe(false);
  });
});
