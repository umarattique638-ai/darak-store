"use client";

import Link from "next/link";
import Image from "next/image";
import { LuArrowUpRight } from "react-icons/lu";
import { useLocalized } from "@/i18n/client";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { imageUrl } from "@/lib/utils";
import { services, showcaseHeading } from "@/content/showcase";

/** Card grid listing every category Al Sharq Exhibition offers. */
export function ServicesGrid() {
  const L = useLocalized();
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading eyebrow={L(showcaseHeading.eyebrow)} title={L(showcaseHeading.title)} text={L(showcaseHeading.text)} />
        <Reveal as="ul" stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {services.map((s) => (
            <li key={s.title.en}>
              <Link href={s.href} className="group flex h-full flex-col overflow-hidden rounded-3xl border border-line bg-page transition-shadow duration-500 hover:shadow-[0_30px_60px_-30px_rgba(29,27,25,0.35)]">
                <div className="relative aspect-[4/3] overflow-hidden bg-surface">
                  <Image src={imageUrl(s.image, 700)} alt="" fill unoptimized sizes="(max-width:640px) 100vw, (max-width:1280px) 50vw, 25vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-display text-[22px] leading-tight">{L(s.title)}</h3>
                    <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line text-fg transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:text-accent"><LuArrowUpRight className="size-4 flip-rtl" /></span>
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-mute">{L(s.text)}</p>
                </div>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
