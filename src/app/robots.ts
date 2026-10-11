import type { MetadataRoute } from "next";
import { readServerEnv } from "@/shared/config/env";
import { absoluteUrl } from "@/shared/seo/serialize-json-ld";

export default function robots(): MetadataRoute.Robots {
  const { siteUrl } = readServerEnv();
  return {
    rules: { userAgent: "*", allow: "/" },
    // Only advertised once a domain is configured: a sitemap needs absolute URLs.
    ...(siteUrl ? { sitemap: absoluteUrl(siteUrl, "/sitemap.xml") } : {}),
  };
}
