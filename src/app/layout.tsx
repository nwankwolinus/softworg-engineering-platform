import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
import { companyRepository } from "@/modules/company/composition";
import { serviceRepository } from "@/modules/services/composition";
import { readServerEnv } from "@/shared/config/env";
import { siteConfig } from "@/shared/config/site";
import { SiteFooter } from "@/shared/ui/layout/site-footer";
import { SiteHeader } from "@/shared/ui/layout/site-header";
import { ScrollMotion } from "@/shared/ui/scroll-motion";
import "./globals.css";

// Self-hosted at build time by next/font; exposed as a CSS variable consumed by `--font-sans` in globals.css.
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

const siteUrl = readServerEnv().siteUrl;

export const metadata: Metadata = {
  // Only set when a domain is configured; otherwise relative URLs would resolve against a guess.
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  // Fallbacks for routes that set no metadata of their own; pages use buildMetadata for the full set.
  openGraph: { siteName: siteConfig.name, type: "website", ...(siteUrl ? { images: [siteConfig.ogImage] } : {}) },
  twitter: siteUrl
    ? { card: "summary_large_image", images: [siteConfig.ogImage.url] }
    : { card: "summary" },
};

export const viewport: Viewport = {
  themeColor: "#050816",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  // The layout is part of the delivery layer, so it may compose modules through their composition roots.
  const [company, services] = await Promise.all([
    companyRepository.getProfile(),
    serviceRepository.findAll(),
  ]);

  return (
    <html lang={siteConfig.locale} className={inter.variable}>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-body-sm focus:font-medium focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <ScrollMotion />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <SiteFooter
          services={services.map(({ slug, title }) => ({ slug, title }))}
          contactEmail={company.contactEmail}
          phone={company.phone}
          socialLinks={company.socialAccounts.filter((account) => account.kind === "official")}
        />
      </body>
    </html>
  );
}
