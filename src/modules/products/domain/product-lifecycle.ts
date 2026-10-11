export const PRODUCT_STATUS = {
  CONCEPT: "CONCEPT",
  DEVELOPMENT: "DEVELOPMENT",
  BETA: "BETA",
  LIVE: "LIVE",
  MAINTENANCE: "MAINTENANCE",
  RETIRED: "RETIRED",
} as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];

export const PRODUCT_STATUS_META: Record<ProductStatus, { label: string; listedPublicly: boolean }> = {
  CONCEPT: { label: "Concept", listedPublicly: false },
  DEVELOPMENT: { label: "In development", listedPublicly: true },
  BETA: { label: "Beta", listedPublicly: true },
  LIVE: { label: "Live", listedPublicly: true },
  MAINTENANCE: { label: "Maintenance", listedPublicly: true },
  RETIRED: { label: "Retired", listedPublicly: false },
};
