import type { CompanyProfile } from "@/modules/company/domain/company-profile";

export interface CompanyRepository {
  getProfile(): Promise<CompanyProfile>;
}
