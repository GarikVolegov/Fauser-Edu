import type { Request, Response, NextFunction } from "express";

/** 404 for any /api route that fell through the router. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

interface HttpError extends Error {
  status?: number;
}

/**
 * Last-resort error handler. Express 5 forwards rejected async handlers here,
 * so a missed try/catch never hangs a request. Produces a consistent
 * `{ error }` JSON shape.
 */
export function errorHandler(
  err: HttpError,
  req: Request & { log?: { error: (obj: unknown, msg?: string) => void } },
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = typeof err?.status === "number" ? err.status : 500;
  req.log?.error?.({ err }, "Unhandled error");
  res.status(status).json({
    error: status === 500 ? "Internal server error" : (err?.message ?? "Error"),
  });
}
