"use client";

import Link from "next/link";
import Image from "next/image";
import { LuArrowUpRight } from "react-icons/lu";
import { useI18n, useLocalized } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn, imageUrl } from "@/lib/utils";
import type { CategoryDTO } from "@/types/api";

/** Bento grid: the first two categories get the large tiles. */
export function Categories({ categories }: { categories: CategoryDTO[] }) {
  const { t } = useI18n();
  const L = useLocalized();
  if (!categories.length) return null;
  return (
    <section className="py-24">
      <div className="container-x">
        <SectionHeading eyebrow={t.home.categoriesEyebrow} title={t.home.categoriesTitle} />
        <Reveal as="ul" stagger className="mt-14 grid auto-rows-[220px] grid-cols-2 gap-4 md:auto-rows-[260px] md:grid-cols-4">
          {categories.slice(0, 6).map((c, i) => (
            <li key={c.id} className={cn(i === 0 && "col-span-2 row-span-2", i === 1 && "md:row-span-2")}>
              <Link href={`/shop?category=${c.slug}`} className="group relative block h-full overflow-hidden rounded-3xl bg-surface">
                {c.image && <Image src={imageUrl(c.image, i < 2 ? 1000 : 600)} alt="" fill unoptimized sizes="(max-width:768px) 100vw, 50vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110" />}
                <div className="absolute inset-0 bg-gradient-to-t from-fg/70 via-fg/10 to-transparent transition-opacity duration-500 group-hover:from-accent/80" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-page md:p-6">
                  <div>
                    <h3 className={cn("font-display leading-tight", i === 0 ? "text-[34px]" : "text-[22px]")}>{L(c.name)}</h3>
                    {c.productCount !== undefined && <p className="mt-1 text-[13px] text-page/75">{fill("{n}", { n: c.productCount })} {t.common.items}</p>}
                  </div>
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-page text-fg transition-transform duration-500 group-hover:rotate-45"><LuArrowUpRight className="size-5 flip-rtl" /></span>
                </div>
              </Link>
            </li>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
