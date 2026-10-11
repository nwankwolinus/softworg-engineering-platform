import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/modules/projects/composition", () => ({
  projectQueries: { listPublic: async () => [{ slug: "p1", updatedAt: "2025-01-01T00:00:00.000Z" }] },
}));
vi.mock("@/modules/products/composition", () => ({
  productQueries: { listPublic: async () => [{ slug: "pr1", updatedAt: "2025-01-02T00:00:00.000Z" }] },
}));
vi.mock("@/modules/insights/composition", () => ({
  insightQueries: { listPublished: async () => [{ slug: "i1", updatedAt: "2025-01-03T00:00:00.000Z" }] },
}));

const { default: sitemap } = await import("@/app/sitemap");

describe("sitemap", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("lists every top-level page and every entity returned by the public queries, as absolute URLs", async () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    const urls = (await sitemap()).map((entry) => entry.url);

    expect(urls).toEqual(
      expect.arrayContaining([
        "https://example.com/",
        "https://example.com/about",
        "https://example.com/services",
        "https://example.com/projects",
        "https://example.com/products",
        "https://example.com/insights",
        "https://example.com/contact",
        "https://example.com/projects/p1",
        "https://example.com/products/pr1",
        "https://example.com/insights/i1",
      ]),
    );
    expect(urls).toHaveLength(10);
  });

  it("returns no entries when no site URL is configured, rather than inventing a domain", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_URL", "");
    expect(await sitemap()).toEqual([]);
  });
});
