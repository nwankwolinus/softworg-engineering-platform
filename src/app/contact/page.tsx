import type { Metadata } from "next";
import { companyRepository } from "@/modules/company/composition";
import { createContactSubmissionToken, getContactDelivery } from "@/modules/contact/composition";
import { ContactForm } from "@/modules/contact/presentation/contact-form";
import { readServerEnv } from "@/shared/config/env";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { buildMetadata } from "@/shared/seo/metadata";
import { CheckList } from "@/shared/ui/check-list";
import { Container } from "@/shared/ui/container";
import { ExternalLink } from "@/shared/ui/external-link";
import { Notice } from "@/shared/ui/notice";
import { PageHeader } from "@/shared/ui/page-header";
import { submitEnquiryAction } from "./actions";

export const metadata: Metadata = buildMetadata({
  title: "Contact",
  description: `Start a conversation with ${siteConfig.name} about a software, AI or automation project.`,
  path: routes.contact,
});

// The feature flag is read per request, so toggling it does not need a rebuild.
export const dynamic = "force-dynamic";

const helpfulToInclude = [
  "The problem or opportunity you want to address",
  "The systems, tools or processes involved",
  "Who will use the solution",
  "Constraints such as timing, budget or compliance needs",
];

const linkClassName = "text-primary underline underline-offset-4 hover:text-primary-hover";

export default async function ContactPage() {
  const company = await companyRepository.getProfile();
  const env = readServerEnv();
  const delivery = getContactDelivery();
  const mode = env.features.contactForm ? delivery.mode : "disabled";
  const securityToken = delivery.signingSecret ? createContactSubmissionToken(delivery.signingSecret) : "";

  const emailLink = (
    <a href={`mailto:${company.contactEmail}`} className={linkClassName}>
      {company.contactEmail}
    </a>
  );

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Discuss a project"
        description="Tell us about your idea, process or engineering challenge, and we can explore an appropriate technical direction."
      />
      <Container className="grid gap-12 py-section lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
        <div className="flex flex-col gap-10">
          <section aria-labelledby="include-heading">
            <h2 id="include-heading" className="text-h3 text-foreground">
              Helpful to include
            </h2>
            <p className="mt-3 text-body text-muted-foreground">
              A few details help us understand what you are trying to achieve. Share what you can; you do not need a
              complete specification.
            </p>
            <div className="mt-6">
              <CheckList items={helpfulToInclude} />
            </div>
          </section>

          <section aria-labelledby="details-heading">
            <h2 id="details-heading" className="text-h3 text-foreground">
              {company.name}
            </h2>
            <p className="mt-1 text-body text-muted-foreground">{company.businessNature}</p>
            <dl className="mt-6 flex flex-col gap-4 text-body">
              <div>
                <dt className="text-label uppercase tracking-widest text-muted-foreground">Email</dt>
                <dd className="mt-1">{emailLink}</dd>
              </div>
              <div>
                <dt className="text-label uppercase tracking-widest text-muted-foreground">Phone</dt>
                <dd className="mt-1">
                  <a href={`tel:${company.phone}`} className={linkClassName}>
                    {company.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-label uppercase tracking-widest text-muted-foreground">Address</dt>
                <dd className="mt-1 text-foreground">
                  <address className="not-italic">
                    {company.fullAddress}
                    <br />
                    {company.location}
                  </address>
                </dd>
              </div>
              <div>
                <dt className="text-label uppercase tracking-widest text-muted-foreground">Online</dt>
                <dd className="mt-1">
                  <ul className="flex flex-col gap-1">
                    {company.socialAccounts.map((account) => (
                      <li key={account.url}>
                        <ExternalLink href={account.url}>{account.label}</ExternalLink>
                        <span className="text-muted-foreground">
                          {account.kind === "official" ? " (official company page)" : " (founder/representative account)"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <section aria-labelledby="enquiry-heading" className="h-fit rounded-lg border border-border bg-surface p-5 sm:p-8">
          <h2 id="enquiry-heading" className="mb-6 text-h3 text-foreground">
            Send an enquiry
          </h2>
          {mode === "disabled" ? (
            <Notice tone="info" title="Online enquiries are not available yet">
              This form has not been switched on. Please email us at {emailLink} or call{" "}
              <a href={`tel:${company.phone}`} className={linkClassName}>
                {company.phone}
              </a>
              .
            </Notice>
          ) : (
            <div className="flex flex-col gap-6">
              {mode === "test" && (
                <Notice tone="warning" title="Test mode">
                  This form is running in test mode. Submissions are not stored or sent to {company.name}. Please email or call us instead.
                </Notice>
              )}
              <ContactForm
                action={submitEnquiryAction}
                deliversEnquiries={mode === "live"}
                securityToken={securityToken}
                contactEmail={company.contactEmail}
                contactPhone={company.phone}
              />
            </div>
          )}
        </section>
      </Container>
    </>
  );
}
