import type { ReactNode } from "react";
import type { CapabilitySlug } from "@/modules/services/domain/capability";

// One stroke style for all four so the set reads as a family. 24px grid, 1.5 stroke.
const glyphs: Record<CapabilitySlug, ReactNode> = {
  "software-engineering": <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />,
  "ai-engineering": (
    <>
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M10.5 12h3M12 3v4M12 17v4M3 12h4M17 12h4" />
    </>
  ),
  "digital-automation": <path d="M20 12a8 8 0 01-14 5.3M4 12a8 8 0 0114-5.3M18 3v4h-4M6 21v-4h4" />,
  "product-engineering": <path d="M12 3l9 5-9 5-9-5 9-5zM3 12.5l9 5 9-5M3 16.5l9 5 9-5" />,
};

/** Decorative: the adjacent title carries the meaning. */
export function CapabilityIcon({ slug }: { slug: CapabilitySlug }) {
  return (
    <span className="flex size-10 items-center justify-center rounded-md border border-primary/30 bg-primary/10 text-primary">
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="size-5"
      >
        {glyphs[slug]}
      </svg>
    </span>
  );
}
