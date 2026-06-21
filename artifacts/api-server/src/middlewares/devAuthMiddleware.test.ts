import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import { getAuth } from "@clerk/express";
import { devAuthMiddleware, DEV_USER_CLERK_ID } from "./devAuthMiddleware";

describe("devAuthMiddleware", () => {
  it("makes getAuth(req) return the mock dev user", async () => {
    const app = express();
    app.use(devAuthMiddleware);
    app.get("/whoami", (req, res) => {
      const auth = getAuth(req);
      res.json({ userId: auth.userId });
    });

    const res = await request(app).get("/whoami");
    expect(res.status).toBe(200);
    expect(res.body.userId).toBe(DEV_USER_CLERK_ID);
  });
});
