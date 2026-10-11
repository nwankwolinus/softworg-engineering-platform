import Link from "next/link";
import { primaryNavigation } from "@/shared/config/navigation";
import { routes } from "@/shared/constants/routes";
import { Container } from "@/shared/ui/container";
import { Logo } from "@/shared/ui/logo";
import { SiteNav } from "@/shared/ui/layout/site-nav";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/75 shadow-sm backdrop-blur-xl">
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-px bg-brand-gradient opacity-70" />
      <Container size="wide" className="flex h-[4.5rem] items-center justify-between gap-4 sm:h-20">
        <Link href={routes.home} className="inline-flex shrink-0 rounded-md">
          <Logo priority className="h-12 sm:h-14" />
        </Link>
        <SiteNav items={primaryNavigation} />
      </Container>
    </header>
  );
}
