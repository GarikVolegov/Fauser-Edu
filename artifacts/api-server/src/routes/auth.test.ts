import { describe, it, expect, vi } from "vitest";
import { requireRole } from "./auth";
import * as authModule from "./auth";

// Lightweight DB-free test covering the early exit (401) of requireRole.
// Role decisions (403/allow) are exercised when the middleware is mounted on real routes
// (with DB available) and during manual verification with DevRoleSwitcher.

describe("requireRole (centralized)", () => {
  function makeReqRes(path = "/test", method = "GET") {
    const req: any = { method, url: path, headers: {} };
    const res: any = {
      statusCode: 200,
      body: undefined,
      status(code: number) { this.statusCode = code; return this; },
      json(obj: any) { this.body = obj; return this; },
    };
    const next = vi.fn();
    return { req, res, next };
  }

  it("returns 401 when unauthenticated (no auth info)", async () => {
    const mw = requireRole(["teacher"]);
    const { req, res, next } = makeReqRes();
    await mw(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 403 for disallowed role (e.g. student trying teacher action)", async () => {
    const mockGetOrCreate = vi.spyOn(authModule as any, "getOrCreateUser");
    mockGetOrCreate.mockResolvedValue({ id: 1, role: "student", clerkId: "c1" });

    const mw = requireRole(["teacher", "admin"]);
    const { req, res, next } = makeReqRes();
    (req as any).auth = () => ({ userId: "c1" });

    await mw(req, res, next);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Forbidden");
    expect(next).not.toHaveBeenCalled();
    mockGetOrCreate.mockRestore();
  });

  // Additional role allow test covered in integration/manual runs with DevRoleSwitcher + real DB.
  // Unit test focuses on unauth and forbidden paths for reliability.
});
