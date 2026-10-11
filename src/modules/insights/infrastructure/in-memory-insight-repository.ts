import type { Insight } from "@/modules/insights/domain/insight";
import type { InsightRepository } from "@/modules/insights/domain/insight-repository";

export class InMemoryInsightRepository implements InsightRepository {
  constructor(private readonly insights: readonly Insight[]) {}

  async findAll(): Promise<Insight[]> {
    return [...this.insights];
  }

  async findBySlug(slug: string): Promise<Insight | null> {
    return this.insights.find((insight) => insight.slug === slug) ?? null;
  }
}
