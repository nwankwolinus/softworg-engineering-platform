import { describe, expect, it } from "vitest";
import { readServerEnv } from "@/shared/config/env";

describe("readServerEnv", () => {
  it("never guesses a site URL in production", () => {
    expect(readServerEnv({ NODE_ENV: "production" }).siteUrl).toBeUndefined();
    expect(readServerEnv({ NODE_ENV: "production", SITE_URL: "   " }).siteUrl).toBeUndefined();
  });

  it("defaults to localhost outside production so development works without setup", () => {
    expect(readServerEnv({ NODE_ENV: "development" }).siteUrl).toBe("http://localhost:3000");
    expect(readServerEnv({}).siteUrl).toBe("http://localhost:3000");
  });

  it("uses a configured SITE_URL as a clean origin", () => {
    expect(readServerEnv({ NODE_ENV: "production", SITE_URL: "https://example.org/some/path/" }).siteUrl).toBe(
      "https://example.org",
    );
  });

  it("rejects invalid or non-http URLs without echoing the value", () => {
    for (const value of ["not a url", "ftp://example.org", "javascript:alert(1)"]) {
      expect(() => readServerEnv({ SITE_URL: value })).toThrow(/SITE_URL/);
      expect(() => readServerEnv({ SITE_URL: value })).not.toThrow(new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    }
  });

  it("enables the contact form only for the exact string true", () => {
    expect(readServerEnv({}).features.contactForm).toBe(false);
    expect(readServerEnv({ FEATURE_CONTACT_FORM: "false" }).features.contactForm).toBe(false);
    expect(readServerEnv({ FEATURE_CONTACT_FORM: "TRUE" }).features.contactForm).toBe(false);
    expect(readServerEnv({ FEATURE_CONTACT_FORM: "true" }).features.contactForm).toBe(true);
  });

  it("parses validated recipient lists and server-only contact configuration", () => {
    const env = readServerEnv({
      FEATURE_CONTACT_FORM: "true",
      CONTACT_DELIVERY_MODE: "live",
      CONTACT_DEPLOYMENT_ENV: "production",
      RESEND_API_KEY: "re_1234567890abcdef",
      CONTACT_FROM_EMAIL: "enquiries@softworg.example",
      CONTACT_SENDER_DOMAIN_VERIFIED: "true",
      CONTACT_NOTIFICATION_RECIPIENTS: "first@example.com, second@example.com",
      CONTACT_SIGNING_SECRET: "this-is-a-signing-secret-with-at-least-32-bytes",
    });
    expect(env.features.contactForm).toBe(true);
    expect(env.contact.requestedMode).toBe("live");
    expect(env.contact.recipients).toEqual(["first@example.com", "second@example.com"]);
    expect(env.contact.resendApiKey).toBe("re_1234567890abcdef");
    expect(env.contact.signingSecret).toBeDefined();
  });

  it("marks invalid delivery modes and recipient addresses as invalid configuration", () => {
    expect(readServerEnv({ CONTACT_DELIVERY_MODE: "production" }).contact.configurationValid).toBe(false);
    expect(readServerEnv({ CONTACT_NOTIFICATION_RECIPIENTS: "valid@example.com, nope" }).contact.configurationValid).toBe(false);
  });

  it("does not accept malformed keys, sender addresses, or short signing secrets as configured values", () => {
    const env = readServerEnv({
      RESEND_API_KEY: "not-a-resend-key",
      CONTACT_FROM_EMAIL: "not-an-email",
      CONTACT_SIGNING_SECRET: "short",
    });
    expect(env.contact.resendApiKey).toBeUndefined();
    expect(env.contact.fromEmail).toBeUndefined();
    expect(env.contact.signingSecret).toBeUndefined();
  });
});
