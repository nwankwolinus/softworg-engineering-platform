import type { Metadata } from "next";
import { readServerEnv } from "@/shared/config/env";
import { siteConfig } from "@/shared/config/site";

interface PageMetadataInput {
  /** Page title. The brand is appended: "Title | <company name>". */
  title: string;
  description: string;
  /** Site-relative path; becomes the canonical URL and `og:url` (resolved against `metadataBase`). */
  path: string;
  /** Use instead of `title` where the brand should lead (the homepage). */
  absoluteTitle?: string;
  /** Marks the page as an article for social previews. */
  article?: { publishedTime: string };
}

/**
 * One place that builds page metadata, so every page gets a consistent canonical, Open Graph and X card.
 * Pages set `openGraph` as a whole (Next does not merge it with the layout's), hence the full object here.
 */
export function buildMetadata({ title, description, path, absoluteTitle, article }: PageMetadataInput): Metadata {
  const fullTitle = absoluteTitle ?? `${title} | ${siteConfig.name}`;
  const titleField = absoluteTitle ? { absolute: absoluteTitle } : title;

  // No configured domain (SITE_URL) means no absolute URLs can be produced honestly, so canonical,
  // og:url and preview images are omitted instead of guessed. They appear automatically once SITE_URL is set.
  if (!readServerEnv().siteUrl) {
    return {
      title: titleField,
      description,
      openGraph: { title: fullTitle, description, siteName: siteConfig.name, type: "website" },
      twitter: { card: "summary", title: fullTitle, description },
    };
  }

  const image = siteConfig.ogImage;
  const openGraphBase = {
    title: fullTitle,
    description,
    url: path,
    siteName: siteConfig.name,
    images: [{ url: image.url, width: image.width, height: image.height, alt: image.alt }],
  };

  return {
    title: titleField,
    description,
    alternates: { canonical: path },
    openGraph: article
      ? { ...openGraphBase, type: "article", publishedTime: article.publishedTime }
      : { ...openGraphBase, type: "website" },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [image.url] },
  };
}

/** Metadata for a route that must not be indexed (for example, an entity that is not public). */
export const noIndexMetadata = (title: string): Metadata => ({ title, robots: { index: false, follow: false } });
