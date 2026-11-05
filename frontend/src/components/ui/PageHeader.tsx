"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Inner-page header: headline rises line by line, supporting copy fades in. */
export function PageHeader({ eyebrow, title, text, children, className }: { eyebrow?: string; title: ReactNode; text?: ReactNode; children?: ReactNode; className?: string }) {
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-ph]", { y: 36, opacity: 0, duration: 1.1, ease: "expo.out", stagger: 0.09 });
        gsap.from("[data-ph-line]", { scaleX: 0, duration: 1.4, ease: "expo.inOut", delay: 0.2 });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className={cn("relative overflow-hidden pt-36 pb-12 lg:pt-44", className)}>
      <div aria-hidden className="grain absolute inset-0 opacity-50 [mask-image:radial-gradient(50%_70%_at_50%_0%,#000,transparent)]" />
      <div className="container-x relative">
        {eyebrow && <p data-ph className="eyebrow">{eyebrow}</p>}
        <h1 data-ph className="display mt-4 max-w-4xl text-[clamp(2.6rem,6vw,5rem)]">{title}</h1>
        {text && <p data-ph className="mt-5 max-w-2xl text-[17px] leading-relaxed text-mute">{text}</p>}
        {children && <div data-ph className="mt-8">{children}</div>}
        <span data-ph-line aria-hidden className="mt-12 block h-px origin-left bg-line rtl:origin-right" />
      </div>
    </section>
  );
}
