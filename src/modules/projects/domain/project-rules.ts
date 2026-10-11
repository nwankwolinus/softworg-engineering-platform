import type { Project } from "@/modules/projects/domain/project";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_META,
  PROJECT_VISIBILITY,
  type ProjectPhase,
  type ProjectStatus,
} from "@/modules/projects/domain/project-lifecycle";

export function statusesInPhase(phase: ProjectPhase): ProjectStatus[] {
  return PROJECT_STATUSES.filter((status) => PROJECT_STATUS_META[status].phase === phase);
}

export function isPubliclyVisible(project: Pick<Project, "visibility">): boolean {
  return project.visibility === PROJECT_VISIBILITY.PUBLIC;
}

/**
 * A project may appear on the public site only if it is PUBLIC and not archived. Listings already exclude
 * archived projects (they belong to no public phase), so direct access by slug must exclude them too.
 */
export function isPubliclyListed(project: Pick<Project, "visibility" | "status">): boolean {
  return isPubliclyVisible(project) && PROJECT_STATUS_META[project.status].phase !== "archived";
}
