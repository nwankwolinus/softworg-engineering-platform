/**
 * Returns the URL only if it is an absolute http(s) URL. Content-supplied links go through this
 * so `javascript:`, `data:` and malformed values are never rendered as hrefs.
 */
export function toSafeExternalUrl(value: string | undefined): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : undefined;
  } catch {
    return undefined;
  }
}
