import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { companyRepository } from "@/modules/company/composition";
import { insightQueries } from "@/modules/insights/composition";
import { productQueries } from "@/modules/products/composition";
import { projectQueries } from "@/modules/projects/composition";
import { serviceRepository } from "@/modules/services/composition";
import { officialSocialLinks, siteConfig } from "@/shared/config/site";

/**
 * Content governance. These tests guard the approved business facts: they fail if a fact is duplicated
 * outside central configuration, if placeholder content returns, or if unapproved content is published.
 * The expected values below are deliberately written out: this file is the check against drift.
 */

const srcDir = fileURLToPath(new URL("./", import.meta.url));

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.(ts|tsx|css)$/.test(entry) && !/\.test\.(ts|tsx)$/.test(entry) ? [path] : [];
  });
}

const files = sourceFiles(srcDir).map((path) => ({
  path: relative(srcDir, path).split(sep).join("/"),
  text: readFileSync(path, "utf8"),
}));

const filesContaining = (needle: string | RegExp) =>
  files.filter(({ text }) => (typeof needle === "string" ? text.includes(needle) : needle.test(text))).map((file) => file.path);

describe("approved business facts live in one place", () => {
  it.each([
    ["email", "nwankwolinus9@gmail.com"],
    ["phone", "+2348067042742"],
    ["street address", "Egbe Road"],
    ["LinkedIn URL", "linkedin.com"],
    ["Instagram URL", "instagram.com"],
    ["X URL", "x.com/"],
  ])("the %s is written only in shared/config/site.ts", (_label, value) => {
    expect(filesContaining(value)).toEqual(["shared/config/site.ts"]);
  });

  it("the full address is read only by the Contact page (and the config/company adapters that carry it)", () => {
    expect(filesContaining("fullAddress").sort()).toEqual(
      [
        "app/contact/page.tsx",
        "modules/company/domain/company-profile.ts",
        "modules/company/infrastructure/seed-company-repository.ts",
        "shared/config/site.ts",
      ].sort(),
    );
  });

  it("matches the approved values", async () => {
    const company = await companyRepository.getProfile();
    expect(company.name).toBe("Softworg Engineering Services");
    expect(company.businessNature).toBe("Software and AI Engineering Solutions");
    expect(company.positioning).toBe("B2B technology engineering company");
    expect(company.contactEmail).toBe("nwankwolinus9@gmail.com");
    expect(company.phone).toBe("+2348067042742");
    expect(company.location).toBe("Ejigbo, Lagos, Nigeria");
    expect(company.fullAddress).toBe("40 Egbe Road, opposite First Bank, Ejigbo, Lagos");
  });
});

describe("social accounts", () => {
  it("lists exactly the approved accounts with clean URLs", () => {
    expect(siteConfig.socialLinks.map(({ platform, url, kind }) => [platform, url, kind])).toEqual([
      ["linkedin", "https://www.linkedin.com/company/softworg", "official"],
      ["instagram", "https://www.instagram.com/softworg", "official"],
      ["x", "https://x.com/NwankwoLinus3", "representative"],
    ]);
  });

  it("never treats the X account as an official company account", () => {
    expect(officialSocialLinks.map((link) => link.platform)).toEqual(["linkedin", "instagram"]);
  });
});

describe("service catalogue", () => {
  it("is exactly the six approved services", async () => {
    expect((await serviceRepository.findAll()).map((service) => service.title)).toEqual([
      "Custom Software Engineering",
      "AI Engineering & Intelligent Systems",
      "Business Process Automation",
      "Web Application Engineering",
      "API & Systems Integration",
      "Software Architecture & Technology Consulting",
    ]);
  });

  it("keeps the four core capabilities, with Digital Solutions as a theme and not a service", async () => {
    expect((await serviceRepository.findCapabilities()).map((capability) => capability.title)).toEqual([
      "Software Engineering",
      "AI Engineering",
      "Digital Automation",
      "Product Engineering",
    ]);
    const serviceTitles = (await serviceRepository.findAll()).map((service) => service.title.toLowerCase());
    expect(serviceTitles.some((title) => title.includes("digital solution"))).toBe(false);
  });
});

describe("nothing is published without approval", () => {
  it("has no public projects, products or insights", async () => {
    expect(await projectQueries.listPublic()).toEqual([]);
    expect(await productQueries.listPublic()).toEqual([]);
    expect(await insightQueries.listPublished()).toEqual([]);
  });
});

describe("placeholder and secret hygiene", () => {
  it("contains no placeholder business content in application source", () => {
    const placeholders = /\.example\b|example\.com|lorem ipsum|john doe|\bacme\b|555-\d{4}/i;
    expect(filesContaining(placeholders)).toEqual([]);
  });

  it("never exposes configuration through NEXT_PUBLIC_ variables", () => {
    expect(filesContaining("NEXT_PUBLIC_").filter((path) => path !== "shared/config/env.ts")).toEqual([]);
  });
});
