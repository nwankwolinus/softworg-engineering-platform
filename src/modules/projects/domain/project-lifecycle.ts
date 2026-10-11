export const PROJECT_STATUS = {
  PLANNING: "PLANNING",
  IN_PROGRESS: "IN_PROGRESS",
  MVP: "MVP",
  COMPLETED: "COMPLETED",
  MAINTENANCE: "MAINTENANCE",
  ARCHIVED: "ARCHIVED",
} as const;

export type ProjectStatus = (typeof PROJECT_STATUS)[keyof typeof PROJECT_STATUS];

export const PROJECT_STATUSES: readonly ProjectStatus[] = Object.values(PROJECT_STATUS);

/** Presentation views are driven by phase, not by individual statuses. */
export type ProjectPhase = "ongoing" | "delivered" | "archived";

export const PROJECT_STATUS_META: Record<ProjectStatus, { label: string; phase: ProjectPhase }> = {
  PLANNING: { label: "Planning", phase: "ongoing" },
  IN_PROGRESS: { label: "In progress", phase: "ongoing" },
  MVP: { label: "MVP", phase: "ongoing" },
  COMPLETED: { label: "Completed", phase: "delivered" },
  MAINTENANCE: { label: "Maintenance", phase: "delivered" },
  ARCHIVED: { label: "Archived", phase: "archived" },
};

export const PROJECT_VISIBILITY = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  INTERNAL: "INTERNAL",
} as const;

export type ProjectVisibility = (typeof PROJECT_VISIBILITY)[keyof typeof PROJECT_VISIBILITY];
