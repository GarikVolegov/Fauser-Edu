import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary.getDerivedStateFromError", () => {
  it("flips into the error state carrying the error", () => {
    const err = new Error("kaboom");
    expect(ErrorBoundary.getDerivedStateFromError(err)).toEqual({
      hasError: true,
      error: err,
    });
  });
});
