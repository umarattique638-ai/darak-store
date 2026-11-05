"use client";

import { useRef } from "react";
import Image from "next/image";
import { LuPencilRuler } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/client";
import { ButtonLink } from "@/components/ui/Button";

/** Dark full-bleed banner with a slow parallax image and drawing "blueprint" lines. */
export function CustomBanner() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo("[data-cb-img]", { yPercent: -10 }, { yPercent: 10, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.from("[data-cb-line]", { strokeDashoffset: 800, duration: 2.4, ease: "power2.inOut", stagger: 0.2, scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
        gsap.from("[data-cb-text] > *", { y: 30, opacity: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="relative overflow-hidden bg-dark py-28 text-page">
      <div className="absolute inset-0 opacity-40">
        <div data-cb-img className="absolute -inset-y-[12%] inset-x-0">
          <Image src={"/images/scenes/living-wide.webp"} alt="" fill unoptimized sizes="100vw" className="object-cover" />
        </div>
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/85 to-dark/30 rtl:bg-gradient-to-l" />
      <svg aria-hidden viewBox="0 0 600 400" className="absolute end-[4%] top-1/2 hidden w-[42%] -translate-y-1/2 text-gold/70 lg:block" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path data-cb-line strokeDasharray="800" d="M60 300h480M80 300V200q0-40 40-40h360q40 0 40 40v100M120 160v-50q0-30 30-30h300q30 0 30 30v50" />
        <path data-cb-line strokeDasharray="800" d="M90 300v40M510 300v40M60 360h480" strokeDashoffset="0" opacity=".6" />
        <path data-cb-line strokeDasharray="800" d="M60 320l-20 0M540 320l20 0M300 60v-30m-15 0h30" opacity=".7" />
      </svg>
      <div data-cb-text className="container-x relative max-w-3xl">
        <span className="inline-grid size-14 place-items-center rounded-2xl bg-accent"><LuPencilRuler className="size-6" /></span>
        <p className="eyebrow mt-8">{t.home.customEyebrow}</p>
        <h2 className="display mt-4 text-[clamp(2.4rem,5vw,4.4rem)]">{t.home.customTitle}</h2>
        <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-page/70">{t.home.customText}</p>
        <ButtonLink href="/custom-design" variant="light" size="lg" className="mt-10">{t.home.customCta}</ButtonLink>
      </div>
    </section>
  );
}
