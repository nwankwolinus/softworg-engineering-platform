import type { Product } from "@/modules/products/domain/product";
import { PRODUCT_STATUS_META } from "@/modules/products/domain/product-lifecycle";
import { PRODUCT_VISIBILITY } from "@/modules/products/domain/product-visibility";

/**
 * Public listing eligibility = visibility allows it AND lifecycle allows it.
 *
 * - visibility must be PUBLIC (PRIVATE and INTERNAL products are never listed);
 * - lifecycle must be one that is shown publicly (`listedPublicly` in PRODUCT_STATUS_META:
 *   CONCEPT and RETIRED are not).
 *
 * Whether each lifecycle stage is publicly listed is a business assumption kept in one place
 * (PRODUCT_STATUS_META) so it can be changed without touching callers.
 */
export function isPubliclyListed(product: Pick<Product, "status" | "visibility">): boolean {
  return (
    product.visibility === PRODUCT_VISIBILITY.PUBLIC && PRODUCT_STATUS_META[product.status].listedPublicly
  );
}
