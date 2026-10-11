import type { ReactNode } from "react";
import { toSafeExternalUrl } from "@/shared/utils/safe-url";

/** A link to content-supplied URL. Renders nothing unless the URL is a valid http(s) address. */
export function ExternalLink({ href, children }: { href: string | undefined; children: ReactNode }) {
  const safeHref = toSafeExternalUrl(href);
  if (!safeHref) return null;
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noopener noreferrer"
      className="break-words text-primary underline underline-offset-4 motion-fast hover:text-primary-hover"
    >
      {children}
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}
