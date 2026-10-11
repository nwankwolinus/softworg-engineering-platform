import type { ReactNode } from "react";

interface DetailItem {
  label: string;
  value: ReactNode;
}

/** Secondary facts beside the main content. Callers pass only fields that exist in the data. */
export function DetailPanel({ label, items }: { label: string; items: readonly DetailItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside aria-label={label} className="h-fit rounded-lg border border-border bg-surface p-5 sm:p-6">
      <dl className="flex flex-col gap-5">
        {items.map((item) => (
          <div key={item.label}>
            <dt className="text-label uppercase tracking-widest text-muted-foreground">{item.label}</dt>
            <dd className="mt-1.5 text-body text-foreground">{item.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
