/** Single source of truth for URLs. Add entries as pages are implemented. */
export const routes = {
  home: "/",
  about: "/about",
  services: "/services",
  projects: "/projects",
  products: "/products",
  insights: "/insights",
  contact: "/contact",
  project: (slug: string) => `/projects/${slug}`,
  product: (slug: string) => `/products/${slug}`,
  insight: (slug: string) => `/insights/${slug}`,
  service: (slug: string) => `/services#${slug}`,
} as const;
