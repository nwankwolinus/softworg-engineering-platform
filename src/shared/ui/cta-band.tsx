import { ButtonLink } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

interface CtaLink {
  label: string;
  href: string;
}

interface CtaBandProps {
  title: string;
  description: string;
  primary: CtaLink;
  secondary?: CtaLink;
}

/** Closing call to action used at the foot of pages. Decoration is optional and `aria-hidden`. */
export function CtaBand({ title, description, primary, secondary }: CtaBandProps) {
  return (
    <section className="py-section">
      <Container>
        <div className="relative isolate overflow-hidden rounded-lg border border-border-strong bg-surface-elevated px-6 py-12 text-center sm:px-12 md:py-16">
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-glow" />
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-brand-gradient" />
          <h2 className="mx-auto max-w-2xl text-h2 text-foreground">{title}</h2>
          <p className="mx-auto mt-4 max-w-2xl text-body-lg text-muted-foreground">{description}</p>
          <div className="mt-8 flex flex-col justify-center gap-3 xs:flex-row">
            <ButtonLink href={primary.href} size="lg">
              {primary.label}
            </ButtonLink>
            {secondary && (
              <ButtonLink href={secondary.href} variant="ghost" size="lg">
                {secondary.label}
              </ButtonLink>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
