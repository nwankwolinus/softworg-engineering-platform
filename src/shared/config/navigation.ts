import { routes } from "@/shared/constants/routes";

export interface NavigationItem {
  label: string;
  href: string;
  /** Rendered as a call-to-action button in the header instead of a plain link. */
  cta?: boolean;
}

export const primaryNavigation: readonly NavigationItem[] = [
  { label: "Home", href: routes.home },
  { label: "About", href: routes.about },
  { label: "Services", href: routes.services },
  { label: "Projects", href: routes.projects },
  { label: "Products", href: routes.products },
  { label: "Insights", href: routes.insights },
  { label: "Contact", href: routes.contact, cta: true },
];
