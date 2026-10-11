import type { ProductQueries } from "@/modules/products/application/product-queries";

export async function productStaticParams(queries: Pick<ProductQueries, "listPublic">) {
  return (await queries.listPublic()).map((product) => ({ slug: product.slug }));
}
