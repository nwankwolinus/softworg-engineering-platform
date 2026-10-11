import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/shared/utils/cn";

export type ContainerSize = "narrow" | "default" | "wide";

const sizeClassNames: Record<ContainerSize, string> = {
  narrow: "max-w-narrow", // reading width: long-form text
  default: "max-w-page",
  wide: "max-w-wide", // large desktop: grids and showcase layouts
};

interface ContainerProps extends ComponentPropsWithoutRef<"div"> {
  size?: ContainerSize;
}

/** Page width system. Horizontal padding (`gutter`) is responsive via the design tokens. */
export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-gutter", sizeClassNames[size], className)} {...props} />;
}
