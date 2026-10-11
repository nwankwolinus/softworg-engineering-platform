import type { Project } from "@/modules/projects/domain/project";
import { PROJECT_VISIBILITY } from "@/modules/projects/domain/project-lifecycle";
import { isPubliclyListed, statusesInPhase } from "@/modules/projects/domain/project-rules";
import type { ProjectRepository } from "@/modules/projects/domain/project-repository";

/**
 * Public-site project use cases. Visibility is enforced here, once, so no page
 * can accidentally expose PRIVATE, INTERNAL or archived projects regardless of data source.
 */
export function createProjectQueries(repository: ProjectRepository) {
  const publicVisibility = [PROJECT_VISIBILITY.PUBLIC];

  const listPortfolio = () =>
    repository.find({ statuses: statusesInPhase("delivered"), visibilities: publicVisibility });
  const listOngoing = () => repository.find({ statuses: statusesInPhase("ongoing"), visibilities: publicVisibility });

  return {
    listPortfolio,
    listOngoing,

    /** Every publicly listed project: ongoing first, then delivered. */
    listPublic: async (): Promise<Project[]> => [...(await listOngoing()), ...(await listPortfolio())],

    /** Other public projects in the same category, for "related work" links. */
    listRelated: async (project: Pick<Project, "slug" | "category">, limit = 3): Promise<Project[]> =>
      [...(await listOngoing()), ...(await listPortfolio())]
        .filter((other) => other.category === project.category && other.slug !== project.slug)
        .slice(0, limit),

    getBySlug: async (slug: string) => {
      const project = await repository.findBySlug(slug);
      return project && isPubliclyListed(project) ? project : null;
    },
  };
}

export type ProjectQueries = ReturnType<typeof createProjectQueries>;
