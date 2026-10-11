/**
 * How the contact feature is operating. The UI must describe exactly this state and nothing more.
 *  - disabled: intentionally unavailable (feature flag off).
 *  - test:     enabled, but the receiver does not deliver anywhere (stub). Nothing reaches Softworg.
 *  - live:     enabled with a receiver that really delivers enquiries.
 */
export type ContactMode = "disabled" | "test" | "live";

export function resolveContactMode(input: { enabled: boolean; deliversEnquiries: boolean }): ContactMode {
  if (!input.enabled) return "disabled";
  return input.deliversEnquiries ? "live" : "test";
}
