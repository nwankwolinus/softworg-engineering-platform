import type { Insight } from "@/modules/insights/domain/insight";

export interface InsightRepository {
  findAll(): Promise<Insight[]>;
  findBySlug(slug: string): Promise<Insight | null>;
}
