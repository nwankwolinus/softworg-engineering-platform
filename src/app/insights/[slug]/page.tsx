import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { insightQueries } from "@/modules/insights/composition";
import { readServerEnv } from "@/shared/config/env";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { JsonLd } from "@/shared/seo/json-ld";
import { buildMetadata, noIndexMetadata } from "@/shared/seo/metadata";
import { absoluteUrl } from "@/shared/seo/serialize-json-ld";
import { Badge } from "@/shared/ui/badge";
import { Breadcrumbs } from "@/shared/ui/breadcrumbs";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { CtaBand } from "@/shared/ui/cta-band";
import { PageHeader } from "@/shared/ui/page-header";
import { formatDate } from "@/shared/utils/format-date";
import { contactCta } from "../../_content/cta";
import { insightStaticParams } from "@/app/insights/[slug]/static-params";

interface InsightPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return insightStaticParams(insightQueries);
}

export async function generateMetadata({ params }: InsightPageProps): Promise<Metadata> {
  const { slug } = await params;
  const insight = await insightQueries.getBySlug(slug); // drafts resolve to null
  if (!insight) return noIndexMetadata("Insight not found");
  return buildMetadata({
    title: insight.title,
    description: insight.summary,
    path: routes.insight(insight.slug),
    article: { publishedTime: insight.publishedAt },
  });
}

export default async function InsightPage({ params }: InsightPageProps) {
  const { slug } = await params;
  const insight = await insightQueries.getBySlug(slug);
  if (!insight) notFound();

  const { siteUrl } = readServerEnv();
  // Body is plain text for now: paragraphs are split on blank lines and rendered as text, never as HTML.
  const paragraphs = insight.body.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: insight.title,
          description: insight.summary,
          datePublished: insight.publishedAt,
          dateModified: insight.updatedAt,
          ...(siteUrl ? { mainEntityOfPage: absoluteUrl(siteUrl, routes.insight(insight.slug)) } : {}),
          publisher: { "@type": "Organization", name: siteConfig.name },
        }}
      />
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Insights", href: routes.insights },
              { label: insight.title },
            ]}
          />
        }
        eyebrow="Insight"
        title={insight.title}
        description={insight.summary}
      />

      <Container size="narrow" className="py-section">
        <article>
          <p className="text-body-sm text-muted-foreground">
            Published <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
          </p>
          {insight.tags.length > 0 && (
            <ul aria-label="Topics" className="mt-3 flex flex-wrap gap-2">
              {insight.tags.map((tag) => (
                <li key={tag}>
                  <Badge>{tag}</Badge>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-8 flex flex-col gap-5">
            {paragraphs.map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line text-body-lg text-foreground/90">
                {paragraph}
              </p>
            ))}
          </div>
        </article>
        <div className="mt-10">
          <ButtonLink href={routes.insights} variant="outline">
            All insights
          </ButtonLink>
        </div>
      </Container>

      <CtaBand {...contactCta} />
    </>
  );
}
