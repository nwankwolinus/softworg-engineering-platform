import type { ImageAsset, IsoDateString } from "@/shared/types/common";

export const INSIGHT_STATUS = {
  DRAFT: "DRAFT",
  PUBLISHED: "PUBLISHED",
} as const;

export type InsightStatus = (typeof INSIGHT_STATUS)[keyof typeof INSIGHT_STATUS];

export interface Insight {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** Plain text for now. The body format (markdown/rich text) is decided when a content source is chosen. */
  body: string;
  tags: string[];
  status: InsightStatus;
  publishedAt?: IsoDateString;
  coverImage?: ImageAsset;
  updatedAt: IsoDateString;
}

export type PublishedInsight = Insight & { publishedAt: IsoDateString };

export function isPublished(insight: Insight): insight is PublishedInsight {
  return insight.status === INSIGHT_STATUS.PUBLISHED && insight.publishedAt !== undefined;
}
