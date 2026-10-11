import type { Product } from "@/modules/products/domain/product";
import { ProductCard } from "@/modules/products/presentation/product-card";
import { CardGrid } from "@/shared/ui/card";

/** Renders the products it is given. Eligibility is decided by the application layer, never here. */
export function ProductList({ products }: { products: readonly Product[] }) {
  return (
    <CardGrid>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} />
        </li>
      ))}
    </CardGrid>
  );
}
