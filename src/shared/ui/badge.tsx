import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type BadgeTone = "neutral" | "primary" | "success" | "warning" | "error";

const toneClassNames: Record<BadgeTone, string> = {
  neutral: "border-border-strong bg-surface-elevated text-muted-foreground",
  primary: "border-primary/40 bg-primary/10 text-primary",
  success: "border-success/40 bg-success/10 text-success",
  warning: "border-warning/40 bg-warning/10 text-warning",
  error: "border-error/40 bg-error/10 text-error",
};

/** Meaning is always carried by the text label; the tone only reinforces it. */
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex w-fit items-center rounded-pill border px-2.5 py-0.5 text-caption font-medium",
        toneClassNames[tone],
      )}
    >
      {children}
    </span>
  );
}
