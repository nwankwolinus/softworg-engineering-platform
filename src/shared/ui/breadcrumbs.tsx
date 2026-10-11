import Link from "next/link";

export interface Crumb {
  label: string;
  /** Omit on the last item: it is the current page. */
  href?: string;
}

/** Trail for detail pages. The last item is plain text marked as the current page. */
export function Breadcrumbs({ items }: { items: readonly Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm text-muted-foreground">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex min-w-0 items-center gap-2">
              {isLast || !item.href ? (
                <span aria-current={isLast ? "page" : undefined} className="break-words text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="rounded-sm py-1 motion-fast hover:text-foreground hover:underline underline-offset-4">
                  {item.label}
                </Link>
              )}
              {!isLast && <span aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
