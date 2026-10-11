import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { CapabilitySlug } from "@/modules/services/domain/capability";
import { CAPABILITY_SLUGS } from "@/modules/services/domain/capability";
import type { Project } from "@/modules/projects/domain/project";
import { PROJECT_STATUSES, PROJECT_VISIBILITY } from "@/modules/projects/domain/project-lifecycle";
import type { ProjectFilter, ProjectRepository } from "@/modules/projects/domain/project-repository";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/;
type JsonRecord = Record<string, unknown>;

function fail(filePath: string, field: string, issue: string): never {
  throw new Error(`Invalid content file ${filePath}: ${field} ${issue}`);
}

function record(value: unknown, filePath: string): JsonRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(filePath, "record", "must be an object");
  return value as JsonRecord;
}

function string(value: unknown, field: string, filePath: string, optional = false): string | undefined {
  if (optional && value === undefined) return undefined;
  if (typeof value !== "string" || value.trim() === "") fail(filePath, field, "must be a non-empty string");
  return value;
}

function date(value: unknown, field: string, filePath: string, optional = false): string | undefined {
  const result = string(value, field, filePath, optional);
  const day = result?.slice(0, 10);
  const validCalendarDay = day === undefined || (() => {
    const [year = 0, month = 0, dateOfMonth = 0] = day.split("-").map(Number);
    const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
    const monthLength = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    return monthLength !== undefined && dateOfMonth >= 1 && dateOfMonth <= monthLength;
  })();
  if (result !== undefined && (!DATE_PATTERN.test(result) || !validCalendarDay || Number.isNaN(Date.parse(result)))) {
    fail(filePath, field, "must be a valid ISO date string");
  }
  return result;
}

function stringArray(value: unknown, field: string, filePath: string): string[] {
  if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) fail(filePath, field, "must be an array of strings");
  return value as string[];
}

function image(value: unknown, field: string, filePath: string, optional = false) {
  if (optional && value === undefined) return undefined;
  const item = record(value, filePath);
  const src = string(item.src, `${field}.src`, filePath)!;
  const alt = string(item.alt, `${field}.alt`, filePath)!;
  for (const dimension of ["width", "height"] as const) {
    if (item[dimension] !== undefined && (typeof item[dimension] !== "number" || !Number.isFinite(item[dimension]) || item[dimension] <= 0)) {
      fail(filePath, `${field}.${dimension}`, "must be a positive number");
    }
  }
  return { src, alt, ...(item.width !== undefined ? { width: item.width as number } : {}), ...(item.height !== undefined ? { height: item.height as number } : {}) };
}

function parseProject(value: unknown, filePath: string, filenameSlug: string): Project {
  const item = record(value, filePath);
  const slug = string(item.slug, "slug", filePath)!;
  if (!SLUG_PATTERN.test(slug)) fail(filePath, "slug", "must contain lowercase letters, numbers, and single hyphens");
  if (slug !== filenameSlug) fail(filePath, "slug", `must match filename stem '${filenameSlug}'`);
  const status = string(item.status, "status", filePath)!;
  if (!(PROJECT_STATUSES as readonly string[]).includes(status)) fail(filePath, "status", "is not a valid project status");
  const visibility = string(item.visibility, "visibility", filePath)!;
  if (!Object.values(PROJECT_VISIBILITY).includes(visibility as Project["visibility"])) fail(filePath, "visibility", "is not a valid project visibility");
  const category = string(item.category, "category", filePath)!;
  if (!(CAPABILITY_SLUGS as readonly string[]).includes(category)) fail(filePath, "category", "is not a valid capability slug");
  const images = Array.isArray(item.images) ? item.images.map((entry, index) => image(entry, `images[${index}]`, filePath)!) : fail(filePath, "images", "must be an array");
  const thumbnail = image(item.thumbnail, "thumbnail", filePath, true);
  const repositoryUrl = string(item.repositoryUrl, "repositoryUrl", filePath, true);
  const liveUrl = string(item.liveUrl, "liveUrl", filePath, true);
  const completionDate = date(item.completionDate, "completionDate", filePath, true);
  const problem = string(item.problem, "problem", filePath, true);
  const solution = string(item.solution, "solution", filePath, true);
  const outcome = string(item.outcome, "outcome", filePath, true);
  return {
    id: string(item.id, "id", filePath)!, slug, title: string(item.title, "title", filePath)!,
    summary: string(item.summary, "summary", filePath)!, description: string(item.description, "description", filePath)!,
    category: category as CapabilitySlug, status: status as Project["status"], visibility: visibility as Project["visibility"],
    technologies: stringArray(item.technologies, "technologies", filePath),
    featured: typeof item.featured === "boolean" ? item.featured : fail(filePath, "featured", "must be a boolean"),
    images, ...(thumbnail ? { thumbnail } : {}), ...(repositoryUrl ? { repositoryUrl } : {}), ...(liveUrl ? { liveUrl } : {}),
    startDate: date(item.startDate, "startDate", filePath)!, ...(completionDate ? { completionDate } : {}),
    ...(problem ? { problem } : {}), ...(solution ? { solution } : {}), ...(outcome ? { outcome } : {}),
    createdAt: date(item.createdAt, "createdAt", filePath)!, updatedAt: date(item.updatedAt, "updatedAt", filePath)!,
  };
}

export class FileProjectRepository implements ProjectRepository {
  constructor(private readonly directory = path.join(process.cwd(), "content", "projects")) {}

  private async readAll(): Promise<Project[]> {
    let names: string[];
    try {
      names = await readdir(this.directory);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw new Error(`Unable to read content directory ${this.directory}`);
    }
    const files = names.filter((name) => name.endsWith(".json")).sort();
    return Promise.all(files.map(async (name) => {
      const filePath = path.join(this.directory, name);
      const filenameSlug = name.slice(0, -5);
      if (!SLUG_PATTERN.test(filenameSlug)) fail(filePath, "filename", "must use a lowercase slug and .json extension");
      let text: string;
      try { text = await readFile(filePath, "utf8"); }
      catch { throw new Error(`Unable to read content file ${filePath}`); }
      let json: unknown;
      try { json = JSON.parse(text); }
      catch { throw new Error(`Invalid JSON in content file ${filePath}`); }
      return parseProject(json, filePath, filenameSlug);
    }));
  }

  async find(filter: ProjectFilter = {}): Promise<Project[]> {
    return (await this.readAll())
      .filter((project) => (!filter.statuses || filter.statuses.includes(project.status)) && (!filter.visibilities || filter.visibilities.includes(project.visibility)))
      .sort((a, b) => b.startDate.localeCompare(a.startDate));
  }

  async findBySlug(slug: string): Promise<Project | null> {
    if (!SLUG_PATTERN.test(slug)) return null;
    return (await this.readAll()).find((project) => project.slug === slug) ?? null;
  }
}
