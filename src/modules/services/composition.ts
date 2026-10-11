import type { ServiceRepository } from "@/modules/services/domain/service-repository";
import { InMemoryServiceRepository } from "@/modules/services/infrastructure/in-memory-service-repository";
import { seedCapabilities, seedServices } from "@/modules/services/infrastructure/seed-services";

export const serviceRepository: ServiceRepository = new InMemoryServiceRepository(seedServices, seedCapabilities);
