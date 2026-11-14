"use client";

import { useEffect, useRef, useState } from "react";
import { LuPencilRuler, LuRuler, LuPenTool, LuHammer } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n, useLocalized } from "@/i18n/client";
import { ButtonLink } from "@/components/ui/Button";
import { Crossfade } from "@/components/ui/Crossfade";
import { customSteps } from "@/content/showcase";
import { cn } from "@/lib/utils";

const STEP_ICONS = [LuPenTool, LuRuler, LuHammer];
// The big image changes with each step.
const STEP_IMAGES = ["/images/scenes/living-wide.webp", "/images/home/office.webp", "/images/scenes/dining.webp"];
const STEP_MS = 4200;

/** "Made to order": steps highlight one after another, each with its own image and a progress line. */
export function CustomBanner() {
  const { t } = useI18n();
  const L = useLocalized();
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % customSteps.length), STEP_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 72%", once: true } });
        tl.from("[data-cb-text] > *", { y: 30, opacity: 0, duration: 0.9, stagger: 0.1, ease: "expo.out" })
          .from("[data-cb-step]", { x: -30, opacity: 0, duration: 0.8, stagger: 0.12, ease: "expo.out" }, "-=0.5")
          .from("[data-cb-main]", { clipPath: "inset(100% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" }, 0.1)
          .from("[data-cb-side]", { y: 90, opacity: 0, duration: 1.2, ease: "expo.out" }, 0.45)
          .from("[data-cb-draw]", { strokeDashoffset: 1, duration: 2, ease: "power2.inOut" }, 0.2)
          .from("[data-cb-badge]", { scale: 0.5, opacity: 0, duration: 0.8, ease: "back.out(1.8)" }, 1.2);
        gsap.fromTo("[data-cb-par]", { yPercent: -8 }, { yPercent: 8, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
        gsap.to("[data-cb-badge]", { y: -10, duration: 2.4, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-surface py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x grid items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div data-cb-text>
          <span className="inline-grid size-14 place-items-center rounded-2xl bg-accent text-page"><LuPencilRuler className="size-6" /></span>
          <p className="eyebrow mt-8">{t.home.customEyebrow}</p>
          <h2 className="display mt-4 text-[clamp(2.2rem,4.5vw,3.9rem)]">{t.home.customTitle}</h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-mute">{t.home.customText}</p>

          <ol className="mt-10 grid gap-4">
            {customSteps.map((s, i) => {
              const Icon = STEP_ICONS[i]!;
              const on = i === active;
              return (
                <li
                  data-cb-step
                  key={s.title.en}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-700",
                    on ? "border-accent bg-page shadow-[0_24px_50px_-30px_rgba(138,21,56,0.45)]" : "border-line bg-page/50 hover:bg-page",
                  )}
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-700", on ? "bg-accent text-page" : "bg-fg text-page")}>
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="font-display text-[19px] leading-tight">{L(s.title)}</p>
                    <p className="mt-1 text-[14.5px] leading-relaxed text-mute">{L(s.text)}</p>
                  </div>
                  {on && <span key={active} className="cb-fill absolute inset-x-0 bottom-0 h-[3px] origin-left bg-accent" />}
                </li>
              );
            })}
          </ol>

          <ButtonLink href="/custom-design" size="lg" className="mt-10">{t.home.customCta}</ButtonLink>
        </div>

        <div className="relative mx-auto h-[520px] w-full max-w-[600px] sm:h-[600px]">
          <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute -start-[4%] -top-[4%] size-[92%] overflow-visible text-gold">
            <rect data-cb-draw pathLength={1} x="1" y="1" width="98" height="98" fill="none" stroke="currentColor" strokeWidth="0.6" vectorEffect="non-scaling-stroke" style={{ strokeDasharray: 1 }} />
          </svg>

          <div data-cb-main className="absolute inset-y-0 end-0 w-[80%] overflow-hidden rounded-[2.5rem_2.5rem_10rem_2.5rem] rtl:rounded-[2.5rem_2.5rem_2.5rem_10rem]">
            <div data-cb-par className="absolute -inset-y-[8%] inset-x-0">
              <Crossfade src={STEP_IMAGES[active]!} />
            </div>
          </div>

          <div data-cb-side className="absolute start-0 bottom-[4%] h-[46%] w-[48%] overflow-hidden rounded-[2rem] border-[6px] border-surface shadow-2xl">
            <Crossfade src="/images/home/shelves.webp" />
          </div>

          <div data-cb-badge className="absolute end-[4%] top-[8%] flex items-center gap-3 rounded-2xl bg-page px-5 py-4 shadow-[0_24px_50px_-24px_rgba(29,27,25,0.5)]">
            <span className="grid size-10 place-items-center rounded-full bg-accent text-page"><LuRuler className="size-5" /></span>
            <div>
              <p className="font-display text-lg leading-tight">{L({ en: "Quote in 2 days", ar: "عرض سعر خلال يومين" })}</p>
              <p className="text-[12.5px] text-mute">{L({ en: "Free site measurement", ar: "قياس مجاني للموقع" })}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
