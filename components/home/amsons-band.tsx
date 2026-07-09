import Image from "next/image";
import { InfiniteSlider } from "@/components/ui/infinite-slider";
import { groupLogos } from "@/lib/site";

/** "Part of Amsons Group" floating logo cloud, adapted from the hero-1 logos section. */
export function AmsonsBand() {
  return (
    <section aria-label="Part of Amsons Group" className="border-b border-concrete-200 bg-white py-10">
      <div className="container-site space-y-6">
        <p className="text-eyebrow text-center text-concrete-600">
          Part of Amsons Group
        </p>
        <div className="mask-[linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] overflow-hidden">
          <InfiniteSlider gap={56} speed={70} speedOnHover={22}>
            {groupLogos.map((logo) => (
              <Image
                key={logo.alt}
                src={logo.src}
                alt={logo.alt}
                width={140}
                height={48}
                className="pointer-events-none h-10 w-auto select-none object-contain opacity-80 md:h-12"
              />
            ))}
          </InfiniteSlider>
        </div>
      </div>
    </section>
  );
}
