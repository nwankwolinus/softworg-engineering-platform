import type { Service } from "@/modules/services/domain/service";
import { Card, CardGrid } from "@/shared/ui/card";
import { CheckList } from "@/shared/ui/check-list";

/** The approved service catalogue, one card per service. */
export function ServiceList({ services }: { services: readonly Service[] }) {
  return (
    <CardGrid>
      {services.map((service) => (
        // The id lets other pages (and the footer) link straight to a service.
        <li key={service.slug} id={service.slug}>
          <Card title={service.title} description={service.summary}>
            <div className="mt-2 border-t border-border pt-4">
              <CheckList items={service.highlights} label={`${service.title}: what we engineer`} />
            </div>
          </Card>
        </li>
      ))}
    </CardGrid>
  );
}
