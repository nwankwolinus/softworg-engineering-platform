/** ISO 8601 string. Plain strings keep models serialisable across any data source and the RSC boundary. */
export type IsoDateString = string;

export interface ImageAsset {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}
