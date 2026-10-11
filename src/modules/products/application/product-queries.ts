import { isPubliclyListed } from "@/modules/products/domain/product-rules";
import type { ProductRepository } from "@/modules/products/domain/product-repository";

export function createProductQueries(repository: ProductRepository) {
  return {
    listPublic: async () => (await repository.findAll()).filter(isPubliclyListed),

    getBySlug: async (slug: string) => {
      const product = await repository.findBySlug(slug);
      return product && isPubliclyListed(product) ? product : null;
    },
  };
}

export type ProductQueries = ReturnType<typeof createProductQueries>;
