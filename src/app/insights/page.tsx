import type { Metadata } from "next";
import { insightQueries } from "@/modules/insights/composition";
import { InsightList } from "@/modules/insights/presentation/insight-list";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { buildMetadata } from "@/shared/seo/metadata";
import { CtaBand } from "@/shared/ui/cta-band";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { contactCta } from "../_content/cta";

export const metadata: Metadata = buildMetadata({
  title: "Insights",
  description:
    `Technical perspectives from ${siteConfig.name} on software engineering, AI engineering, digital automation and product engineering.`,
  path: routes.insights,
});

export default async function InsightsPage() {
  const insights = await insightQueries.listPublished();

  return (
    <>
      <PageHeader
        eyebrow="Insights"
        title="Engineering perspectives"
        description="A place for technical perspectives on software engineering, AI engineering, digital automation and product engineering."
      />

      <Section spacing="tight">
        {insights.length === 0 ? (
          <EmptyState
            title="No insights have been published yet"
            description="Published articles will appear here. If you have a question about a project, you are welcome to get in touch."
          />
        ) : (
          <InsightList insights={insights} />
        )}
      </Section>

      <CtaBand {...contactCta} />
    </>
  );
}
