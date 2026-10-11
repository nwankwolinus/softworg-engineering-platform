/** "1 January 2025". UTC, so the same date renders on server and client regardless of time zone. */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { dateStyle: "long", timeZone: "UTC" });
}
