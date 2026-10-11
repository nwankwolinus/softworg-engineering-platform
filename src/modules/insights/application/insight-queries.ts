import { isPublished, type PublishedInsight } from "@/modules/insights/domain/insight";
import type { InsightRepository } from "@/modules/insights/domain/insight-repository";

export function createInsightQueries(repository: InsightRepository) {
  return {
    /** Published insights, newest first. */
    listPublished: async (): Promise<PublishedInsight[]> =>
      (await repository.findAll())
        .filter(isPublished)
        .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),

    getBySlug: async (slug: string) => {
      const insight = await repository.findBySlug(slug);
      return insight && isPublished(insight) ? insight : null;
    },
  };
}

export type InsightQueries = ReturnType<typeof createInsightQueries>;
