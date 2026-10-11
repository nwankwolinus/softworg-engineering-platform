import { describe, expect, it } from "vitest";
import { resolveContactMode } from "@/modules/contact/domain/contact-mode";

describe("resolveContactMode", () => {
  it("is disabled whenever the feature is off, whatever the receiver", () => {
    expect(resolveContactMode({ enabled: false, deliversEnquiries: false })).toBe("disabled");
    expect(resolveContactMode({ enabled: false, deliversEnquiries: true })).toBe("disabled");
  });

  it("is test mode when enabled but the receiver does not deliver", () => {
    expect(resolveContactMode({ enabled: true, deliversEnquiries: false })).toBe("test");
  });

  it("is live only when enabled and the receiver really delivers", () => {
    expect(resolveContactMode({ enabled: true, deliversEnquiries: true })).toBe("live");
  });
});
