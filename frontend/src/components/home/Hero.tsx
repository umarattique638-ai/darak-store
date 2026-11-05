"use client";

import { useRef } from "react";
import Image from "next/image";
import { LuArrowRight, LuStar } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/client";
import { ButtonLink } from "@/components/ui/Button";
import { imageUrl } from "@/lib/utils";

// 3D-rendered scenes bundled in /public/images/scenes
const IMGS = { main: "/images/scenes/hero-living.webp", chair: "/images/scenes/hero-chair.webp", detail: "/images/scenes/hero-detail.webp" };

/** Editorial hero: staggered headline, image collage with parallax and a floating rating card. */
export function Hero() {
  const { t } = useI18n();
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
        tl.from("[data-h-line] > span", { yPercent: 110, duration: 1.3, stagger: 0.09 })
          .from("[data-h-fade]", { y: 24, opacity: 0, duration: 1, stagger: 0.08 }, 0.35)
          .from("[data-h-main]", { clipPath: "inset(100% 0 0 0)", duration: 1.6, ease: "expo.inOut" }, 0)
          .from("[data-h-main] img", { scale: 1.3, duration: 2.2 }, 0)
          .from("[data-h-side]", { y: 80, opacity: 0, duration: 1.4, stagger: 0.15 }, 0.5)
          .from("[data-h-badge]", { scale: 0.6, opacity: 0, duration: 0.9, ease: "back.out(1.8)" }, 1.1);
        gsap.to("[data-h-main] img", { yPercent: 12, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        gsap.to("[data-h-side='1']", { yPercent: -25, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true } });
        gsap.to("[data-h-badge]", { y: -10, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: -1, delay: 2 });
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  const words = t.home.heroTitle.split(" ");
  const mid = Math.ceil(words.length / 2);
  const lines = [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];

  return (
    <section ref={root} className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
      <div aria-hidden className="grain absolute inset-0 opacity-60 [mask-image:radial-gradient(60%_60%_at_20%_30%,#000,transparent)]" />
      <div className="container-x relative grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
        <div>
          <p data-h-fade className="eyebrow">{t.home.heroEyebrow}</p>
          <h1 className="display mt-5 text-[clamp(3rem,7vw,6.4rem)]">
            {lines.map((l, i) => (
              <span key={i} data-h-line className="block overflow-hidden pb-1">
                <span className={i === 1 ? "block italic text-accent" : "block"}>{l}</span>
              </span>
            ))}
          </h1>
          <p data-h-fade className="mt-7 max-w-lg text-[17px] leading-relaxed text-mute">{t.home.heroText}</p>
          <div data-h-fade className="mt-9 flex flex-wrap gap-3">
            <ButtonLink href="/shop" size="lg">{t.home.heroCta} <LuArrowRight className="size-4 flip-rtl transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" /></ButtonLink>
            <ButtonLink href="/custom-design" size="lg" variant="outline">{t.home.heroCta2}</ButtonLink>
          </div>
          <dl data-h-fade className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-7">
            {t.home.stats.map((s) => (
              <div key={s.l} className="flex flex-col-reverse gap-1">
                <dt className="text-[12.5px] text-mute">{s.l}</dt>
                <dd className="font-display text-2xl">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="relative mx-auto h-[520px] w-full max-w-[560px] sm:h-[600px]">
          <div data-h-main className="absolute inset-y-0 end-0 w-[78%] overflow-hidden rounded-[2.5rem_2.5rem_10rem_2.5rem] rtl:rounded-[2.5rem_2.5rem_2.5rem_10rem]">
            <Image src={imageUrl(IMGS.main, 1100)} alt="" fill unoptimized priority sizes="(max-width:1024px) 80vw, 40vw" className="object-cover" />
          </div>
          <div data-h-side="1" className="absolute start-0 top-[12%] h-[38%] w-[42%] overflow-hidden rounded-[2rem] border-[6px] border-page shadow-2xl">
            <Image src={imageUrl(IMGS.chair, 600)} alt="" fill unoptimized sizes="25vw" className="object-cover" />
          </div>
          <div data-h-side="2" className="absolute start-[6%] bottom-[6%] h-[30%] w-[38%] overflow-hidden rounded-[2rem] border-[6px] border-page shadow-2xl">
            <Image src={imageUrl(IMGS.detail, 600)} alt="" fill unoptimized sizes="25vw" className="object-cover" />
          </div>
          <div data-h-badge className="absolute end-[-2%] bottom-[14%] rounded-2xl bg-page/95 px-5 py-4 shadow-[0_24px_50px_-24px_rgba(29,27,25,0.6)] backdrop-blur">
            <p className="flex gap-0.5 text-gold">{Array.from({ length: 5 }, (_, i) => <LuStar key={i} className="size-4 fill-current" />)}</p>
            <p className="mt-1.5 font-display text-lg">{t.home.perks[3]!.t}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
