import Image from "next/image";
import { cn } from "@/lib/utils";
import { ComingSoonImage } from "@/components/site/coming-soon-image";

/** Article artwork with a designed fallback while imagery is pending. */
export function ArticleImage({
  src,
  alt = "",
  className,
  imgClassName,
}: {
  src?: string;
  alt?: string;
  className?: string;
  imgClassName?: string;
}) {
  if (!src) {
    return (
      <ComingSoonImage
        label="Article image coming soon"
        className={cn("rounded-none border-0", className)}
      />
    );
  }
  return (
    <div className={cn("overflow-hidden", className)}>
      <Image
        src={src}
        alt={alt}
        width={800}
        height={500}
        className={cn("size-full object-cover", imgClassName)}
      />
    </div>
  );
}
