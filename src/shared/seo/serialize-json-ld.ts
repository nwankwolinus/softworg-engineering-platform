/** Serialises structured data for a `<script>` tag. `<` is escaped so data can never close the tag early. */
export function serializeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Builds an absolute URL from the configured site URL and a site-relative path. */
export function absoluteUrl(siteUrl: string, path: string): string {
  return new URL(path, siteUrl).toString();
}
