import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "./app";

describe("GET /api/healthz", () => {
  it("is public and returns 200 even without Clerk keys", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });

  it("sends helmet security headers (CSP left to the web tier)", async () => {
    const res = await request(app).get("/api/healthz");
    expect(res.headers["x-content-type-options"]).toBe("nosniff");
    expect(res.headers["content-security-policy"]).toBeUndefined();
  });
});

describe("CORS allowlist", () => {
  it("reflects an allow-listed dev origin", async () => {
    const res = await request(app)
      .get("/api/healthz")
      .set("Origin", "http://localhost:3100");
    expect(res.headers["access-control-allow-origin"]).toBe(
      "http://localhost:3100",
    );
  });

  it("does not reflect a non-allow-listed origin (closes the origin:true hole)", async () => {
    const res = await request(app)
      .get("/api/healthz")
      .set("Origin", "https://evil.example");
    expect(res.headers["access-control-allow-origin"]).toBeUndefined();
  });
});
