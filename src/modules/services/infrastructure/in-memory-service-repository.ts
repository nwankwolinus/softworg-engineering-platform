import type { Capability } from "@/modules/services/domain/capability";
import type { Service, ServiceSlug } from "@/modules/services/domain/service";
import type { ServiceRepository } from "@/modules/services/domain/service-repository";

export class InMemoryServiceRepository implements ServiceRepository {
  constructor(
    private readonly services: readonly Service[],
    private readonly capabilities: readonly Capability[],
  ) {}

  async findAll(): Promise<Service[]> {
    return [...this.services];
  }

  async findBySlug(slug: ServiceSlug): Promise<Service | null> {
    return this.services.find((service) => service.slug === slug) ?? null;
  }

  async findCapabilities(): Promise<Capability[]> {
    return [...this.capabilities];
  }
}
