import { productQueries } from "@/modules/products/composition";
import { ProductCard } from "@/modules/products/presentation/product-card";
import { projectQueries } from "@/modules/projects/composition";
import { ProjectList } from "@/modules/projects/presentation/project-list";
import { routes } from "@/shared/constants/routes";
import { ButtonLink } from "@/shared/ui/button";
import { CardGrid } from "@/shared/ui/card";
import { Section } from "@/shared/ui/section";

const SHOWCASE_LIMIT = 3;

/**
 * Shows a small selection of publicly eligible projects and products, read only through the
 * modules' query use cases, which already enforce visibility and lifecycle rules. With no
 * eligible entries it renders nothing: no placeholder cards, no empty showcase.
 */
export async function HomeShowcase() {
  const [ongoing, portfolio, products] = await Promise.all([
    projectQueries.listOngoing(),
    projectQueries.listPortfolio(),
    productQueries.listPublic(),
  ]);

  const projects = [...ongoing, ...portfolio].slice(0, SHOWCASE_LIMIT);
  const featuredProducts = [...products]
    .sort((a, b) => Number(b.featured) - Number(a.featured))
    .slice(0, SHOWCASE_LIMIT);

  return (
    <>
      {projects.length > 0 && (
        <Section eyebrow="Projects" title="Selected projects">
          <ProjectList projects={projects} emptyTitle="" />
          <div className="mt-8">
            <ButtonLink href={routes.projects} variant="outline">
              View all projects
            </ButtonLink>
          </div>
        </Section>
      )}
      {featuredProducts.length > 0 && (
        <Section eyebrow="Products" title="Products">
          <CardGrid>
            {featuredProducts.map((product) => (
              <li key={product.id}>
                <ProductCard product={product} />
              </li>
            ))}
          </CardGrid>
          <div className="mt-8">
            <ButtonLink href={routes.products} variant="outline">
              View all products
            </ButtonLink>
          </div>
        </Section>
      )}
    </>
  );
}
