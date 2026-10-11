import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/utils/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

const baseClassName =
  "inline-flex shrink-0 select-none items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium motion-fast hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const variantClassNames: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-active",
  secondary:
    "border border-border-strong bg-surface-elevated text-foreground hover:border-muted-foreground active:bg-surface",
  outline: "border border-primary/60 text-primary hover:bg-primary/10 active:bg-primary/20",
  ghost: "text-muted-foreground hover:bg-foreground/5 hover:text-foreground active:bg-foreground/10",
  destructive: "bg-error text-status-foreground hover:bg-error/90 active:bg-error/80",
};

// md is 44px tall, the comfortable touch-target size. sm is for dense, non-primary contexts.
const sizeClassNames: Record<ButtonSize, string> = {
  sm: "h-9 px-3.5 text-body-sm",
  md: "h-11 px-5 text-body-sm",
  lg: "h-12 px-6 text-body",
};

interface ButtonStyleOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

/** Class string for anything that must look like a button (e.g. a navigation link). */
export function buttonVariants({ variant = "primary", size = "md", className }: ButtonStyleOptions = {}): string {
  return cn(baseClassName, variantClassNames[variant], sizeClassNames[size], className);
}

interface ButtonProps extends ComponentPropsWithoutRef<"button">, Omit<ButtonStyleOptions, "className"> {}

/** For actions (submit, toggle, retry). For navigation use `ButtonLink`, so the element is a real link. */
export function Button({ variant, size, className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonVariants({ variant, size, className })} {...props} />;
}

interface ButtonLinkProps
  extends Omit<ComponentPropsWithoutRef<typeof Link>, "className">,
    Omit<ButtonStyleOptions, "className"> {
  className?: string;
}

/** A link styled as a button. Renders an `<a>`, so it navigates and keeps link semantics. */
export function ButtonLink({ variant, size, className, ...props }: ButtonLinkProps) {
  return <Link className={buttonVariants({ variant, size, className })} {...props} />;
}
