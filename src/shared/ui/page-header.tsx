import type { ReactNode } from "react";
import { Container } from "@/shared/ui/container";
import { cn } from "@/shared/utils/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  /** Optional calls to action, typically `ButtonLink`s. */
  actions?: ReactNode;
  /** `hero` is for the home page only; every internal page uses `default`. */
  size?: "default" | "hero";
  /** Decorative illustration, shown from `lg` up beside the text. It is hidden from assistive technology. */
  visual?: ReactNode;
  /** Breadcrumb trail for detail pages. */
  breadcrumbs?: ReactNode;
}

/** The page's single `<h1>`. The decoration is optional: remove it and the header still stands on its own. */
export function PageHeader({ title, description, eyebrow, actions, size = "default", visual, breadcrumbs }: PageHeaderProps) {
  const isHero = size === "hero";

  return (
    <header className={cn("relative isolate overflow-hidden border-b border-border", isHero && "home-hero min-h-[38rem] lg:min-h-[46rem]")}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-glow" />
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-brand-gradient opacity-60" />
      </div>
      <Container className={cn(isHero ? "flex min-h-[inherit] items-center py-16 md:py-24 lg:py-28" : "py-12 md:py-16 lg:py-20")}>
        <div
          className={cn(visual ? "grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] xl:gap-16" : undefined)}
        >
          <div data-hero-copy={isHero ? "" : undefined} className={cn(isHero && "relative z-10")}>
            {breadcrumbs && <div className="mb-6">{breadcrumbs}</div>}
            {eyebrow && (
              <p className={cn("mb-5 text-label uppercase tracking-[0.18em] text-primary", isHero && "inline-flex items-center gap-3 rounded-pill border border-primary/25 bg-background/55 px-4 py-2 backdrop-blur")}>
                {isHero && <span aria-hidden="true" className="size-2 rounded-full bg-primary shadow-glow" />}
                {eyebrow}
              </p>
            )}
            {/* The oversized display size is for text-only heroes; beside a visual the column is narrower. */}
            <h1 className={cn("max-w-4xl break-words text-foreground", isHero ? "text-display" : "text-h1")}>{title}</h1>
            {description && <p className={cn("mt-5 max-w-2xl text-body-lg text-muted-foreground", isHero && "max-w-xl text-pretty lg:mt-7")}>{description}</p>}
            {actions && <div className={cn("mt-8 flex flex-col gap-3 xs:flex-row xs:flex-wrap", isHero && "lg:mt-10")}>{actions}</div>}
          </div>
          {visual && (
            <div aria-hidden="true" className="hero-visual-wrap hidden lg:block">
              {visual}
            </div>
          )}
        </div>
      </Container>
    </header>
  );
}
