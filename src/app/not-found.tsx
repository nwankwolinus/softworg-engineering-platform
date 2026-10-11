import type { Metadata } from "next";
import { routes } from "@/shared/constants/routes";
import { noIndexMetadata } from "@/shared/seo/metadata";
import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export const metadata: Metadata = noIndexMetadata("Page not found");

export default function NotFound() {
  return (
    <Container className="flex flex-col items-start gap-4 py-section">
      <p className="text-label uppercase tracking-widest text-primary">Error 404</p>
      <h1 className="text-h1 text-foreground">Page not found</h1>
      <p className="max-w-xl text-body-lg text-muted-foreground">
        The page you are looking for does not exist, has moved, or is not public.
      </p>
      <div className="mt-2 flex flex-col gap-3 xs:flex-row xs:flex-wrap">
        <ButtonLink href={routes.home}>Back to home</ButtonLink>
        <ButtonLink href={routes.services} variant="secondary">
          Explore our services
        </ButtonLink>
        <ButtonLink href={routes.contact} variant="ghost">
          Contact us
        </ButtonLink>
      </div>
    </Container>
  );
}
