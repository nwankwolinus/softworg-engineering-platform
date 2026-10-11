/**
 * The six approved top-level services. "Digital Solutions" is the overarching positioning, not a service,
 * and Product Engineering is a core capability (see `capability.ts`) rather than a separate service.
 * Do not add a service without company approval.
 */
export const SERVICE_SLUGS = [
  "custom-software-engineering",
  "ai-engineering-intelligent-systems",
  "business-process-automation",
  "web-application-engineering",
  "api-systems-integration",
  "software-architecture-consulting",
] as const;

export type ServiceSlug = (typeof SERVICE_SLUGS)[number];

export interface Service {
  slug: ServiceSlug;
  title: string;
  /** One or two sentences describing what Softworg can engineer. Never delivered results. */
  summary: string;
  /** Short phrases for the Services page. General capabilities only. */
  highlights: readonly string[];
}
