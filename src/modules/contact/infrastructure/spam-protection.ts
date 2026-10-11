import { createHmac, timingSafeEqual } from "node:crypto";

const MINIMUM_AGE_MS = 3_000;
const MAXIMUM_AGE_MS = 60 * 60 * 1_000;

function signature(timestamp: string, secret: string): Buffer {
  return createHmac("sha256", secret).update(`contact:${timestamp}`).digest();
}

export function createContactTimeToken(secret: string, now = Date.now()): string {
  if (Buffer.byteLength(secret, "utf8") < 32) throw new Error("CONTACT_SIGNING_SECRET is not configured safely");
  const timestamp = String(now);
  return `${timestamp}.${signature(timestamp, secret).toString("base64url")}`;
}

export type TimeTokenResult = "valid" | "missing" | "invalid" | "expired" | "too_early";

export function verifyContactTimeToken(token: string, secret: string, now = Date.now()): TimeTokenResult {
  if (!token) return "missing";
  if (Buffer.byteLength(secret, "utf8") < 32) return "invalid";
  const [timestampText, encodedSignature, extra] = token.split(".");
  if (!timestampText || !encodedSignature || extra !== undefined || !/^\d{13}$/.test(timestampText)) return "invalid";
  const issuedAt = Number(timestampText);
  const supplied = Buffer.from(encodedSignature, "base64url");
  const expected = signature(timestampText, secret);
  if (
    supplied.length !== expected.length
    || supplied.toString("base64url") !== encodedSignature
    || !timingSafeEqual(supplied, expected)
  ) return "invalid";
  const age = now - issuedAt;
  if (age < MINIMUM_AGE_MS) return "too_early";
  if (age > MAXIMUM_AGE_MS || age < 0) return "expired";
  return "valid";
}
