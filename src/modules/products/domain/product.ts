import type { ImageAsset, IsoDateString } from "@/shared/types/common";
import type { ProductStatus } from "@/modules/products/domain/product-lifecycle";
import type { ProductVisibility } from "@/modules/products/domain/product-visibility";

/**
 * A reusable product or solution Softworg offers. Not a Project: a product may
 * originate from a project but has its own lifecycle, identity and audience.
 *
 * `status` (lifecycle) and `visibility` are independent. A product is eligible for the public
 * site only when BOTH allow it; see `isPubliclyListed` in `product-rules.ts`.
 */
export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  status: ProductStatus;
  visibility: ProductVisibility;
  featured: boolean;
  features: string[];
  image?: ImageAsset;
  url?: string;
  /** Loose reference by id only, which keeps the Products module independent of Projects. */
  originProjectId?: string;
  createdAt: IsoDateString;
  updatedAt: IsoDateString;
}
