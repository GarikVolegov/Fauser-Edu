import { describe, it, expect } from "vitest";
import { GetMeResponse } from "./generated/api";

describe("GetMeResponse schema", () => {
  const valid = {
    id: 1,
    clerkId: "user_123",
    email: "a@b.it",
    firstName: "Mario",
    lastName: "Rossi",
    role: "student",
    indirizzo: null,
    classId: null,
    createdAt: new Date().toISOString(),
  };

  it("accepts a valid user payload", () => {
    expect(() => GetMeResponse.parse(valid)).not.toThrow();
  });

  it("rejects an invalid role", () => {
    const bad = { ...valid, role: "principal" };
    expect(GetMeResponse.safeParse(bad).success).toBe(false);
  });

  it("rejects a non-numeric id", () => {
    const bad = { ...valid, id: "1" };
    expect(GetMeResponse.safeParse(bad).success).toBe(false);
  });
});
