import { createProjectQueries } from "@/modules/projects/application/project-queries";
import { FileProjectRepository } from "@/modules/projects/infrastructure/file-project-repository";

/**
 * The one place the project data source is chosen. Swap the repository here.
 * No real projects are published yet, so the production source is intentionally empty.
 * Test fixtures live in the test files, never here.
 */
export const projectQueries = createProjectQueries(new FileProjectRepository());
