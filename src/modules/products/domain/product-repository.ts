import type { Product } from "@/modules/products/domain/product";

export interface ProductRepository {
  findAll(): Promise<Product[]>;
  findBySlug(slug: string): Promise<Product | null>;
}
