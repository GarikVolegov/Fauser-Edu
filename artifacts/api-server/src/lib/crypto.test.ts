import { describe, it, expect } from "vitest";
import { encrypt, decrypt } from "./crypto";

describe("crypto (AES-256-CBC)", () => {
  it("round-trips a value: decrypt(encrypt(x)) === x", () => {
    const secret = "imap-app-password-123!";
    expect(decrypt(encrypt(secret))).toBe(secret);
  });

  it("produces a different ciphertext each time (random IV)", () => {
    const plain = "same-input";
    const a = encrypt(plain);
    const b = encrypt(plain);
    expect(a).not.toBe(b);
    // …but both still decrypt back to the original.
    expect(decrypt(a)).toBe(plain);
    expect(decrypt(b)).toBe(plain);
  });

  it("emits the iv:ciphertext shape", () => {
    const out = encrypt("x");
    expect(out).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/);
  });
});
