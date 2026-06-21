import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto";

const ALGO = "aes-256-cbc";

function getKey(): Buffer {
  const secret = process.env.SESSION_SECRET ?? "fauser-default-secret-placeholder!";
  return scryptSync(secret, "fauser-email-salt", 32);
}

export function encrypt(text: string): string {
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGO, getKey(), iv);
  const encrypted = cipher.update(text, "utf8", "hex") + cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

export function decrypt(text: string): string {
  const [ivHex, encrypted] = text.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = createDecipheriv(ALGO, getKey(), iv);
  return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
}
