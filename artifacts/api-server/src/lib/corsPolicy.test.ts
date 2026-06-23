import { describe, it, expect } from "vitest";
import { parseCorsAllowlist, isAllowedOrigin } from "./corsPolicy";

describe("parseCorsAllowlist", () => {
  it("parses a comma-separated list, trimming blanks", () => {
    expect(parseCorsAllowlist("https://a.com, https://b.com")).toEqual([
      "https://a.com",
      "https://b.com",
    ]);
  });
  it("returns [] for undefined, empty, or all-blank input", () => {
    expect(parseCorsAllowlist(undefined)).toEqual([]);
    expect(parseCorsAllowlist("")).toEqual([]);
    expect(parseCorsAllowlist("  ,  ")).toEqual([]);
  });
});

describe("isAllowedOrigin", () => {
  const allow = ["https://app.fauser.edu"];
  it("allows requests with no Origin header (same-origin / server-to-server)", () => {
    expect(isAllowedOrigin(undefined, allow)).toBe(true);
  });
  it("allows an origin on the allowlist", () => {
    expect(isAllowedOrigin("https://app.fauser.edu", allow)).toBe(true);
  });
  it("rejects an origin not on the allowlist (no blanket reflection)", () => {
    expect(isAllowedOrigin("https://evil.example", allow)).toBe(false);
  });
  it("rejects every cross-origin when the allowlist is empty", () => {
    expect(isAllowedOrigin("https://app.fauser.edu", [])).toBe(false);
  });
});
