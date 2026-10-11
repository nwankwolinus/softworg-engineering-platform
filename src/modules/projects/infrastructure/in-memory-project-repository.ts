import type { Project } from "@/modules/projects/domain/project";
import type { ProjectFilter, ProjectRepository } from "@/modules/projects/domain/project-repository";

function matches(project: Project, filter: ProjectFilter): boolean {
  return (
    (!filter.statuses || filter.statuses.includes(project.status)) &&
    (!filter.visibilities || filter.visibilities.includes(project.visibility))
  );
}

export class InMemoryProjectRepository implements ProjectRepository {
  constructor(private readonly projects: readonly Project[]) {}

  async find(filter: ProjectFilter = {}): Promise<Project[]> {
    return this.projects
      .filter((project) => matches(project, filter))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  async findBySlug(slug: string): Promise<Project | null> {
    return this.projects.find((project) => project.slug === slug) ?? null;
  }
}
