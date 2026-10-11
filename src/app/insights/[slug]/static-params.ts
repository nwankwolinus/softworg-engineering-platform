import type { InsightQueries } from "@/modules/insights/application/insight-queries";

export async function insightStaticParams(queries: Pick<InsightQueries, "listPublished">) {
  return (await queries.listPublished()).map((insight) => ({ slug: insight.slug }));
}
