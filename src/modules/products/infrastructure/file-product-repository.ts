import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Product } from "@/modules/products/domain/product";
import { PRODUCT_STATUS } from "@/modules/products/domain/product-lifecycle";
import { PRODUCT_VISIBILITY } from "@/modules/products/domain/product-visibility";
import type { ProductRepository } from "@/modules/products/domain/product-repository";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;
type JsonRecord = Record<string, unknown>;
function fail(file: string, field: string, message: string): never { throw new Error(`Invalid content file ${file}: ${field} ${message}`); }
function object(value: unknown, file: string): JsonRecord { if (!value || typeof value !== "object" || Array.isArray(value)) fail(file, "record", "must be an object"); return value as JsonRecord; }
function text(value: unknown, field: string, file: string, optional = false): string | undefined {
  if (optional && value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) fail(file, field, "must be a non-empty string");
  return value;
}
function date(value: unknown, field: string, file: string): string {
  const result = text(value, field, file)!;
  const [year = 0, month = 0, day = 0] = result.slice(0, 10).split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthLength = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  const validCalendarDay = monthLength !== undefined && day >= 1 && day <= monthLength;
  if (!DATE_PATTERN.test(result) || !validCalendarDay || Number.isNaN(Date.parse(result))) fail(file, field, "must be a valid ISO date string");
  return result;
}
function image(value: unknown, file: string): NonNullable<Product["image"]> {
  const item = object(value, file);
  const src = text(item.src, "image.src", file)!; const alt = text(item.alt, "image.alt", file)!;
  for (const key of ["width", "height"] as const) if (item[key] !== undefined && (typeof item[key] !== "number" || !Number.isFinite(item[key]) || item[key] <= 0)) fail(file, `image.${key}`, "must be a positive number");
  return { src, alt, ...(item.width !== undefined ? { width: item.width as number } : {}), ...(item.height !== undefined ? { height: item.height as number } : {}) };
}
function parse(value: unknown, file: string, stem: string): Product {
  const item = object(value, file); const slug = text(item.slug, "slug", file)!;
  if (!SLUG_PATTERN.test(slug)) fail(file, "slug", "must contain lowercase letters, numbers, and single hyphens");
  if (slug !== stem) fail(file, "slug", `must match filename stem '${stem}'`);
  const status = text(item.status, "status", file)!; if (!Object.values(PRODUCT_STATUS).includes(status as Product["status"])) fail(file, "status", "is not a valid product status");
  const visibility = text(item.visibility, "visibility", file)!; if (!Object.values(PRODUCT_VISIBILITY).includes(visibility as Product["visibility"])) fail(file, "visibility", "is not a valid product visibility");
  if (!Array.isArray(item.features) || item.features.some((v) => typeof v !== "string")) fail(file, "features", "must be an array of strings");
  const optionalImage = item.image === undefined ? undefined : image(item.image, file);
  const url = text(item.url, "url", file, true); const originProjectId = text(item.originProjectId, "originProjectId", file, true);
  if (item.featured !== true && item.featured !== false) fail(file, "featured", "must be a boolean");
  return { id: text(item.id, "id", file)!, slug, name: text(item.name, "name", file)!, tagline: text(item.tagline, "tagline", file)!,
    description: text(item.description, "description", file)!, status: status as Product["status"], visibility: visibility as Product["visibility"],
    featured: item.featured, features: item.features as string[], ...(optionalImage ? { image: optionalImage } : {}), ...(url ? { url } : {}),
    ...(originProjectId ? { originProjectId } : {}), createdAt: date(item.createdAt, "createdAt", file), updatedAt: date(item.updatedAt, "updatedAt", file) };
}

export class FileProductRepository implements ProductRepository {
  constructor(private readonly directory = path.join(process.cwd(), "content", "products")) {}
  private async readAll(): Promise<Product[]> {
    let names: string[];
    try { names = await readdir(this.directory); } catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw new Error(`Unable to read content directory ${this.directory}`); }
    return Promise.all(names.filter((name) => name.endsWith(".json")).sort().map(async (name) => {
      const file = path.join(this.directory, name); const stem = name.slice(0, -5);
      if (!SLUG_PATTERN.test(stem)) fail(file, "filename", "must use a lowercase slug and .json extension");
      let raw: string; try { raw = await readFile(file, "utf8"); } catch { throw new Error(`Unable to read content file ${file}`); }
      let json: unknown; try { json = JSON.parse(raw); } catch { throw new Error(`Invalid JSON in content file ${file}`); }
      return parse(json, file, stem);
    }));
  }
  findAll(): Promise<Product[]> { return this.readAll(); }
  async findBySlug(slug: string): Promise<Product | null> { if (!SLUG_PATTERN.test(slug)) return null; return (await this.readAll()).find((item) => item.slug === slug) ?? null; }
}
