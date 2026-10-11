import { describe, expect, it } from "vitest";
import { createInsightQueries } from "@/modules/insights/application/insight-queries";
import { insightQueries } from "@/modules/insights/composition";
import { INSIGHT_STATUS, type Insight } from "@/modules/insights/domain/insight";
import { InMemoryInsightRepository } from "@/modules/insights/infrastructure/in-memory-insight-repository";

/** Test fixtures only. Production data lives behind composition.ts and is empty. */
function buildInsight(overrides: Partial<Insight>): Insight {
  return {
    id: "id",
    slug: "slug",
    title: "Fixture",
    summary: "Fixture summary",
    body: "Fixture body",
    tags: [],
    status: INSIGHT_STATUS.PUBLISHED,
    publishedAt: "2025-01-01T00:00:00.000Z",
    updatedAt: "2025-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const queriesFor = (insights: Insight[]) => createInsightQueries(new InMemoryInsightRepository(insights));

describe("insightQueries", () => {
  it("is empty in production composition, so the page shows its empty state", async () => {
    expect(await insightQueries.listPublished()).toEqual([]);
  });

  it("lists only published insights", async () => {
    const queries = queriesFor([
      buildInsight({ id: "a", slug: "a" }),
      buildInsight({ id: "draft", slug: "draft", status: INSIGHT_STATUS.DRAFT }),
      buildInsight({ id: "no-date", slug: "no-date", publishedAt: undefined }),
    ]);
    expect((await queries.listPublished()).map((insight) => insight.id)).toEqual(["a"]);
  });

  it("orders insights newest first", async () => {
    const queries = queriesFor([
      buildInsight({ id: "old", slug: "old", publishedAt: "2024-01-01T00:00:00.000Z" }),
      buildInsight({ id: "new", slug: "new", publishedAt: "2025-06-01T00:00:00.000Z" }),
    ]);
    expect((await queries.listPublished()).map((insight) => insight.id)).toEqual(["new", "old"]);
  });

  it("does not return an unpublished insight by slug", async () => {
    const queries = queriesFor([buildInsight({ slug: "draft", status: INSIGHT_STATUS.DRAFT })]);
    expect(await queries.getBySlug("draft")).toBeNull();
  });
});
