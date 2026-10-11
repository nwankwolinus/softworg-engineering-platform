import type { Capability } from "@/modules/services/domain/capability";
import { CapabilityIcon } from "@/modules/services/presentation/capability-icon";
import { routes } from "@/shared/constants/routes";
import { Card, CardGrid } from "@/shared/ui/card";

/** The four core capabilities as compact cards that lead to the Services page. */
export function CapabilityList({ capabilities }: { capabilities: readonly Capability[] }) {
  return (
    <CardGrid columns={4}>
      {capabilities.map((capability) => (
        <li key={capability.slug}>
          <Card
            icon={<CapabilityIcon slug={capability.slug} />}
            title={capability.title}
            description={capability.summary}
            href={routes.services}
          />
        </li>
      ))}
    </CardGrid>
  );
}
