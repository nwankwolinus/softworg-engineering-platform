import { createProductQueries } from "@/modules/products/application/product-queries";
import { FileProductRepository } from "@/modules/products/infrastructure/file-product-repository";

export const productQueries = createProductQueries(new FileProductRepository());
