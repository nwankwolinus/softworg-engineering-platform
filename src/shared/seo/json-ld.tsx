import { serializeJsonLd } from "@/shared/seo/serialize-json-ld";

/** Renders one JSON-LD block. Only pass data that matches what the page visibly says. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  // Safe: the payload is JSON produced by serializeJsonLd, never raw HTML or user markup.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }} />;
}
