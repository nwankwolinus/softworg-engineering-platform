import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createInsightQueries } from "@/modules/insights/application/insight-queries";
import { FileInsightRepository } from "@/modules/insights/infrastructure/file-insight-repository";
import { insightStaticParams } from "@/app/insights/[slug]/static-params";

const roots: string[] = [];
async function directory() { const root = await mkdtemp(path.join(os.tmpdir(), "softworg-content-")); roots.push(root); return root; }
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });
const insight = { id: "insight-id", slug: "field-notes", title: "Field notes", summary: "Summary", body: "Body", tags: ["engineering"], status: "PUBLISHED", publishedAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-02T00:00:00.000Z" };

describe("FileInsightRepository", () => {
  it("reads valid insight entries while public queries exclude drafts", async () => {
    const root = await directory(); const repo = new FileInsightRepository(root);
    await writeFile(path.join(root, "field-notes.json"), JSON.stringify(insight));
    await writeFile(path.join(root, "private-notes.json"), JSON.stringify({ ...insight, slug: "private-notes", status: "DRAFT", publishedAt: undefined }));
    expect(await createInsightQueries(repo).listPublished()).toMatchObject([{ slug: "field-notes" }]);
    expect(await repo.findBySlug("../field-notes")).toBeNull();
    expect(await repo.findAll()).toEqual(await repo.findAll());
  });
  it("allows empty directories and reports invalid JSON and missing required publication dates", async () => {
    const root = await directory(); const repo = new FileInsightRepository(root);
    expect(await repo.findAll()).toEqual([]);
    const file = path.join(root, "field-notes.json");
    await writeFile(file, "{"); await expect(repo.findAll()).rejects.toThrow(/Invalid JSON.*field-notes\.json/);
    await writeFile(file, JSON.stringify({ ...insight, publishedAt: undefined })); await expect(repo.findAll()).rejects.toThrow(/publishedAt.*required/);
  });

  it("rejects filename/slug mismatches and invalid status values", async () => {
    const root = await directory(); const repo = new FileInsightRepository(root); const file = path.join(root, "field-notes.json");
    await writeFile(file, JSON.stringify({ ...insight, slug: "other-notes" }));
    await expect(repo.findAll()).rejects.toThrow(/field-notes\.json: slug must match filename stem 'field-notes'/);
    await writeFile(file, JSON.stringify({ ...insight, status: "SCHEDULED" }));
    await expect(repo.findAll()).rejects.toThrow(/field-notes\.json: status is not a valid insight status/);
  });

  it("generates route params only for published insights using filesystem content", async () => {
    const root = await directory(); const repo = new FileInsightRepository(root);
    await writeFile(path.join(root, "field-notes.json"), JSON.stringify(insight));
    await writeFile(path.join(root, "draft-notes.json"), JSON.stringify({ ...insight, slug: "draft-notes", status: "DRAFT", publishedAt: undefined }));
    expect(await insightStaticParams(createInsightQueries(repo))).toEqual([{ slug: "field-notes" }]);
  });

  it("cannot resolve a route slug to a JSON file outside its content directory", async () => {
    const root = await directory(); const content = path.join(root, "content"); await mkdir(content);
    await writeFile(path.join(root, "outside.json"), JSON.stringify({ ...insight, slug: "outside" }));
    const repo = new FileInsightRepository(content);
    expect(await repo.findBySlug("../outside")).toBeNull();
    expect(await repo.findBySlug("outside")).toBeNull();
  });
});
