import Link from "next/link";
import { primaryNavigation } from "@/shared/config/navigation";
import { siteConfig } from "@/shared/config/site";
import { routes } from "@/shared/constants/routes";
import { Container } from "@/shared/ui/container";
import { ExternalLink } from "@/shared/ui/external-link";
import { Logo } from "@/shared/ui/logo";

interface SiteFooterProps {
  /** Supplied by the app layer from the Services module (shared code cannot import modules). */
  services: readonly { slug: string; title: string }[];
  contactEmail: string;
  phone: string;
  /** Official company accounts only. Representative accounts are not shown in the footer. */
  socialLinks: readonly { label: string; url: string }[];
}

const columnHeadingClassName = "mb-4 text-label uppercase tracking-widest text-muted-foreground";
const linkClassName = "inline-block py-1 text-body-sm text-muted-foreground motion-fast hover:text-foreground";

export function SiteFooter({ services, contactEmail, phone, socialLinks }: SiteFooterProps) {
  return (
    <footer className="border-t border-border bg-surface">
      <div aria-hidden="true" className="h-px bg-brand-gradient opacity-40" />
      <Container size="wide" className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="flex flex-col items-start gap-4">
          <Logo className="h-16" />
          <p className="max-w-xs text-body-sm text-muted-foreground">{siteConfig.businessNature}</p>
        </div>

        <nav aria-label="Footer">
          <h2 className={columnHeadingClassName}>Navigation</h2>
          <ul className="flex flex-col">
            {primaryNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClassName}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={columnHeadingClassName}>Services</h2>
          <ul className="flex flex-col">
            {services.map((service) => (
              <li key={service.slug}>
                <Link href={routes.service(service.slug)} className={linkClassName}>
                  {service.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className={columnHeadingClassName}>Contact</h2>
          <ul className="flex flex-col">
            <li>
              <a href={`mailto:${contactEmail}`} className={linkClassName}>
                {contactEmail}
              </a>
            </li>
            <li>
              <a href={`tel:${phone}`} className={linkClassName}>
                {phone}
              </a>
            </li>
            <li className="py-1 text-body-sm text-muted-foreground">{siteConfig.location}</li>
          </ul>
          {socialLinks.length > 0 && (
            <ul aria-label="Social media" className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-body-sm">
              {socialLinks.map((link) => (
                <li key={link.url} className="py-1">
                  <ExternalLink href={link.url}>{link.label}</ExternalLink>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Container>

      <div className="border-t border-border">
        <Container size="wide" className="py-6 text-caption text-muted-foreground">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </Container>
      </div>
    </footer>
  );
}
