/**
 * The four core capabilities. This list is the company's shared business taxonomy:
 * other modules (e.g. Project.category) reference it by type. See ARCHITECTURE.md,
 * "Deliberate cross-module dependency". Capabilities are NOT the service catalogue (see `service.ts`).
 */
export const CAPABILITY_SLUGS = [
  "software-engineering",
  "ai-engineering",
  "digital-automation",
  "product-engineering",
] as const;

export type CapabilitySlug = (typeof CAPABILITY_SLUGS)[number];

export interface Capability {
  slug: CapabilitySlug;
  title: string;
  /** One or two sentences describing the capability. */
  summary: string;
}
