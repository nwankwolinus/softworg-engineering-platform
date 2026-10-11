import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createRequire } from "node:module";
import { afterEach, describe, expect, it } from "vitest";
import { FileProjectRepository } from "@/modules/projects/infrastructure/file-project-repository";
import { FileProductRepository } from "@/modules/products/infrastructure/file-product-repository";
import { FileInsightRepository } from "@/modules/insights/infrastructure/file-insight-repository";

const require = createRequire(import.meta.url);
const fields = require(path.resolve(process.cwd(), "public/admin/optional-fields.js")) as {
  optionalString(value: unknown): string | undefined;
  optionalNumber(value: unknown): number | undefined;
  optionalDateTime(value: string): string | undefined;
  optionalImage(value: unknown): Record<string, unknown> | undefined;
};
const roots: string[] = [];
async function tempDirectory() {
  const root = await mkdtemp(path.join(os.tmpdir(), "softworg-cms-serialization-"));
  roots.push(root);
  return root;
}
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });

const project = { id: "project-id", slug: "factory", title: "Factory", summary: "Summary", description: "Description", category: "software-engineering", status: "COMPLETED", visibility: "PUBLIC", technologies: [], featured: false, images: [], startDate: "2025-01-01T00:00:00.000Z", createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" };
const product = { id: "product-id", slug: "field-kit", name: "Field kit", tagline: "Tagline", description: "Description", status: "LIVE", visibility: "PUBLIC", featured: false, features: [], createdAt: "2025-01-01T00:00:00.000Z", updatedAt: "2025-01-01T00:00:00.000Z" };
const insight = { id: "insight-id", slug: "field-notes", title: "Field notes", summary: "Summary", body: "Body", tags: [], status: "DRAFT", updatedAt: "2025-01-01T00:00:00.000Z" };

describe("Decap optional field serialization compatibility", () => {
  it("omits cleared optional project values and repository-accepts the saved fixture", async () => {
    const root = await tempDirectory();
    const asset = fields.optionalImage({ src: "", alt: "", width: "" });
    const value = { ...project, repositoryUrl: fields.optionalString("  "), completionDate: fields.optionalDateTime(""), thumbnail: asset };
    await writeFile(path.join(root, "factory.json"), JSON.stringify(value));
    expect(await new FileProjectRepository(root).find()).toEqual([{ ...project }]);
    expect(fields.optionalImage({ src: "/factory.png", alt: "Factory", width: "640" })).toEqual({ src: "/factory.png", alt: "Factory", width: 640 });
  });

  it("omits cleared optional product values and validates an authored image fixture", async () => {
    const root = await tempDirectory();
    const value = { ...product, url: fields.optionalString(""), image: fields.optionalImage({}) };
    await writeFile(path.join(root, "field-kit.json"), JSON.stringify(value));
    expect(await new FileProductRepository(root).findAll()).toEqual([{ ...product }]);
    const image = fields.optionalImage({ src: "/kit.png", alt: "Field kit", height: "480" });
    await writeFile(path.join(root, "field-kit.json"), JSON.stringify({ ...product, image }));
    expect((await new FileProductRepository(root).findAll())[0]?.image).toEqual(image);
  });

  it("omits untouched optional insight widgets and accepts the published-date representation", async () => {
    const root = await tempDirectory();
    await writeFile(path.join(root, "field-notes.json"), JSON.stringify({ ...insight, publishedAt: fields.optionalDateTime(""), coverImage: fields.optionalImage({}) }));
    expect(await new FileInsightRepository(root).findAll()).toEqual([{ ...insight }]);
    const publishedAt = fields.optionalDateTime("2025-02-03T12:30");
    await writeFile(path.join(root, "field-notes.json"), JSON.stringify({ ...insight, status: "PUBLISHED", publishedAt }));
    expect((await new FileInsightRepository(root).findAll())[0]?.publishedAt).toBe(publishedAt);
  });

  it("shows the previous blank string and empty object values fail repository validation", async () => {
    const root = await tempDirectory();
    await writeFile(path.join(root, "factory.json"), JSON.stringify({ ...project, repositoryUrl: "" }));
    await expect(new FileProjectRepository(root).find()).rejects.toThrow(/repositoryUrl must be a non-empty string/);
    await writeFile(path.join(root, "factory.json"), JSON.stringify({ ...project, thumbnail: {} }));
    await expect(new FileProjectRepository(root).find()).rejects.toThrow(/thumbnail.src must be a non-empty string/);
  });
});
