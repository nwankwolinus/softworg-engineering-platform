import type { Metadata } from "next";
import { serviceRepository } from "@/modules/services/composition";
import { ServiceList } from "@/modules/services/presentation/service-list";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { buildMetadata } from "@/shared/seo/metadata";
import { buttonVariants } from "@/shared/ui/button";
import { CtaBand } from "@/shared/ui/cta-band";
import { PageHeader } from "@/shared/ui/page-header";
import { ProcessSteps } from "@/shared/ui/process-steps";
import { Section } from "@/shared/ui/section";
import { coreServices, engagement, overview, servicesCta, servicesHero } from "./content";

/** "A, B, C and D" */
function joinWithAnd(items: readonly string[]): string {
  return items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

export const metadata: Metadata = buildMetadata({
  title: "Services",
  description:
    `Six engineering services from ${siteConfig.name}: custom software, AI and intelligent systems, process automation, web applications, integration, and architecture consulting.`,
  path: routes.services,
});

export default async function ServicesPage() {
  const [services, capabilities] = await Promise.all([serviceRepository.findAll(), serviceRepository.findCapabilities()]);

  return (
    <>
      <PageHeader eyebrow={servicesHero.eyebrow} title={servicesHero.title} description={servicesHero.description} />

      <Section
        eyebrow={overview.eyebrow}
        title={overview.title}
        description={`Our ${services.length} services draw on four core capabilities: ${joinWithAnd(capabilities.map((capability) => capability.title))}. They can be engaged individually or combined.`}
        spacing="tight"
      >
        <nav aria-label="Services on this page">
          <ul className="flex flex-wrap gap-3">
            {services.map((service) => (
              <li key={service.slug}>
                <a href={`#${service.slug}`} className={buttonVariants({ variant: "outline", size: "md" })}>
                  {service.title}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </Section>

      <Section eyebrow={coreServices.eyebrow} title={coreServices.title} spacing="tight">
        <ServiceList services={services} />
      </Section>

      <Section tone="muted" eyebrow={engagement.eyebrow} title={engagement.title} description={engagement.description}>
        <ProcessSteps steps={engagement.steps} columns={3} />
      </Section>

      <CtaBand {...servicesCta} />
    </>
  );
}
