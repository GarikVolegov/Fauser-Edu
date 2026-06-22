import { describe, it, expect, vi } from "vitest";
import { errorHandler, notFoundHandler } from "./errorHandler";

function makeRes() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headersSent: false,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(obj: unknown) {
      this.body = obj;
      return this;
    },
  };
}

describe("notFoundHandler", () => {
  it("responds 404 with a JSON error", () => {
    const res = makeRes();
    notFoundHandler({} as any, res as any);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});

describe("errorHandler", () => {
  it("uses err.status and message when provided", () => {
    const res = makeRes();
    const next = vi.fn();
    errorHandler(
      { status: 400, message: "Bad thing" } as any,
      { log: { error: vi.fn() } } as any,
      res as any,
      next,
    );
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Bad thing" });
    expect(next).not.toHaveBeenCalled();
  });

  it("defaults to 500 with a generic message and logs", () => {
    const res = makeRes();
    const log = { error: vi.fn() };
    errorHandler(new Error("boom") as any, { log } as any, res as any, vi.fn());
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
    expect(log.error).toHaveBeenCalled();
  });

  it("delegates to next when headers already sent", () => {
    const res = makeRes();
    res.headersSent = true;
    const next = vi.fn();
    const err = new Error("late");
    errorHandler(err as any, {} as any, res as any, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
