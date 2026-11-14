"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useLocalized } from "@/i18n/client";
import { ButtonLink } from "@/components/ui/Button";
import { cn, imageUrl } from "@/lib/utils";
import { banners } from "@/content/showcase";

const INTERVAL = 6000;

/** Auto-advancing banner carousel for the home page. Pauses on hover and focus. */
export function BannerCarousel() {
  const L = useLocalized();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % count), INTERVAL);
    return () => window.clearInterval(id);
  }, [paused, count]);

  const go = (d: number) => setIndex((i) => (i + d + count) % count);

  return (
    <section
      aria-roledescription="carousel"
      className="container-x"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative h-[460px] overflow-hidden rounded-[2rem] bg-surface md:h-[540px]">
        {banners.map((b, i) => {
          const active = i === index;
          return (
            <div
              key={b.title.en}
              aria-hidden={!active}
              className={cn("absolute inset-0 transition-opacity duration-[900ms] ease-out", active ? "opacity-100" : "pointer-events-none opacity-0")}
            >
              <Image
                src={imageUrl(b.image, 1400)}
                alt=""
                fill
                unoptimized
                priority={i === 0}
                sizes="(max-width:1280px) 100vw, 1280px"
                className={cn("object-cover transition-transform duration-[6000ms] ease-out", active ? "scale-105" : "scale-100")}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-fg/80 via-fg/30 to-transparent rtl:bg-gradient-to-t" />
              <div className={cn("absolute inset-x-0 bottom-0 max-w-2xl p-7 text-page transition-all duration-700 md:p-12", active ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0")}>
                <p className="eyebrow !text-page/80">{L(b.eyebrow)}</p>
                <h2 className="display mt-3 text-[clamp(1.9rem,4vw,3.4rem)] leading-[1.05]">{L(b.title)}</h2>
                <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-page/85">{L(b.text)}</p>
                <div className="mt-6">
                  <ButtonLink href={b.href} size="lg" variant="light" tabIndex={active ? 0 : -1}>{L(b.cta)}</ButtonLink>
                </div>
              </div>
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className="absolute start-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-page/90 text-fg shadow-lg transition hover:bg-page"
        >
          <LuChevronLeft className="size-5 flip-rtl" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className="absolute end-4 top-1/2 grid size-11 -translate-y-1/2 place-items-center rounded-full bg-page/90 text-fg shadow-lg transition hover:bg-page"
        >
          <LuChevronRight className="size-5 flip-rtl" />
        </button>

        <div className="absolute end-6 top-6 flex gap-2" role="tablist">
          {banners.map((b, i) => (
            <button
              key={b.title.en}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={cn("h-1.5 rounded-full transition-all duration-500", i === index ? "w-10 bg-page" : "w-4 bg-page/50 hover:bg-page/80")}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
