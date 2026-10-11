/**
 * Public site and company configuration: the single place approved public business facts are written.
 * Everything here is safe to render into pages. Secrets never belong in this file (see ARCHITECTURE.md,
 * "Configuration and production readiness"). Source: the approved Softworg business information.
 *
 * Deliberately absent because they are not approved or not configured yet: a website domain (comes from the
 * SITE_URL environment variable), a company-domain email, a contact provider, public projects and products.
 */

export type SocialPlatform = "linkedin" | "instagram" | "x";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
  /**
   * `official`: an official Softworg company account.
   * `representative`: a founder/representative account. It must never be described as a company account.
   */
  kind: "official" | "representative";
}

export const siteConfig = {
  name: "Softworg Engineering Services",
  businessNature: "Software and AI Engineering Solutions",
  positioning: "B2B technology engineering company",
  description:
    "Softworg Engineering Services provides software engineering, AI engineering, digital automation and product engineering for organisations.",
  locale: "en",

  contact: {
    /** Temporary public business email until a company-domain address is configured. */
    email: "nwankwolinus9@gmail.com",
    phone: "+2348067042742",
  },
  location: "Ejigbo, Lagos, Nigeria",
  /** Shown on the Contact page only. Do not repeat it in metadata, structured data or other pages. */
  fullAddress: "40 Egbe Road, opposite First Bank, Ejigbo, Lagos",

  socialLinks: [
    { platform: "linkedin", label: "LinkedIn", url: "https://www.linkedin.com/company/softworg", kind: "official" },
    { platform: "instagram", label: "Instagram", url: "https://www.instagram.com/softworg", kind: "official" },
    { platform: "x", label: "X", url: "https://x.com/NwankwoLinus3", kind: "representative" },
  ] satisfies readonly SocialLink[],

  /** Existing brand asset (logo on the brand navy), used for link previews. No generated screenshots. */
  ogImage: { url: "/brand/og-image.png", width: 1200, height: 630, alt: "Softworg Engineering Services logo" },
  logoPath: "/brand/softworg-logo.png",
} as const;

/** The accounts that may be presented as official Softworg company accounts. */
export const officialSocialLinks: readonly SocialLink[] = siteConfig.socialLinks.filter(
  (link) => link.kind === "official",
);
