import type { MetadataRoute } from "next";
import { insightQueries } from "@/modules/insights/composition";
import { productQueries } from "@/modules/products/composition";
import { projectQueries } from "@/modules/projects/composition";
import { readServerEnv } from "@/shared/config/env";
import { routes } from "@/shared/constants/routes";
import { absoluteUrl } from "@/shared/seo/serialize-json-ld";

const staticRoutes = [
  routes.home,
  routes.about,
  routes.services,
  routes.projects,
  routes.products,
  routes.insights,
  routes.contact,
];

/** Static pages plus every public entity. Entities come only from the public queries, so nothing private is listed. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { siteUrl } = readServerEnv();
  // Without a configured domain there are no honest absolute URLs to list.
  if (!siteUrl) return [];
  const [projects, products, insights] = await Promise.all([
    projectQueries.listPublic(),
    productQueries.listPublic(),
    insightQueries.listPublished(),
  ]);

  return [
    ...staticRoutes.map((path) => ({ url: absoluteUrl(siteUrl, path) })),
    ...projects.map((project) => ({
      url: absoluteUrl(siteUrl, routes.project(project.slug)),
      lastModified: project.updatedAt,
    })),
    ...products.map((product) => ({
      url: absoluteUrl(siteUrl, routes.product(product.slug)),
      lastModified: product.updatedAt,
    })),
    ...insights.map((insight) => ({
      url: absoluteUrl(siteUrl, routes.insight(insight.slug)),
      lastModified: insight.updatedAt,
    })),
  ];
}
