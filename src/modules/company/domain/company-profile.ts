export type SocialAccountKind = "official" | "representative";

export interface SocialAccount {
  label: string;
  url: string;
  /** `representative` is a founder/representative account and must not be presented as a company account. */
  kind: SocialAccountKind;
}

export interface CompanyProfile {
  name: string;
  businessNature: string;
  positioning: string;
  description: string;
  contactEmail: string;
  phone: string;
  location: string;
  /** Contact page only. */
  fullAddress: string;
  socialAccounts: readonly SocialAccount[];
}
