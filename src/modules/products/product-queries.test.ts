import { describe, expect, it } from "vitest";
import { createProductQueries } from "@/modules/products/application/product-queries";
import { productQueries } from "@/modules/products/composition";
import type { Product } from "@/modules/products/domain/product";
import { PRODUCT_STATUS, PRODUCT_STATUS_META, type ProductStatus } from "@/modules/products/domain/product-lifecycle";
import { isPubliclyListed } from "@/modules/products/domain/product-rules";
import { PRODUCT_VISIBILITY, type ProductVisibility } from "@/modules/products/domain/product-visibility";
import { InMemoryProductRepository } from "@/modules/products/infrastructure/in-memory-product-repository";

/** Test fixtures only. Production data lives behind composition.ts and is empty. */
function buildProduct(overrides: Partial<Product>): Product {
  return {
    id: "id",
    slug: "slug",
    name: "Fixture",
    tagline: "Fixture tagline",
    description: "Fixture description",
    status: PRODUCT_STATUS.LIVE,
    visibility: PRODUCT_VISIBILITY.PUBLIC,
    featured: false,
    features: [],
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const ALL_STATUSES = Object.values(PRODUCT_STATUS);
const ALL_VISIBILITIES = Object.values(PRODUCT_VISIBILITY);
const PUBLIC_STATUSES: ProductStatus[] = ["DEVELOPMENT", "BETA", "LIVE", "MAINTENANCE"];

describe("isPubliclyListed (lifecycle x visibility)", () => {
  it("lists a product only when visibility is PUBLIC and the lifecycle is publicly listed", () => {
    for (const status of ALL_STATUSES) {
      for (const visibility of ALL_VISIBILITIES as ProductVisibility[]) {
        const expected = visibility === "PUBLIC" && PUBLIC_STATUSES.includes(status);
        expect(isPubliclyListed({ status, visibility }), `${status} / ${visibility}`).toBe(expected);
      }
    }
  });

  it("never lists RETIRED or CONCEPT products, even when PUBLIC", () => {
    expect(isPubliclyListed({ status: "RETIRED", visibility: "PUBLIC" })).toBe(false);
    expect(isPubliclyListed({ status: "CONCEPT", visibility: "PUBLIC" })).toBe(false);
  });

  it("never lists PRIVATE or INTERNAL products, even when LIVE", () => {
    expect(isPubliclyListed({ status: "LIVE", visibility: "PRIVATE" })).toBe(false);
    expect(isPubliclyListed({ status: "LIVE", visibility: "INTERNAL" })).toBe(false);
  });

  it("keeps lifecycle metadata free of any visibility concept", () => {
    for (const meta of Object.values(PRODUCT_STATUS_META)) {
      expect(Object.keys(meta).sort()).toEqual(["label", "listedPublicly"]);
    }
  });
});

describe("createProductQueries", () => {
  const queries = createProductQueries(
    new InMemoryProductRepository([
      buildProduct({ id: "1", slug: "live-public" }),
      buildProduct({ id: "2", slug: "beta-public", status: PRODUCT_STATUS.BETA }),
      buildProduct({ id: "3", slug: "retired-public", status: PRODUCT_STATUS.RETIRED }),
      buildProduct({ id: "4", slug: "concept-public", status: PRODUCT_STATUS.CONCEPT }),
      buildProduct({ id: "5", slug: "live-private", visibility: PRODUCT_VISIBILITY.PRIVATE }),
      buildProduct({ id: "6", slug: "live-internal", visibility: PRODUCT_VISIBILITY.INTERNAL }),
      buildProduct({ id: "7", slug: "retired-private", status: PRODUCT_STATUS.RETIRED, visibility: PRODUCT_VISIBILITY.PRIVATE }),
    ]),
  );

  it("lists only public, publicly-listed products by default", async () => {
    expect((await queries.listPublic()).map((p) => p.slug).sort()).toEqual(["beta-public", "live-public"]);
  });

  it("does not return retired, concept, private or internal products by slug", async () => {
    for (const slug of ["retired-public", "concept-public", "live-private", "live-internal", "retired-private"]) {
      expect(await queries.getBySlug(slug), slug).toBeNull();
    }
    expect((await queries.getBySlug("live-public"))?.id).toBe("1");
  });
});

describe("production product source", () => {
  it("publishes no products until real content is added", async () => {
    expect(await productQueries.listPublic()).toEqual([]);
  });
});
