import { cn } from "@/shared/utils/cn";

interface ProcessStep {
  title: string;
  description: string;
}

const columnClassNames = {
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
} as const;

/**
 * An ordered sequence. Vertical rail on small screens, horizontal rail from `lg`.
 * The step number is real text, so the order never depends on the layout.
 * Step titles are `h3`: place it inside a `Section` (which supplies the `h2`).
 */
export function ProcessSteps({ steps, columns = 4 }: { steps: readonly ProcessStep[]; columns?: keyof typeof columnClassNames }) {
  return (
    <ol className={cn("flex flex-col lg:grid lg:gap-y-10", columnClassNames[columns])}>
      {steps.map((step, index) => (
        <li
          key={step.title}
          className="relative border-l border-border-strong pb-10 pl-8 last:pb-0 lg:border-l-0 lg:border-t lg:pb-0 lg:pl-0 lg:pr-8 lg:pt-8"
        >
          <span className="absolute left-0 top-0 flex size-8 -translate-x-1/2 items-center justify-center rounded-pill border border-primary/50 bg-background text-label text-primary lg:-translate-y-1/2 lg:translate-x-0">
            {index + 1}
          </span>
          <h3 className="text-h3 text-foreground">{step.title}</h3>
          <p className="mt-2 text-body text-muted-foreground">{step.description}</p>
        </li>
      ))}
    </ol>
  );
}
