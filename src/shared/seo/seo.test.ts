import { afterEach, describe, expect, it, vi } from "vitest";
import { buildMetadata, noIndexMetadata } from "@/shared/seo/metadata";
import { absoluteUrl, serializeJsonLd } from "@/shared/seo/serialize-json-ld";

describe("buildMetadata", () => {
  const metadata = buildMetadata({ title: "About", description: "Desc", path: "/about" });

  it("sets title, description and canonical", () => {
    expect(metadata.title).toBe("About");
    expect(metadata.description).toBe("Desc");
    expect(metadata.alternates?.canonical).toBe("/about");
  });

  it("builds a complete Open Graph and X card without inventing an image", () => {
    expect(metadata.openGraph).toMatchObject({
      title: "About | Softworg Engineering Services",
      url: "/about",
      siteName: "Softworg Engineering Services",
      type: "website",
    });
    expect(metadata.twitter).toMatchObject({ card: "summary_large_image", images: ["/brand/og-image.png"] });
  });

  it("uses an absolute title where the brand should lead", () => {
    const home = buildMetadata({ title: "x", absoluteTitle: "Brand | Tagline", description: "d", path: "/" });
    expect(home.title).toEqual({ absolute: "Brand | Tagline" });
  });

  it("marks articles with their published time", () => {
    const article = buildMetadata({ title: "A", description: "d", path: "/insights/a", article: { publishedTime: "2025-01-01T00:00:00.000Z" } });
    expect(article.openGraph).toMatchObject({ type: "article", publishedTime: "2025-01-01T00:00:00.000Z" });
  });

  it("noIndexMetadata hides non-public routes from search engines", () => {
    expect(noIndexMetadata("Project not found").robots).toEqual({ index: false, follow: false });
  });
});

describe("structured data helpers", () => {
  it("escapes < so data cannot close the script tag", () => {
    const json = serializeJsonLd({ headline: "</script><script>alert(1)</script>" });
    expect(json).not.toContain("<");
    expect(JSON.parse(json).headline).toBe("</script><script>alert(1)</script>");
  });

  it("builds absolute URLs from the site URL", () => {
    expect(absoluteUrl("https://example.com", "/about")).toBe("https://example.com/about");
    expect(absoluteUrl("https://example.com/", "/")).toBe("https://example.com/");
  });
});

describe("buildMetadata without a configured domain", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("omits canonical, og:url and preview images instead of guessing a domain", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SITE_URL", "");
    const metadata = buildMetadata({ title: "About", description: "Desc", path: "/about" });
    expect(metadata.alternates).toBeUndefined();
    expect(metadata.openGraph).not.toHaveProperty("url");
    expect(metadata.openGraph).not.toHaveProperty("images");
    expect(metadata.twitter).toMatchObject({ card: "summary" });
    expect(metadata.twitter).not.toHaveProperty("images");
    expect(metadata.title).toBe("About");
  });
});
