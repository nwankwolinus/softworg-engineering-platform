import type { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  /** Optional links or buttons offering a next step. */
  children?: ReactNode;
}

/** An intentional "nothing here yet" state. Never use it to dress up missing data as content. */
export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-dashed border-border-strong bg-surface/50 px-6 py-12 text-center sm:py-16">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-40" />
      <p className="mx-auto max-w-xl text-h3 text-foreground">{title}</p>
      {description && <p className="mx-auto mt-3 max-w-xl text-body text-muted-foreground">{description}</p>}
      {children && <div className="mt-6 flex flex-col justify-center gap-3 xs:flex-row">{children}</div>}
    </div>
  );
}
