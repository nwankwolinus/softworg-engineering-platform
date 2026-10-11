import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { Insight } from "@/modules/insights/domain/insight";
import { INSIGHT_STATUS } from "@/modules/insights/domain/insight";
import type { InsightRepository } from "@/modules/insights/domain/insight-repository";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;
type JsonRecord = Record<string, unknown>;
function fail(file: string, field: string, message: string): never { throw new Error(`Invalid content file ${file}: ${field} ${message}`); }
function object(value: unknown, file: string): JsonRecord { if (!value || typeof value !== "object" || Array.isArray(value)) fail(file, "record", "must be an object"); return value as JsonRecord; }
function text(value: unknown, field: string, file: string, optional = false): string | undefined {
  if (optional && value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) fail(file, field, "must be a non-empty string"); return value;
}
function date(value: unknown, field: string, file: string): string {
  const result = text(value, field, file)!; const [year = 0, month = 0, day = 0] = result.slice(0, 10).split("-").map(Number);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthLength = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
  const validCalendarDay = monthLength !== undefined && day >= 1 && day <= monthLength;
  if (!DATE_PATTERN.test(result) || !validCalendarDay || Number.isNaN(Date.parse(result))) fail(file, field, "must be a valid ISO date string"); return result;
}
function parse(value: unknown, file: string, stem: string): Insight {
  const item = object(value, file); const slug = text(item.slug, "slug", file)!;
  if (!SLUG_PATTERN.test(slug)) fail(file, "slug", "must contain lowercase letters, numbers, and single hyphens");
  if (slug !== stem) fail(file, "slug", `must match filename stem '${stem}'`);
  const status = text(item.status, "status", file)!; if (!Object.values(INSIGHT_STATUS).includes(status as Insight["status"])) fail(file, "status", "is not a valid insight status");
  if (!Array.isArray(item.tags) || item.tags.some((tag) => typeof tag !== "string")) fail(file, "tags", "must be an array of strings");
  const publishedAt = item.publishedAt === undefined ? undefined : date(item.publishedAt, "publishedAt", file);
  const coverImage = item.coverImage === undefined ? undefined : (() => {
    const image = object(item.coverImage, file); const src = text(image.src, "coverImage.src", file)!; const alt = text(image.alt, "coverImage.alt", file)!;
    for (const key of ["width", "height"] as const) if (image[key] !== undefined && (typeof image[key] !== "number" || !Number.isFinite(image[key]) || image[key] <= 0)) fail(file, `coverImage.${key}`, "must be a positive number");
    return { src, alt, ...(image.width !== undefined ? { width: image.width as number } : {}), ...(image.height !== undefined ? { height: image.height as number } : {}) };
  })();
  if (status === INSIGHT_STATUS.PUBLISHED && !publishedAt) fail(file, "publishedAt", "is required for a published insight");
  return { id: text(item.id, "id", file)!, slug, title: text(item.title, "title", file)!, summary: text(item.summary, "summary", file)!,
    body: text(item.body, "body", file)!, tags: item.tags as string[], status: status as Insight["status"], ...(publishedAt ? { publishedAt } : {}),
    ...(coverImage ? { coverImage } : {}), updatedAt: date(item.updatedAt, "updatedAt", file) };
}

export class FileInsightRepository implements InsightRepository {
  constructor(private readonly directory = path.join(process.cwd(), "content", "insights")) {}
  private async readAll(): Promise<Insight[]> {
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
  findAll(): Promise<Insight[]> { return this.readAll(); }
  async findBySlug(slug: string): Promise<Insight | null> { if (!SLUG_PATTERN.test(slug)) return null; return (await this.readAll()).find((item) => item.slug === slug) ?? null; }
}
