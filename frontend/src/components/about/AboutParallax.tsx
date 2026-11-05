"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import { imageUrl } from "@/lib/utils";

/** Wide image that reveals with a clip-path wipe and drifts slowly on scroll. */
export function AboutParallax({ src }: { src: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(ref.current, { clipPath: "inset(12% 12% 12% 12% round 3rem)", duration: 1.6, ease: "expo.out", scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } });
        gsap.fromTo("img", { yPercent: -8, scale: 1.15 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <div ref={ref} className="relative aspect-[16/8] overflow-hidden rounded-[2rem] [clip-path:inset(0_0_0_0_round_2rem)]">
      <Image src={imageUrl(src, 1800)} alt="" fill unoptimized sizes="100vw" className="object-cover" />
    </div>
  );
}
