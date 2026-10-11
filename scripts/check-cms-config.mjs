import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { load } = require("js-yaml");
const configPath = new URL("../public/admin/config.yml", import.meta.url);
const htmlPath = new URL("../public/admin/index.html", import.meta.url);
const config = load(await readFile(configPath, "utf8"));
const html = await readFile(htmlPath, "utf8");
const optionalWidgetsPath = new URL("../public/admin/optional-fields.js", import.meta.url);
const optionalWidgets = await readFile(optionalWidgetsPath, "utf8");

assert.equal(config.backend.name, "turbo-github");
const siteId = config.backend.turbo_site_id;
const siteIdPlaceholder = "REPLACE_WITH_TURBO_SITE_ID";
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
assert.ok(siteId === siteIdPlaceholder || (typeof siteId === "string" && uuidPattern.test(siteId)), "Turbo site ID must remain the explicit placeholder or be a UUID copied from the provisioned Turbo site");
assert.equal("repo" in config.backend, false, "Turbo dashboard owns repository identity");
assert.equal("branch" in config.backend, false, "no production branch is verified in this checkout");
assert.equal(config.publish_mode, "editorial_workflow");
assert.match(html, /decap-cms@3\.17\.0-beta\.0\/dist\/decap-cms\.js/);
assert.match(html, /src=["']\.\/optional-fields\.js["']/, "admin widget script must resolve relative to /admin/");
for (const name of ["optional-string", "optional-text", "optional-number", "optional-datetime", "optional-image-asset"]) {
  assert.match(optionalWidgets, new RegExp(`registerWidget\\([\\"']${name}[\\"']`), `${name} widget must be registered`);
}

async function interfaceFields(relativePath, interfaceName) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const block = source.match(new RegExp(`export interface ${interfaceName} \\{([\\s\\S]*?)\\n\\}`))?.[1];
  assert.ok(block, `Could not locate ${interfaceName} in ${relativePath}`);
  return [...block.matchAll(/^\s*(\w+)(\?)?:\s*([^;]+);/gm)].map(([, name, optional, type]) => ({ name, optional: Boolean(optional), type: type.trim() }));
}
async function constantValues(relativePath, constantName) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const block = source.match(new RegExp(`export const ${constantName} = \\{([\\s\\S]*?)\\n\\} as const`))?.[1];
  assert.ok(block, `Could not locate ${constantName} in ${relativePath}`);
  return [...block.matchAll(/^\s*\w+:\s*[\"']([^\"']+)[\"'],?/gm)].map(([, value]) => value);
}
async function arrayValues(relativePath, constantName) {
  const source = await readFile(new URL(`../${relativePath}`, import.meta.url), "utf8");
  const block = source.match(new RegExp(`export const ${constantName} = \\[([\\s\\S]*?)\\] as const`))?.[1];
  assert.ok(block, `Could not locate ${constantName} in ${relativePath}`);
  return [...block.matchAll(/[\"']([^\"']+)[\"']/g)].map(([, value]) => value);
}
const domainSchemas = {
  projects: await interfaceFields("src/modules/projects/domain/project.ts", "Project"),
  products: await interfaceFields("src/modules/products/domain/product.ts", "Product"),
  insights: await interfaceFields("src/modules/insights/domain/insight.ts", "Insight"),
};
const imageSchema = await interfaceFields("src/shared/types/common.ts", "ImageAsset");

const expected = {
  projects: {
    folder: "content/projects",
    widgets: { id: "string", slug: "string", title: "string", summary: "text", description: "text", category: "select", status: "select", visibility: "select", technologies: "list", featured: "boolean", images: "list", thumbnail: "optional-image-asset", repositoryUrl: "optional-string", liveUrl: "optional-string", startDate: "datetime", completionDate: "optional-datetime", problem: "optional-text", solution: "optional-text", outcome: "optional-text", createdAt: "datetime", updatedAt: "datetime" },
    statusSource: ["src/modules/projects/domain/project-lifecycle.ts", "PROJECT_STATUS"],
    visibilitySource: ["src/modules/projects/domain/project-lifecycle.ts", "PROJECT_VISIBILITY"],
    categorySource: ["src/modules/services/domain/capability.ts", "CAPABILITY_SLUGS"],
  },
  products: {
    folder: "content/products",
    widgets: { id: "string", slug: "string", name: "string", tagline: "text", description: "text", status: "select", visibility: "select", featured: "boolean", features: "list", image: "optional-image-asset", url: "optional-string", originProjectId: "optional-string", createdAt: "datetime", updatedAt: "datetime" },
    statusSource: ["src/modules/products/domain/product-lifecycle.ts", "PRODUCT_STATUS"],
    visibilitySource: ["src/modules/products/domain/product-visibility.ts", "PRODUCT_VISIBILITY"],
  },
  insights: {
    folder: "content/insights",
    widgets: { id: "string", slug: "string", title: "string", summary: "text", body: "text", tags: "list", status: "select", publishedAt: "optional-datetime", coverImage: "optional-image-asset", updatedAt: "datetime" },
    statusSource: ["src/modules/insights/domain/insight.ts", "INSIGHT_STATUS"],
  },
};

assert.deepEqual(config.collections.map(({ name }) => name), Object.keys(expected));
for (const collection of config.collections) {
  const model = expected[collection.name];
  const schema = domainSchemas[collection.name];
  assert.equal(collection.folder, model.folder);
  assert.equal(collection.extension, "json");
  assert.equal(collection.format, "json");
  assert.equal(collection.create, true);
  assert.equal(collection.slug, "{{fields.slug}}");
  assert.deepEqual(collection.fields.map(({ name }) => name), schema.map(({ name }) => name), `${collection.name} fields must match its domain interface`);
  for (const field of collection.fields) {
    assert.equal(field.widget, model.widgets[field.name], `${collection.name}.${field.name} widget`);
    const domainField = schema.find(({ name }) => name === field.name);
    assert.equal(field.required === false, domainField.optional, `${collection.name}.${field.name} optionality must match its domain interface`);
    const widget = field.widget;
    if (domainField.type === "string") assert.ok(["string", "text", "optional-string", "optional-text", "select"].includes(widget), `${collection.name}.${field.name} is a string field`);
    else if (domainField.type === "boolean") assert.equal(widget, "boolean", `${collection.name}.${field.name} is a boolean field`);
    else if (domainField.type === "string[]") assert.equal(widget, "list", `${collection.name}.${field.name} is a string list`);
    else if (domainField.type === "ImageAsset[]") assert.equal(widget, "list", `${collection.name}.${field.name} is an image list`);
    else if (domainField.type === "ImageAsset") assert.equal(widget, "optional-image-asset", `${collection.name}.${field.name} is an optional image object`);
    else if (domainField.type === "IsoDateString") assert.ok(["datetime", "optional-datetime"].includes(widget), `${collection.name}.${field.name} is a date field`);
    else if (["ProjectStatus", "ProductStatus", "InsightStatus", "ProjectVisibility", "ProductVisibility", "CapabilitySlug"].includes(domainField.type)) assert.equal(widget, "select", `${collection.name}.${field.name} is an enum field`);
    else assert.fail(`No CMS widget compatibility rule for ${collection.name}.${field.name}: ${domainField.type}`);
  }
  assert.deepEqual(collection.fields.find(({ name }) => name === "slug")?.pattern?.[0], "^[a-z0-9]+(?:-[a-z0-9]+)*$");
  assert.deepEqual(collection.fields.find(({ name }) => name === "status")?.options, await constantValues(...model.statusSource));
  if (model.visibilitySource) assert.deepEqual(collection.fields.find(({ name }) => name === "visibility")?.options, await constantValues(...model.visibilitySource));
  if (model.categorySource) assert.deepEqual(collection.fields.find(({ name }) => name === "category")?.options, await arrayValues(...model.categorySource));
}

for (const collection of config.collections) {
  for (const field of collection.fields.filter(({ widget }) => widget === "optional-image-asset")) {
    assert.equal(field.required, false);
    assert.deepEqual(imageSchema.map(({ name }) => name), ["src", "alt", "width", "height"]);
  }
}

console.log("CMS config parses and aligns collection fields, optionality, enums, widgets, and slug conventions with the domain sources.");

