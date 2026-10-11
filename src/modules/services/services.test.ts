import { describe, expect, it } from "vitest";
import { serviceRepository } from "@/modules/services/composition";
import { CAPABILITY_SLUGS } from "@/modules/services/domain/capability";
import { SERVICE_SLUGS } from "@/modules/services/domain/service";

describe("services", () => {
  it("provides exactly the six approved services, in taxonomy order", async () => {
    const services = await serviceRepository.findAll();
    expect(services.map((service) => service.slug)).toEqual([...SERVICE_SLUGS]);
    expect(services).toHaveLength(6);
  });

  it("gives every service a title, a summary and highlights, with no duplicates", async () => {
    for (const service of await serviceRepository.findAll()) {
      expect(service.title.trim(), service.slug).not.toBe("");
      expect(service.summary.trim(), service.slug).not.toBe("");
      expect(service.highlights.length, service.slug).toBeGreaterThan(0);
      expect(new Set(service.highlights).size, `${service.slug} has duplicate highlights`).toBe(service.highlights.length);
    }
  });

  it("finds a service by slug and returns null for an unknown one", async () => {
    expect((await serviceRepository.findBySlug("api-systems-integration"))?.title).toBe("API & Systems Integration");
    expect(await serviceRepository.findBySlug("nope" as never)).toBeNull();
  });

  it("provides exactly the four core capabilities, in taxonomy order", async () => {
    const capabilities = await serviceRepository.findCapabilities();
    expect(capabilities.map((capability) => capability.slug)).toEqual([...CAPABILITY_SLUGS]);
    for (const capability of capabilities) {
      expect(capability.title.trim()).not.toBe("");
      expect(capability.summary.trim()).not.toBe("");
    }
  });
});
