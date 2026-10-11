import type { Metadata } from "next";
import { serviceRepository } from "@/modules/services/composition";
import { CapabilityList } from "@/modules/services/presentation/capability-list";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { buildMetadata } from "@/shared/seo/metadata";
import { CtaBand } from "@/shared/ui/cta-band";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { contactCta } from "../_content/cta";
import { aboutHero, approachToTechnology, mindset, philosophy, whatWeDo } from "./content";

export const metadata: Metadata = buildMetadata({
  title: "About",
  description:
    `How ${siteConfig.name} approaches software, AI and automation work: understand the problem, define requirements, build incrementally, test and maintain.`,
  path: routes.about,
});

export default async function AboutPage() {
  const capabilities = await serviceRepository.findCapabilities();

  return (
    <>
      <PageHeader eyebrow={aboutHero.eyebrow} title={aboutHero.title} description={aboutHero.description} />

      <Section eyebrow={whatWeDo.eyebrow} title={whatWeDo.title} description={whatWeDo.description}>
        <CapabilityList capabilities={capabilities} />
      </Section>

      <Section tone="muted" eyebrow={philosophy.eyebrow} title={philosophy.title} description={philosophy.description}>
        <ol className="divide-y divide-border border-y border-border">
          {philosophy.steps.map((step, index) => (
            <li key={step.title} className="grid gap-x-8 gap-y-1 py-5 md:grid-cols-[3rem_16rem_minmax(0,1fr)] md:items-baseline">
              <span className="text-label text-primary">{String(index + 1).padStart(2, "0")}</span>
              <h3 className="text-h4 text-foreground">{step.title}</h3>
              <p className="text-body text-muted-foreground">{step.description}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        eyebrow={approachToTechnology.eyebrow}
        title={approachToTechnology.title}
        description={approachToTechnology.description}
      >
        <dl className="grid gap-x-12 md:grid-cols-2">
          {approachToTechnology.items.map((item) => (
            <div key={item.term} className="border-t border-border py-5">
              <dt className="text-h4 text-foreground">{item.term}</dt>
              <dd className="mt-1.5 text-body text-muted-foreground">{item.detail}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section tone="muted" eyebrow={mindset.eyebrow} title={mindset.title} containerSize="narrow">
        <p className="text-h3 text-foreground">{mindset.statement}</p>
        <div className="mt-6 flex flex-col gap-4">
          {mindset.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-body-lg text-muted-foreground">
              {paragraph}
            </p>
          ))}
        </div>
      </Section>

      <CtaBand {...contactCta} />
    </>
  );
}
