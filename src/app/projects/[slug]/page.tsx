import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectQueries } from "@/modules/projects/composition";
import { ProjectList } from "@/modules/projects/presentation/project-list";
import { ProjectStatusBadge } from "@/modules/projects/presentation/project-status-badge";
import { serviceRepository } from "@/modules/services/composition";
import { routes } from "@/shared/constants/routes";
import { buildMetadata, noIndexMetadata } from "@/shared/seo/metadata";
import { Badge } from "@/shared/ui/badge";
import { Breadcrumbs } from "@/shared/ui/breadcrumbs";
import { Container } from "@/shared/ui/container";
import { ContentImage } from "@/shared/ui/content-image";
import { CtaBand } from "@/shared/ui/cta-band";
import { DetailPanel } from "@/shared/ui/detail-panel";
import { ExternalLink } from "@/shared/ui/external-link";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { formatDate } from "@/shared/utils/format-date";
import { toSafeExternalUrl } from "@/shared/utils/safe-url";
import { contactCta } from "../../_content/cta";
import { projectStaticParams } from "@/app/projects/[slug]/static-params";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return projectStaticParams(projectQueries);
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = await projectQueries.getBySlug(slug); // non-public projects resolve to null
  // Never echo a requested slug or title for anything that is not public.
  if (!project) return noIndexMetadata("Project not found");
  return buildMetadata({ title: project.title, description: project.summary, path: routes.project(project.slug) });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = await projectQueries.getBySlug(slug);
  if (!project) notFound();

  const [capabilities, related] = await Promise.all([
    serviceRepository.findCapabilities(),
    projectQueries.listRelated(project),
  ]);
  const capability = capabilities.find((candidate) => candidate.slug === project.category);
  const image = project.thumbnail ?? project.images.at(0);

  // Only sections the data actually has: nothing is filled in for the sake of layout.
  const narrative = [
    { id: "context", title: "Context", text: project.problem },
    { id: "approach", title: "Approach", text: project.solution },
    { id: "outcome", title: "Outcome", text: project.outcome },
  ].filter((section): section is { id: string; title: string; text: string } => Boolean(section.text));

  // Links render only when the supplied URL is a valid http(s) address, so the label never appears empty.
  const liveUrl = toSafeExternalUrl(project.liveUrl);
  const repositoryUrl = toSafeExternalUrl(project.repositoryUrl);
  const hasLinks = Boolean(liveUrl ?? repositoryUrl);

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Projects", href: routes.projects },
              { label: project.title },
            ]}
          />
        }
        eyebrow="Project"
        title={project.title}
        description={project.summary}
      />

      <Container className="grid gap-12 py-section lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-16">
        <div className="flex min-w-0 flex-col gap-10">
          {image && <ContentImage image={image} sizes="(min-width: 1024px) 700px, 100vw" priority />}
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="text-h3 text-foreground">
              Overview
            </h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-body-lg text-muted-foreground">{project.description}</p>
          </section>
          {narrative.map((section) => (
            <section key={section.id} aria-labelledby={`${section.id}-heading`}>
              <h2 id={`${section.id}-heading`} className="text-h3 text-foreground">
                {section.title}
              </h2>
              <p className="mt-3 max-w-3xl whitespace-pre-line text-body-lg text-muted-foreground">{section.text}</p>
            </section>
          ))}
        </div>

        <DetailPanel
          label="Project details"
          items={[
            { label: "Status", value: <ProjectStatusBadge status={project.status} /> },
            ...(capability
              ? [
                  {
                    label: "Focus area",
                    value: (
                      <a href={routes.services} className="text-primary underline underline-offset-4 hover:text-primary-hover">
                        {capability.title}
                      </a>
                    ),
                  },
                ]
              : []),
            { label: "Started", value: formatDate(project.startDate) },
            ...(project.completionDate ? [{ label: "Completed", value: formatDate(project.completionDate) }] : []),
            ...(project.technologies.length > 0
              ? [
                  {
                    label: "Technologies",
                    value: (
                      <ul className="flex flex-wrap gap-2">
                        {project.technologies.map((technology) => (
                          <li key={technology}>
                            <Badge>{technology}</Badge>
                          </li>
                        ))}
                      </ul>
                    ),
                  },
                ]
              : []),
            ...(hasLinks
              ? [
                  {
                    label: "Links",
                    value: (
                      <div className="flex flex-col gap-2">
                        <ExternalLink href={liveUrl}>Live site</ExternalLink>
                        <ExternalLink href={repositoryUrl}>Source repository</ExternalLink>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Container>

      {related.length > 0 && (
        <Section tone="muted" title="Related projects" spacing="tight">
          <ProjectList projects={related} emptyTitle="" />
        </Section>
      )}

      <CtaBand {...contactCta} secondary={{ label: "All projects", href: routes.projects }} />
    </>
  );
}
