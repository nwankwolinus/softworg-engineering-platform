"use client";

import { Button } from "@/shared/ui/button";
import { Container } from "@/shared/ui/container";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Container className="flex flex-col items-start gap-4 py-section">
      <h1 className="text-h1 text-foreground">Something went wrong</h1>
      <p className="max-w-xl text-body-lg text-muted-foreground">An unexpected error occurred. Please try again.</p>
      <Button onClick={reset} className="mt-2">Try again</Button>
    </Container>
  );
}
