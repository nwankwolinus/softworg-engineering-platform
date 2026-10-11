import { useId } from "react";
import type { ReactNode } from "react";
import { Container, type ContainerSize } from "@/shared/ui/container";
import { cn } from "@/shared/utils/cn";

interface SectionProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  /** `muted` sets the section on a raised surface to separate it from its neighbours. */
  tone?: "default" | "muted";
  spacing?: "default" | "tight";
  containerSize?: ContainerSize;
  children: ReactNode;
}

export function Section({
  eyebrow,
  title,
  description,
  tone = "default",
  spacing = "default",
  containerSize,
  children,
}: SectionProps) {
  const headingId = useId();
  const hasHeading = Boolean(title);

  return (
    <section
      aria-labelledby={hasHeading ? headingId : undefined}
      data-motion="reveal"
      className={cn(
        spacing === "default" ? "py-section" : "py-10 md:py-14",
        tone === "muted" && "border-y border-border bg-surface",
      )}
    >
      <Container size={containerSize}>
        {(eyebrow || title || description) && (
          <div className="mb-8 max-w-3xl md:mb-10">
            {eyebrow && (
              <p className="mb-3 text-label uppercase tracking-widest text-primary">{eyebrow}</p>
            )}
            {title && (
              <h2 id={headingId} className="text-h2 text-foreground">
                {title}
              </h2>
            )}
            {description && <p className="mt-3 text-body-lg text-muted-foreground">{description}</p>}
          </div>
        )}
        {children}
      </Container>
    </section>
  );
}
