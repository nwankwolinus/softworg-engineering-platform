import { describe, expect, it } from "vitest";
import { primaryNavigation } from "@/shared/config/navigation";
import { routes } from "@/shared/constants/routes";

describe("primaryNavigation", () => {
  it("exposes every top-level page, in order, pointing at the shared route constants", () => {
    expect(primaryNavigation.map((item) => [item.label, item.href])).toEqual([
      ["Home", routes.home],
      ["About", routes.about],
      ["Services", routes.services],
      ["Projects", routes.projects],
      ["Products", routes.products],
      ["Insights", routes.insights],
      ["Contact", routes.contact],
    ]);
  });

  it("has unique destinations and exactly one call to action, Contact", () => {
    const hrefs = primaryNavigation.map((item) => item.href);
    expect(new Set(hrefs).size).toBe(hrefs.length);
    expect(primaryNavigation.filter((item) => item.cta).map((item) => item.href)).toEqual([routes.contact]);
  });
});
