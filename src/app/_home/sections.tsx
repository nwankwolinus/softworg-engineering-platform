import type { Capability } from "@/modules/services/domain/capability";
import { CapabilityList } from "@/modules/services/presentation/capability-list";
import { ProcessSteps } from "@/shared/ui/process-steps";
import { Section } from "@/shared/ui/section";
import { approach, principles, solutionAreas } from "./content";

export function CapabilitySection({ capabilities }: { capabilities: readonly Capability[] }) {
  return (
    <Section
      eyebrow="Capabilities"
      title="Four disciplines, one engineering practice"
      description="From custom software to applied AI, our work is organised around four core capabilities."
    >
      <CapabilityList capabilities={capabilities} />
    </Section>
  );
}

export function ApproachSection() {
  return (
    <Section tone="muted" eyebrow={approach.eyebrow} title={approach.title} description={approach.description}>
      <ProcessSteps steps={approach.steps} />
    </Section>
  );
}

export function SolutionAreasSection() {
  return (
    <Section eyebrow={solutionAreas.eyebrow} title={solutionAreas.title} description={solutionAreas.description}>
      <ul className="grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
        {solutionAreas.items.map((item) => (
          <li key={item.title} className="border-l-2 border-primary/40 pl-5">
            <h3 className="text-h4 text-foreground">{item.title}</h3>
            <p className="mt-2 text-body text-muted-foreground">{item.description}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function PrinciplesSection() {
  return (
    <Section tone="muted" eyebrow={principles.eyebrow} title={principles.title} description={principles.description}>
      <ul className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
        {principles.items.map((item) => (
          <li key={item.title} className="flex gap-4">
            <span
              aria-hidden="true"
              className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-pill border border-primary/40 text-primary"
            >
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-3.5">
                <path d="M4.5 10.5l3.5 3.5 7.5-8" />
              </svg>
            </span>
            <div>
              <h3 className="text-h4 text-foreground">{item.title}</h3>
              <p className="mt-1.5 text-body text-muted-foreground">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
