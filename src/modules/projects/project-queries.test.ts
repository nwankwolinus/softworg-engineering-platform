import { describe, expect, it } from "vitest";
import { createProjectQueries } from "@/modules/projects/application/project-queries";
import type { Project } from "@/modules/projects/domain/project";
import { PROJECT_STATUS, PROJECT_VISIBILITY } from "@/modules/projects/domain/project-lifecycle";
import { InMemoryProjectRepository } from "@/modules/projects/infrastructure/in-memory-project-repository";
import { projectQueries } from "@/modules/projects/composition";

/** Test fixtures only. Production data lives behind composition.ts and is empty. */
function buildProject(overrides: Partial<Project>): Project {
  return {
    id: "id",
    slug: "slug",
    title: "Fixture",
    summary: "Fixture summary",
    description: "Fixture description",
    category: "software-engineering",
    status: PROJECT_STATUS.COMPLETED,
    visibility: PROJECT_VISIBILITY.PUBLIC,
    technologies: [],
    featured: false,
    images: [],
    startDate: "2024-01-01",
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("createProjectQueries", () => {
  const queries = createProjectQueries(
    new InMemoryProjectRepository([
      buildProject({ id: "1", slug: "delivered" }),
      buildProject({ id: "2", slug: "ongoing", status: PROJECT_STATUS.IN_PROGRESS }),
      buildProject({ id: "3", slug: "private", visibility: PROJECT_VISIBILITY.PRIVATE }),
      buildProject({ id: "4", slug: "internal", status: PROJECT_STATUS.MVP, visibility: PROJECT_VISIBILITY.INTERNAL }),
    ]),
  );

  it("lists only public delivered projects in the portfolio", async () => {
    expect((await queries.listPortfolio()).map((p) => p.slug)).toEqual(["delivered"]);
  });

  it("lists only public in-flight projects as ongoing", async () => {
    expect((await queries.listOngoing()).map((p) => p.slug)).toEqual(["ongoing"]);
  });

  it("never exposes non-public projects by slug", async () => {
    expect(await queries.getBySlug("private")).toBeNull();
    expect(await queries.getBySlug("internal")).toBeNull();
    expect((await queries.getBySlug("delivered"))?.id).toBe("1");
  });
});

describe("production project source", () => {
  it("publishes no projects until real content is added", async () => {
    expect(await projectQueries.listPortfolio()).toEqual([]);
    expect(await projectQueries.listOngoing()).toEqual([]);
  });
});

describe("archived and related projects", () => {
  const queries = createProjectQueries(
    new InMemoryProjectRepository([
      buildProject({ id: "a", slug: "archived-public", status: PROJECT_STATUS.ARCHIVED }),
      buildProject({ id: "b", slug: "main", category: "ai-engineering" }),
      buildProject({ id: "c", slug: "same-category", category: "ai-engineering" }),
      buildProject({ id: "d", slug: "other-category", category: "digital-automation" }),
      buildProject({ id: "e", slug: "same-category-private", category: "ai-engineering", visibility: PROJECT_VISIBILITY.PRIVATE }),
    ]),
  );

  it("does not serve an archived project by slug, matching its absence from every listing", async () => {
    expect(await queries.getBySlug("archived-public")).toBeNull();
    expect((await queries.listPublic()).map((p) => p.slug)).not.toContain("archived-public");
  });

  it("returns an unknown slug as null", async () => {
    expect(await queries.getBySlug("does-not-exist")).toBeNull();
  });

  it("relates only other public projects in the same category", async () => {
    const main = await queries.getBySlug("main");
    expect((await queries.listRelated(main!)).map((p) => p.slug)).toEqual(["same-category"]);
  });

  it("respects the related-projects limit", async () => {
    expect(await queries.listRelated({ slug: "x", category: "ai-engineering" }, 1)).toHaveLength(1);
  });
});
