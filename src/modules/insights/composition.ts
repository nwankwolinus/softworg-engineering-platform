import { createInsightQueries } from "@/modules/insights/application/insight-queries";
import { FileInsightRepository } from "@/modules/insights/infrastructure/file-insight-repository";

export const insightQueries = createInsightQueries(new FileInsightRepository());
