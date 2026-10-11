/** A short list of capabilities or points. The tick is decorative; the text carries the meaning. */
export function CheckList({ items, label }: { items: readonly string[]; label?: string }) {
  return (
    <ul aria-label={label} className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-3 text-body text-foreground">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-1 size-4 shrink-0 text-primary"
          >
            <path d="M4.5 10.5l3.5 3.5 7.5-8" />
          </svg>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
