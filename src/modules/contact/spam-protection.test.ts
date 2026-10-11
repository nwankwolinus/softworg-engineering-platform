import { describe, expect, it } from "vitest";
import { createContactTimeToken, verifyContactTimeToken } from "@/modules/contact/infrastructure/spam-protection";

const secret = "test-signing-secret-with-more-than-32-bytes";
const now = 1_750_000_000_000;

describe("contact time trap", () => {
  it("accepts signed tokens after the minimum interval and before expiry", () => {
    expect(verifyContactTimeToken(createContactTimeToken(secret, now), secret, now + 4_000)).toBe("valid");
  });

  it("rejects missing, malformed, expired, premature, and tampered tokens", () => {
    const token = createContactTimeToken(secret, now);
    expect(verifyContactTimeToken("", secret, now + 4_000)).toBe("missing");
    expect(verifyContactTimeToken("bad", secret, now + 4_000)).toBe("invalid");
    expect(verifyContactTimeToken(token, secret, now + 1_000)).toBe("too_early");
    expect(verifyContactTimeToken(token, secret, now + 3_600_001)).toBe("expired");
    expect(verifyContactTimeToken(`${token}x`, secret, now + 4_000)).toBe("invalid");
  });
});
