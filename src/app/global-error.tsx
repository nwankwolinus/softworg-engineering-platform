"use client";

import { siteConfig } from "@/shared/config/site";
import "./globals.css";

// Only renders if the root layout itself fails; intentionally dependency-free apart from the stylesheet
// (the root layout normally imports it, but it is replaced here).
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang={siteConfig.locale}>
      <body>
        <main className="mx-auto flex min-h-dvh max-w-page flex-col items-start justify-center gap-4 px-gutter">
          <h1 className="text-h1 text-foreground">Something went wrong</h1>
          <button
            type="button"
            onClick={reset}
            className="h-11 rounded-md bg-primary px-5 text-body-sm font-medium text-primary-foreground hover:bg-primary-hover"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
