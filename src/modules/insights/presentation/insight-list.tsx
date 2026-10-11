import type { PublishedInsight } from "@/modules/insights/domain/insight";
import { routes } from "@/shared/constants/routes";
import { Badge } from "@/shared/ui/badge";
import { Card, CardGrid } from "@/shared/ui/card";
import { formatDate } from "@/shared/utils/format-date";


export function InsightList({ insights }: { insights: readonly PublishedInsight[] }) {
  return (
    <CardGrid columns={3}>
      {insights.map((insight) => (
        <li key={insight.id}>
          <Card title={insight.title} description={insight.summary} href={routes.insight(insight.slug)}>
            <p className="text-caption text-muted-foreground">
              <time dateTime={insight.publishedAt}>{formatDate(insight.publishedAt)}</time>
            </p>
            {insight.tags.length > 0 && (
              <ul aria-label="Topics" className="flex flex-wrap gap-2">
                {insight.tags.map((tag) => (
                  <li key={tag}>
                    <Badge>{tag}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </li>
      ))}
    </CardGrid>
  );
}
