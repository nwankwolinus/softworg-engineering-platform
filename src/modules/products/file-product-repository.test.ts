import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { createProductQueries } from "@/modules/products/application/product-queries";
import { FileProductRepository } from "@/modules/products/infrastructure/file-product-repository";
import { productStaticParams } from "@/app/products/[slug]/static-params";

const roots: string[] = [];
async function directory() { const root = await mkdtemp(path.join(os.tmpdir(), "softworg-content-")); roots.push(root); return root; }
afterEach(async () => { await Promise.all(roots.splice(0).map((root) => rm(root, { recursive: true, force: true }))); });
const product = { id: "product-id", slug: "field-kit", name: "Field kit", tagline: "Tagline", description: "Description", status: "LIVE", visibility: "PUBLIC", featured: true, features: ["Offline mode"], createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-02T00:00:00.000Z" };

describe("FileProductRepository", () => {
  it("reads valid entries and applies public visibility rules", async () => {
    const root = await directory(); const repo = new FileProductRepository(root);
    await writeFile(path.join(root, "field-kit.json"), JSON.stringify(product));
    await writeFile(path.join(root, "concept-kit.json"), JSON.stringify({ ...product, slug: "concept-kit", status: "CONCEPT" }));
    await writeFile(path.join(root, "draft-kit.json"), JSON.stringify({ ...product, slug: "draft-kit", visibility: "INTERNAL" }));
    expect(await createProductQueries(repo).listPublic()).toMatchObject([{ slug: "field-kit" }]);
    expect(await repo.findBySlug("../field-kit")).toBeNull();
    expect(await repo.findAll()).toEqual(await repo.findAll());
  });
  it("rejects malformed JSON and filename/slug mismatches", async () => {
    const root = await directory(); const repo = new FileProductRepository(root); const file = path.join(root, "field-kit.json");
    await writeFile(file, "nope"); await expect(repo.findAll()).rejects.toThrow(/Invalid JSON.*field-kit\.json/);
    await writeFile(file, JSON.stringify({ ...product, slug: "another" })); await expect(repo.findAll()).rejects.toThrow(/slug.*match filename/);
  });

  it("reports missing required fields and invalid status or visibility values", async () => {
    const root = await directory(); const repo = new FileProductRepository(root); const file = path.join(root, "field-kit.json");
    await writeFile(file, JSON.stringify({ ...product, name: undefined }));
    await expect(repo.findAll()).rejects.toThrow(/field-kit\.json: name must be a non-empty string/);
    await writeFile(file, JSON.stringify({ ...product, status: "UNKNOWN" }));
    await expect(repo.findAll()).rejects.toThrow(/field-kit\.json: status is not a valid product status/);
    await writeFile(file, JSON.stringify({ ...product, visibility: "WORLD" }));
    await expect(repo.findAll()).rejects.toThrow(/field-kit\.json: visibility is not a valid product visibility/);
  });

  it("generates route params only for public eligible products from filesystem content", async () => {
    const root = await directory(); const repo = new FileProductRepository(root);
    for (const entry of [
      product,
      { ...product, slug: "private-kit", visibility: "PRIVATE" },
      { ...product, slug: "internal-kit", visibility: "INTERNAL" },
      { ...product, slug: "concept-kit", status: "CONCEPT" },
      { ...product, slug: "retired-kit", status: "RETIRED" },
    ]) await writeFile(path.join(root, `${entry.slug}.json`), JSON.stringify(entry));
    expect(await productStaticParams(createProductQueries(repo))).toEqual([{ slug: "field-kit" }]);
  });

  it("cannot resolve a route slug to a JSON file outside its content directory", async () => {
    const root = await directory(); const content = path.join(root, "content"); await mkdir(content);
    await writeFile(path.join(root, "outside.json"), JSON.stringify({ ...product, slug: "outside" }));
    const repo = new FileProductRepository(content);
    expect(await repo.findBySlug("../outside")).toBeNull();
    expect(await repo.findBySlug("outside")).toBeNull();
  });
});
