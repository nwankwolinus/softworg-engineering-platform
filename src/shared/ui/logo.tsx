import Image from "next/image";
import { siteConfig } from "@/shared/config/site";
import { cn } from "@/shared/utils/cn";

/**
 * The supplied Softworg artwork, keyed to a transparent background for dark surfaces
 * (source: the dark-background logo supplied for the project). To swap in final artwork,
 * replace the files in `public/brand/` and update the dimensions here; no call site changes.
 * Callers set the height (e.g. `h-12`); width follows the aspect ratio.
 */
const logoAssets = {
  lockup: { src: "/brand/softworg-logo.png", width: 536, height: 406 },
  mark: { src: "/brand/softworg-mark.png", width: 536, height: 280 },
} as const;

interface LogoProps {
  variant?: keyof typeof logoAssets;
  className?: string;
  /** Set on the first logo visible above the fold. */
  priority?: boolean;
}

export function Logo({ variant = "lockup", className, priority = false }: LogoProps) {
  const asset = logoAssets[variant];
  return (
    <Image
      src={asset.src}
      width={asset.width}
      height={asset.height}
      alt={siteConfig.name}
      priority={priority}
      sizes="128px"
      className={cn("w-auto", className)}
    />
  );
}
