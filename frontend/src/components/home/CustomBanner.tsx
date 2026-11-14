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
// One image per step. Only this one is shown at a time.
const STEP_IMAGES = ["/images/scenes/living-wide.webp", "/images/home/office.webp", "/images/scenes/dining.webp"];
const STEP_MS = 4200;

/** "Made to order": steps highlight one after another; the right side shows a single image for the active step. */
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
        gsap.from("[data-cb-main]", {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 1.2,
          ease: "expo.inOut",
          scrollTrigger: { trigger: ref.current, start: "top 72%", once: true },
        });
        gsap.fromTo("[data-cb-par]", { yPercent: -6 }, { yPercent: 6, ease: "none", scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true } });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const Icon = STEP_ICONS[active]!;

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-surface py-28"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="container-x grid items-center gap-16 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
        <div>
          <span className="inline-grid size-14 place-items-center rounded-2xl bg-accent text-page"><LuPencilRuler className="size-6" /></span>
          <p className="eyebrow mt-8">{t.home.customEyebrow}</p>
          <h2 className="display mt-4 text-[clamp(2.2rem,4.5vw,3.9rem)]">{t.home.customTitle}</h2>
          <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-mute">{t.home.customText}</p>

          <ol className="mt-10 grid gap-4">
            {customSteps.map((s, i) => {
              const StepIcon = STEP_ICONS[i]!;
              const on = i === active;
              return (
                <li
                  key={s.title.en}
                  onClick={() => setActive(i)}
                  className={cn(
                    "relative flex cursor-pointer items-start gap-4 overflow-hidden rounded-2xl border p-5 transition-all duration-700",
                    on ? "border-accent bg-page shadow-[0_24px_50px_-30px_rgba(14,74,59,0.45)]" : "border-line bg-page/50 hover:bg-page",
                  )}
                >
                  <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl transition-colors duration-700", on ? "bg-accent text-page" : "bg-fg text-page")}>
                    <StepIcon className="size-5" />
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

        <div data-cb-main className="relative mx-auto h-[480px] w-full max-w-[600px] overflow-hidden rounded-[2.5rem] sm:h-[560px]">
          <div data-cb-par className="absolute -inset-y-[8%] inset-x-0">
            <Crossfade src={STEP_IMAGES[active]!} />
          </div>
          <div className="absolute inset-x-5 bottom-5 flex items-center gap-3 rounded-2xl bg-page/95 px-4 py-3 shadow-lg backdrop-blur">
            <span className="grid size-9 place-items-center rounded-full bg-accent text-page"><Icon className="size-4" /></span>
            <p className="font-display text-[17px] leading-tight">{L(customSteps[active]!.title)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
