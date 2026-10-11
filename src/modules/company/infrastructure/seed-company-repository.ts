import type { CompanyProfile } from "@/modules/company/domain/company-profile";
import type { CompanyRepository } from "@/modules/company/domain/company-repository";
import { siteConfig } from "@/shared/config/site";

// The approved public company facts are written once, in `siteConfig`. This repository adapts them to the
// Company domain contract, so a future CMS or database can replace it without touching any page.
const companyProfile: CompanyProfile = {
  name: siteConfig.name,
  businessNature: siteConfig.businessNature,
  positioning: siteConfig.positioning,
  description: siteConfig.description,
  contactEmail: siteConfig.contact.email,
  phone: siteConfig.contact.phone,
  location: siteConfig.location,
  fullAddress: siteConfig.fullAddress,
  socialAccounts: siteConfig.socialLinks.map(({ label, url, kind }) => ({ label, url, kind })),
};

export class SeedCompanyRepository implements CompanyRepository {
  async getProfile(): Promise<CompanyProfile> {
    return companyProfile;
  }
}
