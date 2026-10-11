import type { Capability } from "@/modules/services/domain/capability";
import type { Service, ServiceSlug } from "@/modules/services/domain/service";

export interface ServiceRepository {
  findAll(): Promise<Service[]>;
  findBySlug(slug: ServiceSlug): Promise<Service | null>;
  /** The four core capabilities, in display order. */
  findCapabilities(): Promise<Capability[]>;
}
