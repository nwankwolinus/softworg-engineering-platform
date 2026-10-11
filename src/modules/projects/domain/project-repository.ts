import type { Project } from "@/modules/projects/domain/project";
import type { ProjectStatus, ProjectVisibility } from "@/modules/projects/domain/project-lifecycle";

/** Filters are part of the contract so a database/CMS can push them down to the query. */
export interface ProjectFilter {
  statuses?: readonly ProjectStatus[];
  visibilities?: readonly ProjectVisibility[];
}

export interface ProjectRepository {
  /** Returns matching projects, most recently started first. */
  find(filter?: ProjectFilter): Promise<Project[]>;
  findBySlug(slug: string): Promise<Project | null>;
}
