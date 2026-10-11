import type { ProjectQueries } from "@/modules/projects/application/project-queries";

export async function projectStaticParams(queries: Pick<ProjectQueries, "listPublic">) {
  return (await queries.listPublic()).map((project) => ({ slug: project.slug }));
}
