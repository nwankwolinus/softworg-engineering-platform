import { PROJECT_STATUS_META, type ProjectPhase, type ProjectStatus } from "@/modules/projects/domain/project-lifecycle";
import { Badge, type BadgeTone } from "@/shared/ui/badge";

const phaseTones: Record<ProjectPhase, BadgeTone> = {
  ongoing: "primary",
  delivered: "success",
  archived: "neutral",
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  const { label, phase } = PROJECT_STATUS_META[status];
  return <Badge tone={phaseTones[phase]}>{label}</Badge>;
}
