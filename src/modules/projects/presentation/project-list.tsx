import type { Project } from "@/modules/projects/domain/project";
import { ProjectCard } from "@/modules/projects/presentation/project-card";
import { CardGrid } from "@/shared/ui/card";
import { EmptyState } from "@/shared/ui/empty-state";

interface ProjectListProps {
  projects: readonly Project[];
  emptyTitle: string;
}

export function ProjectList({ projects, emptyTitle }: ProjectListProps) {
  if (projects.length === 0) return <EmptyState title={emptyTitle} />;

  return (
    <CardGrid>
      {projects.map((project) => (
        <li key={project.id}>
          <ProjectCard project={project} />
        </li>
      ))}
    </CardGrid>
  );
}
