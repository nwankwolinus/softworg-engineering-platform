import type { Project } from "@/modules/projects/domain/project";
import { ProjectStatusBadge } from "@/modules/projects/presentation/project-status-badge";
import { routes } from "@/shared/constants/routes";
import { Card } from "@/shared/ui/card";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Card
      title={project.title}
      description={project.summary}
      href={routes.project(project.slug)}
      badge={<ProjectStatusBadge status={project.status} />}
    />
  );
}
