import type { Product } from "@/modules/products/domain/product";
import type { ProductRepository } from "@/modules/products/domain/product-repository";

export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: readonly Product[]) {}

  async findAll(): Promise<Product[]> {
    return [...this.products];
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.products.find((product) => product.slug === slug) ?? null;
  }
}
