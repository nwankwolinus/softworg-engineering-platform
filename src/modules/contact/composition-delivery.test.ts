import { describe, expect, it } from "vitest";
import { resolveContactDelivery } from "@/modules/contact/composition";
import { readServerEnv } from "@/shared/config/env";

const secret = "this-is-a-signing-secret-with-at-least-32-bytes";
const validLive = {
  NODE_ENV: "production",
  FEATURE_CONTACT_FORM: "true",
  CONTACT_DELIVERY_MODE: "live",
  CONTACT_DEPLOYMENT_ENV: "production",
  RESEND_API_KEY: "re_1234567890abcdef",
  CONTACT_FROM_EMAIL: "enquiries@example.com",
  CONTACT_SENDER_DOMAIN_VERIFIED: "true",
  CONTACT_NOTIFICATION_RECIPIENTS: "one@example.com,two@example.com",
  CONTACT_SIGNING_SECRET: secret,
};

describe("contact delivery resolution", () => {
  it("selects live only with explicit feature, mode, production context, and complete settings", () => {
    expect(resolveContactDelivery(readServerEnv(validLive)).mode).toBe("live");
  });

  it("fails closed for missing live settings and deployment previews", () => {
    expect(resolveContactDelivery(readServerEnv({ ...validLive, CONTACT_NOTIFICATION_RECIPIENTS: "" })).mode).toBe("disabled");
    expect(resolveContactDelivery(readServerEnv({ ...validLive, CONTACT_DEPLOYMENT_ENV: "preview", VERCEL_ENV: "preview" })).mode).toBe("disabled");
    expect(resolveContactDelivery(readServerEnv({ ...validLive, FEATURE_CONTACT_FORM: "false" })).mode).toBe("disabled");
  });

  it("allows logging test mode only outside production", () => {
    expect(resolveContactDelivery(readServerEnv({ FEATURE_CONTACT_FORM: "true", CONTACT_DELIVERY_MODE: "test", CONTACT_SIGNING_SECRET: secret, NODE_ENV: "development" })).mode).toBe("test");
    expect(resolveContactDelivery(readServerEnv({ FEATURE_CONTACT_FORM: "true", CONTACT_DELIVERY_MODE: "test", CONTACT_SIGNING_SECRET: secret, NODE_ENV: "production" })).mode).toBe("disabled");
  });
});
