import Image from "next/image";
import type { ImageAsset } from "@/shared/types/common";

/**
 * Renders a content image with its real dimensions (no layout shift) and its supplied alt text.
 * Only site-relative sources with known dimensions are rendered: remote hosts must be allow-listed in
 * `next.config.ts` first, so until then they render nothing rather than failing at runtime.
 */
export function ContentImage({ image, sizes, priority = false }: { image: ImageAsset; sizes: string; priority?: boolean }) {
  const isLocal = image.src.startsWith("/") && !image.src.startsWith("//");
  if (!isLocal || !image.width || !image.height) return null;
  return (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      sizes={sizes}
      priority={priority}
      className="h-auto w-full rounded-lg border border-border"
    />
  );
}
