import type { CompanyRepository } from "@/modules/company/domain/company-repository";
import { SeedCompanyRepository } from "@/modules/company/infrastructure/seed-company-repository";

export const companyRepository: CompanyRepository = new SeedCompanyRepository();
