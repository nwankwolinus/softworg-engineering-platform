import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type CardVariant = "standard" | "elevated";

const variantClassNames: Record<CardVariant, string> = {
  standard: "border-border bg-surface",
  elevated: "border-border-strong bg-surface-elevated shadow-md",
};

const interactiveClassNames: Record<CardVariant, string> = {
  standard: "hover:-translate-y-1 hover:border-primary/50 hover:bg-surface-elevated hover:shadow-md",
  elevated: "hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg",
};

interface CardProps {
  title: string;
  description?: string;
  /** When provided, the whole card is a single link target (accessible stretched-link pattern). */
  href?: string;
  badge?: ReactNode;
  /** Optional leading visual identifier (decorative; the title carries the meaning). */
  icon?: ReactNode;
  /** `standard` for ordinary content, `elevated` for the one or two items that deserve emphasis. */
  variant?: CardVariant;
  /** Pick the level that keeps the page outline logical; defaults to h3 (cards sit under a section h2). */
  headingLevel?: "h2" | "h3" | "h4";
  /** Optional extra content below the description. */
  children?: ReactNode;
}

export function Card({
  title,
  description,
  href,
  badge,
  icon,
  variant = "standard",
  headingLevel: Heading = "h3",
  children,
}: CardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col gap-3 rounded-lg border p-5 motion-standard sm:p-6",
        variantClassNames[variant],
        href &&
          cn(
            interactiveClassNames[variant],
            // The stretched link hides its own outline; the focus ring is drawn on the whole card instead.
            "has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-focus",
          ),
      )}
    >
      {icon}
      {badge}
      <Heading className="break-words text-h4 text-foreground">
        {href ? (
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-hidden">
            {title}
            <span aria-hidden="true" className="ml-1.5 inline-block text-primary motion-fast group-hover:translate-x-0.5">
              →
            </span>
          </Link>
        ) : (
          title
        )}
      </Heading>
      {description && <p className="text-body text-muted-foreground">{description}</p>}
      {children}
    </article>
  );
}

const gridColumnClassNames = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 xl:grid-cols-4",
} as const;

/** Children must be `<li>` elements. One column on mobile; two from `sm`; optionally three from `lg` or four from `xl`. */
export function CardGrid({ children, columns = 2 }: { children: ReactNode; columns?: keyof typeof gridColumnClassNames }) {
  return <ul className={cn("grid gap-4 sm:gap-6", gridColumnClassNames[columns])}>{children}</ul>;
}
