import type { ReactNode } from "react";
import { cn } from "@/shared/utils/cn";

export type NoticeTone = "info" | "success" | "warning" | "error";

const toneClassNames: Record<NoticeTone, string> = {
  info: "border-primary/40 bg-primary/10",
  success: "border-success/40 bg-success/10",
  warning: "border-warning/40 bg-warning/10",
  error: "border-error/40 bg-error/10",
};

interface NoticeProps {
  tone?: NoticeTone;
  /** A short label that states the meaning in words, so tone is never the only signal. */
  title?: string;
  /** `status` for polite updates, `alert` for errors that need immediate attention. */
  role?: "status" | "alert";
  children: ReactNode;
}

export function Notice({ tone = "info", title, role, children }: NoticeProps) {
  return (
    <div role={role} className={cn("rounded-md border p-4 text-body-sm text-foreground sm:text-body", toneClassNames[tone])}>
      {title && <p className="mb-1 font-semibold">{title}</p>}
      <div className="text-foreground">{children}</div>
    </div>
  );
}
