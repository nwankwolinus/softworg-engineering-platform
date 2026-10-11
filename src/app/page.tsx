import type { Metadata } from "next";
import { serviceRepository } from "@/modules/services/composition";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { buildMetadata } from "@/shared/seo/metadata";
import { JsonLd } from "@/shared/seo/json-ld";
import { absoluteUrl } from "@/shared/seo/serialize-json-ld";
import { readServerEnv } from "@/shared/config/env";
import { ButtonLink } from "@/shared/ui/button";
import { CtaBand } from "@/shared/ui/cta-band";
import { PageHeader } from "@/shared/ui/page-header";
import { contactCta } from "./_content/cta";
import { hero } from "./_home/content";
import { HeroVisual } from "./_home/hero-visual";
import {
  ApproachSection,
  CapabilitySection,
  PrinciplesSection,
  SolutionAreasSection,
} from "./_home/sections";
import { HomeShowcase } from "./_home/showcase";

export const metadata: Metadata = buildMetadata({
  title: siteConfig.name,
  absoluteTitle: `${siteConfig.name} | ${siteConfig.businessNature}`,
  description: `${siteConfig.name} designs and builds software products, AI-powered solutions and digital automation systems for organisations.`,
  path: routes.home,
});

/** Composition only: page copy lives in `_home/content.ts`, data comes through composition roots. */
export default async function HomePage() {
  const capabilities = await serviceRepository.findCapabilities();
  const { siteUrl } = readServerEnv();

  return (
    <>
      {/* Matches what the page visibly shows: name, logo and business nature. URLs appear only once a domain is configured. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              name: siteConfig.name,
              description: siteConfig.businessNature,
              ...(siteUrl ? { url: absoluteUrl(siteUrl, routes.home), logo: absoluteUrl(siteUrl, siteConfig.logoPath) } : {}),
            },
            {
              "@type": "WebSite",
              name: siteConfig.name,
              ...(siteUrl ? { url: absoluteUrl(siteUrl, routes.home) } : {}),
            },
          ],
        }}
      />
      <PageHeader
        size="hero"
        eyebrow={hero.eyebrow}
        title={hero.title}
        description={hero.description}
        visual={<HeroVisual />}
        actions={
          <>
            <ButtonLink href={routes.services} size="lg">
              {hero.primaryCta}
            </ButtonLink>
            <ButtonLink href={routes.contact} variant="secondary" size="lg">
              {hero.secondaryCta}
            </ButtonLink>
          </>
        }
      />
      <CapabilitySection capabilities={capabilities} />
      <ApproachSection />
      <SolutionAreasSection />
      <HomeShowcase />
      <PrinciplesSection />
      <CtaBand {...contactCta} />
    </>
  );
}
