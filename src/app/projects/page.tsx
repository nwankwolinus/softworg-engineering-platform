import type { Metadata } from "next";
import { projectQueries } from "@/modules/projects/composition";
import { ProjectList } from "@/modules/projects/presentation/project-list";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { buildMetadata } from "@/shared/seo/metadata";
import { CtaBand } from "@/shared/ui/cta-band";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { contactCta } from "../_content/cta";

export const metadata: Metadata = buildMetadata({
  title: "Projects",
  description:
    `Engineering projects from ${siteConfig.name} that are ready for public presentation.`,
  path: routes.projects,
});

export default async function ProjectsPage() {
  // Visibility and lifecycle are enforced inside the queries; this page only presents the result.
  const [ongoing, portfolio] = await Promise.all([
    projectQueries.listOngoing(),
    projectQueries.listPortfolio(),
  ]);
  const hasProjects = ongoing.length > 0 || portfolio.length > 0;

  return (
    <>
      <PageHeader
        eyebrow="Projects"
        title="Engineering work"
        description="Selected projects, shown as they become ready for public presentation."
      />

      {!hasProjects && (
        <Section spacing="tight">
          <EmptyState
            title="Our public project portfolio is being developed"
            description="Selected engineering work will be listed here as projects move through development and become ready to share. To discuss a project of your own, get in touch."
          />
        </Section>
      )}
      {ongoing.length > 0 && (
        <Section eyebrow="In progress" title="Ongoing projects" spacing="tight">
          <ProjectList projects={ongoing} emptyTitle="" />
        </Section>
      )}
      {portfolio.length > 0 && (
        <Section eyebrow="Delivered" title="Portfolio" spacing="tight">
          <ProjectList projects={portfolio} emptyTitle="" />
        </Section>
      )}

      <CtaBand {...contactCta} />
    </>
  );
}
