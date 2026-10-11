import type { Metadata } from "next";
import { productQueries } from "@/modules/products/composition";
import { ProductList } from "@/modules/products/presentation/product-list";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { buildMetadata } from "@/shared/seo/metadata";
import { CtaBand } from "@/shared/ui/cta-band";
import { EmptyState } from "@/shared/ui/empty-state";
import { PageHeader } from "@/shared/ui/page-header";
import { Section } from "@/shared/ui/section";
import { contactCta } from "../_content/cta";

export const metadata: Metadata = buildMetadata({
  title: "Products",
  description:
    `Reusable software and AI products from ${siteConfig.name}, with their current stage of development.`,
  path: routes.products,
});

export default async function ProductsPage() {
  // listPublic applies visibility and lifecycle rules; the page does not repeat them.
  const products = await productQueries.listPublic();

  return (
    <>
      <PageHeader
        eyebrow="Products"
        title="Products from our engineering work"
        description="Reusable solutions that can grow out of project work, each shown with its current stage of development."
      />

      <Section spacing="tight">
        {products.length === 0 ? (
          <EmptyState
            title="No products are listed yet"
            description="Public products will appear here once they reach a stage that is ready to share. In the meantime, you can explore our services or discuss a project."
          />
        ) : (
          <ProductList products={products} />
        )}
      </Section>

      <CtaBand {...contactCta} />
    </>
  );
}
