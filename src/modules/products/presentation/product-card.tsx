import type { Product } from "@/modules/products/domain/product";
import { PRODUCT_STATUS_META } from "@/modules/products/domain/product-lifecycle";
import { routes } from "@/shared/constants/routes";
import { Badge } from "@/shared/ui/badge";
import { Card } from "@/shared/ui/card";
import { CheckList } from "@/shared/ui/check-list";

const MAX_FEATURES = 4;

/** The lifecycle status is shown as text in the badge, so its meaning never relies on colour. */
export function ProductCard({ product }: { product: Product }) {
  return (
    <Card
      title={product.name}
      description={product.tagline}
      href={routes.product(product.slug)}
      badge={<Badge>{PRODUCT_STATUS_META[product.status].label}</Badge>}
    >
      {product.features.length > 0 && (
        <div className="mt-2 border-t border-border pt-4">
          <CheckList items={product.features.slice(0, MAX_FEATURES)} label={`${product.name} features`} />
        </div>
      )}
    </Card>
  );
}
