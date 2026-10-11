/**
 * Who may see a product. Deliberately separate from lifecycle (`product-lifecycle.ts`):
 * lifecycle says where a product is in its life, visibility says who is allowed to see it.
 * Defined here rather than shared with Projects, so the two modules stay independent.
 */
export const PRODUCT_VISIBILITY = {
  PUBLIC: "PUBLIC",
  PRIVATE: "PRIVATE",
  INTERNAL: "INTERNAL",
} as const;

export type ProductVisibility = (typeof PRODUCT_VISIBILITY)[keyof typeof PRODUCT_VISIBILITY];
