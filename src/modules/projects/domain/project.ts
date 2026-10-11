import type { CapabilitySlug } from "@/modules/services/domain/capability";
import type { ImageAsset, IsoDateString } from "@/shared/types/common";
import type { ProjectStatus, ProjectVisibility } from "@/modules/projects/domain/project-lifecycle";

/** An engineering initiative. Portfolio and ongoing work are the same entity in different lifecycle phases. */
export interface Project {
  id: string;
  slug: string;
  title: string;
  /** Short description for cards and listings. */
  summary: string;
  /** Full description. */
  description: string;
  /** Deliberately typed with the shared service taxonomy (see ARCHITECTURE.md). */
  category: CapabilitySlug;
  status: ProjectStatus;
  visibility: ProjectVisibility;
  technologies: string[];
  featured: boolean;
  images: ImageAsset[];
  thumbnail?: ImageAsset;
  repositoryUrl?: string;
  liveUrl?: string;
  startDate: IsoDateString;
  completionDate?: IsoDateString;
  problem?: string;
  solution?: string;
  outcome?: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
