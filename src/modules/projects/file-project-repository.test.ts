import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { FileProjectRepository } from "@/modules/projects/infrastructure/file-project-repository";
import { createProjectQueries } from "@/modules/projects/application/project-queries";
import { projectStaticParams } from "@/app/projects/[slug]/static-params";

const roots: string[] = [];
async function directory() { const root = await mkdtemp(path.join(os.tmpdir(), "softworg-content-")); roots.push(root); return root; }
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });
const project = { id: "authored-id", slug: "plant-dashboard", title: "Plant dashboard", summary: "Summary", description: "Description", category: "software-engineering", status: "COMPLETED", visibility: "PUBLIC", technologies: ["TypeScript"], featured: false, images: [], startDate: "2024-01-01", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-02T00:00:00.000Z" };

describe("FileProjectRepository", () => {
  it("returns empty for an empty content directory and honors repository filters", async () => {
    const root = await directory(); const repo = new FileProjectRepository(root);
    expect(await repo.find()).toEqual([]);
    await writeFile(path.join(root, "plant-dashboard.json"), JSON.stringify(project));
    expect((await repo.find({ statuses: ["COMPLETED"], visibilities: ["PUBLIC"] })).map((p) => p.id)).toEqual(["authored-id"]);
    expect(await createProjectQueries(repo).listPublic()).toMatchObject([{ slug: "plant-dashboard" }]);
  });
  it("rejects malformed JSON, missing fields, and filename mismatches with file context", async () => {
    const root = await directory(); const repo = new FileProjectRepository(root); const file = path.join(root, "plant-dashboard.json");
    await writeFile(file, "{"); await expect(repo.find()).rejects.toThrow(/Invalid JSON.*plant-dashboard\.json/);
    await writeFile(file, JSON.stringify({ ...project, title: undefined })); await expect(repo.find()).rejects.toThrow(/plant-dashboard\.json: title/);
    await writeFile(file, JSON.stringify({ ...project, slug: "different-slug" })); await expect(repo.find()).rejects.toThrow(/plant-dashboard\.json: slug.*match filename/);
  });
  it("preserves deterministic results, excludes private and archived entries publicly, and rejects unsafe slugs", async () => {
    const root = await directory(); const repo = new FileProjectRepository(root);
    await mkdir(root, { recursive: true });
    await writeFile(path.join(root, "plant-dashboard.json"), JSON.stringify(project));
    await writeFile(path.join(root, "private-work.json"), JSON.stringify({ ...project, slug: "private-work", visibility: "PRIVATE" }));
    await writeFile(path.join(root, "archived-work.json"), JSON.stringify({ ...project, slug: "archived-work", status: "ARCHIVED" }));
    expect(await repo.find()).toEqual(await repo.find());
    const queries = createProjectQueries(repo);
    expect((await queries.listPublic()).map((item) => item.slug)).toEqual(["plant-dashboard"]);
    expect(await repo.findBySlug("../../outside")).toBeNull();
  });

  it("rejects invalid status, visibility, and category enum values", async () => {
    const root = await directory(); const repo = new FileProjectRepository(root); const file = path.join(root, "plant-dashboard.json");
    await writeFile(file, JSON.stringify({ ...project, status: "UNKNOWN" }));
    await expect(repo.find()).rejects.toThrow(/plant-dashboard\.json: status is not a valid project status/);
    await writeFile(file, JSON.stringify({ ...project, visibility: "WORLD" }));
    await expect(repo.find()).rejects.toThrow(/plant-dashboard\.json: visibility is not a valid project visibility/);
    await writeFile(file, JSON.stringify({ ...project, category: "other" }));
    await expect(repo.find()).rejects.toThrow(/plant-dashboard\.json: category is not a valid capability slug/);
  });

  it("generates route params only for publicly listed projects from filesystem content", async () => {
    const root = await directory(); const repo = new FileProjectRepository(root);
    for (const entry of [
      project,
      { ...project, slug: "ongoing-work", status: "IN_PROGRESS" },
      { ...project, slug: "private-work", visibility: "PRIVATE" },
      { ...project, slug: "internal-work", visibility: "INTERNAL" },
      { ...project, slug: "archived-work", status: "ARCHIVED" },
    ]) await writeFile(path.join(root, `${entry.slug}.json`), JSON.stringify(entry));
    expect(await projectStaticParams(createProjectQueries(repo))).toEqual([
      { slug: "ongoing-work" },
      { slug: "plant-dashboard" },
    ]);
  });

  it("cannot resolve a route slug to a JSON file outside its content directory", async () => {
    const root = await directory(); const content = path.join(root, "content"); await mkdir(content);
    await writeFile(path.join(root, "outside.json"), JSON.stringify({ ...project, slug: "outside" }));
    const repo = new FileProjectRepository(content);
    expect(await repo.findBySlug("../outside")).toBeNull();
    expect(await repo.findBySlug("outside")).toBeNull();
  });
});
