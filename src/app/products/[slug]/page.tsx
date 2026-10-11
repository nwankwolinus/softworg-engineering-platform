import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { productQueries } from "@/modules/products/composition";
import { PRODUCT_STATUS_META } from "@/modules/products/domain/product-lifecycle";
import { routes } from "@/shared/constants/routes";
import { buildMetadata, noIndexMetadata } from "@/shared/seo/metadata";
import { Badge } from "@/shared/ui/badge";
import { Breadcrumbs } from "@/shared/ui/breadcrumbs";
import { CheckList } from "@/shared/ui/check-list";
import { Container } from "@/shared/ui/container";
import { ContentImage } from "@/shared/ui/content-image";
import { CtaBand } from "@/shared/ui/cta-band";
import { DetailPanel } from "@/shared/ui/detail-panel";
import { ExternalLink } from "@/shared/ui/external-link";
import { PageHeader } from "@/shared/ui/page-header";
import { toSafeExternalUrl } from "@/shared/utils/safe-url";
import { contactCta } from "../../_content/cta";
import { productStaticParams } from "@/app/products/[slug]/static-params";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  return productStaticParams(productQueries);
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await productQueries.getBySlug(slug); // applies visibility and lifecycle rules
  if (!product) return noIndexMetadata("Product not found");
  return buildMetadata({ title: product.name, description: product.tagline, path: routes.product(product.slug) });
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await productQueries.getBySlug(slug);
  if (!product) notFound();
  const productUrl = toSafeExternalUrl(product.url);

  return (
    <>
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            items={[
              { label: "Home", href: routes.home },
              { label: "Products", href: routes.products },
              { label: product.name },
            ]}
          />
        }
        eyebrow="Product"
        title={product.name}
        description={product.tagline}
      />

      <Container className="grid gap-12 py-section lg:grid-cols-[minmax(0,1fr)_20rem] xl:gap-16">
        <div className="flex min-w-0 flex-col gap-10">
          {product.image && <ContentImage image={product.image} sizes="(min-width: 1024px) 700px, 100vw" priority />}
          <section aria-labelledby="overview-heading">
            <h2 id="overview-heading" className="text-h3 text-foreground">
              Overview
            </h2>
            <p className="mt-3 max-w-3xl whitespace-pre-line text-body-lg text-muted-foreground">{product.description}</p>
          </section>
          {product.features.length > 0 && (
            <section aria-labelledby="features-heading">
              <h2 id="features-heading" className="mb-4 text-h3 text-foreground">
                Capabilities
              </h2>
              <CheckList items={product.features} />
            </section>
          )}
        </div>

        <DetailPanel
          label="Product details"
          items={[
            { label: "Stage", value: <Badge>{PRODUCT_STATUS_META[product.status].label}</Badge> },
            ...(productUrl ? [{ label: "Website", value: <ExternalLink href={productUrl}>Visit product site</ExternalLink> }] : []),
          ]}
        />
      </Container>

      <CtaBand {...contactCta} secondary={{ label: "All products", href: routes.products }} />
    </>
  );
}
