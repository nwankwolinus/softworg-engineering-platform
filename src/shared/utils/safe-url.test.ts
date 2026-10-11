import { describe, expect, it } from "vitest";
import { toSafeExternalUrl } from "@/shared/utils/safe-url";

describe("toSafeExternalUrl", () => {
  it("accepts http and https URLs", () => {
    expect(toSafeExternalUrl("https://example.com/path")).toBe("https://example.com/path");
    expect(toSafeExternalUrl("http://example.com/")).toBe("http://example.com/");
  });

  it("rejects script, data, mail and file schemes", () => {
    for (const value of ["javascript:alert(1)", "data:text/html,<b>x</b>", "mailto:a@b.co", "file:///etc/passwd", "ftp://x.test"]) {
      expect(toSafeExternalUrl(value), value).toBeUndefined();
    }
  });

  it("rejects relative, malformed and empty values", () => {
    for (const value of ["/relative", "not a url", "", undefined]) {
      expect(toSafeExternalUrl(value), String(value)).toBeUndefined();
    }
  });
});
