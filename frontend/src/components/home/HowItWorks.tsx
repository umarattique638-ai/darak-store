"use client";

import { useRef } from "react";
import { LuBanknote, LuMapPinned, LuSofa, LuTruck } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/client";

const ICONS = [LuSofa, LuBanknote, LuMapPinned, LuTruck];

/** Four steps joined by a line that draws itself as you scroll. */
export function HowItWorks() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-how-line]", { scaleX: 0, duration: 1.6, ease: "power2.inOut", scrollTrigger: { trigger: ref.current, start: "top 70%", once: true } });
        gsap.from("[data-how-step]", { y: 40, opacity: 0, stagger: 0.12, duration: 0.9, ease: "expo.out", scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <section ref={ref} className="py-24">
      <div className="container-x">
        <div className="max-w-xl">
          <p className="eyebrow">{t.home.howEyebrow}</p>
          <h2 className="display mt-3 text-[clamp(2.2rem,4.5vw,3.6rem)]">{t.home.howTitle}</h2>
        </div>
        <div className="relative mt-14">
          <span data-how-line aria-hidden className="absolute inset-x-[12%] top-8 hidden h-0.5 origin-left bg-gradient-to-r from-accent via-gold to-accent lg:block rtl:origin-right" />
          <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {t.home.how.map((s, i) => {
              const Icon = ICONS[i] ?? LuSofa;
              return (
                <li key={s.t} data-how-step className="group text-center">
                  <span className="relative mx-auto grid size-16 place-items-center rounded-2xl bg-page text-accent shadow-[0_18px_40px_-24px_rgba(138,21,56,0.7)] ring-1 ring-line transition-all duration-500 group-hover:-translate-y-1 group-hover:bg-accent group-hover:text-white">
                    <Icon className="size-7" />
                    <span className="absolute -end-2 -top-2 grid size-6 place-items-center rounded-full bg-fg text-[11px] font-bold text-page">{i + 1}</span>
                  </span>
                  <h3 className="mt-6 font-display text-[21px]">{s.t}</h3>
                  <p className="mx-auto mt-2 max-w-[16rem] text-[14.5px] leading-relaxed text-mute">{s.d}</p>
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
