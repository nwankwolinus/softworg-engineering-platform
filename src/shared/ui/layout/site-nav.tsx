"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type { NavigationItem } from "@/shared/config/navigation";
import { buttonVariants } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";
import { cn } from "@/shared/utils/cn";

/**
 * Client Component because it needs the current pathname (active state) and open/closed state
 * for the small-screen disclosure. Everything else in the header stays on the server.
 */
export function SiteNav({ items }: { items: readonly NavigationItem[] }) {
  const pathname = usePathname();
  const panelId = useId();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // The menu is "open for" a pathname, so navigating anywhere closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const isOpen = openFor === pathname;

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenFor(null);
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  const links = items.filter((item) => !item.cta);
  const cta = items.find((item) => item.cta);

  return (
    <nav aria-label="Primary" className="flex items-center">
      {/* Laptop and up: inline navigation. */}
      <ul className="hidden items-center gap-1 lg:flex">
        {links.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={isActive(item.href) ? "page" : undefined}
              className={cn(
                "rounded-md px-3 py-2 text-body-sm font-medium motion-fast hover:text-foreground",
                isActive(item.href)
                  ? "text-foreground underline decoration-primary decoration-2 underline-offset-8"
                  : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          </li>
        ))}
        {cta && (
          <li className="ml-3">
            <Link
              href={cta.href}
              aria-current={isActive(cta.href) ? "page" : undefined}
              className={buttonVariants({ size: "sm" })}
            >
              {cta.label}
            </Link>
          </li>
        )}
      </ul>

      {/* Below laptop: a simple disclosure. No focus trap or overlay; it is a list of links. */}
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setOpenFor(isOpen ? null : pathname)}
        className={buttonVariants({ variant: "secondary", className: "lg:hidden" })}
      >
        <span>Menu</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" className="size-5">
          {isOpen ? <path d="M5 5l10 10M15 5L5 15" /> : <path d="M3 6h14M3 10h14M3 14h14" />}
        </svg>
      </button>

      <div
        id={panelId}
        hidden={!isOpen}
        className="absolute inset-x-0 top-full border-b border-border bg-background shadow-lg lg:hidden"
      >
        <Container className="py-4">
          <ul className="flex flex-col gap-1">
            {links.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpenFor(null)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "block rounded-md border-l-2 px-3 py-3 text-body font-medium motion-fast hover:bg-foreground/5",
                    isActive(item.href)
                      ? "border-primary bg-foreground/5 text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          {cta && (
            <Link
              href={cta.href}
              onClick={() => setOpenFor(null)}
              aria-current={isActive(cta.href) ? "page" : undefined}
              className={buttonVariants({ size: "lg", className: "mt-4 w-full" })}
            >
              {cta.label}
            </Link>
          )}
        </Container>
      </div>
    </nav>
  );
}
