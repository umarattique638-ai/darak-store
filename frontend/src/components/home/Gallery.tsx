"use client";

import Image from "next/image";
import { LuCamera } from "react-icons/lu";
import { useLocalized } from "@/i18n/client";
import { Reveal } from "@/components/ui/Reveal";
import { gallery } from "@/content/showcase";
import { imageUrl } from "@/lib/utils";

/** "A glimpse of what we make": image grid with a short intro and a caption on each card. */
export function Gallery() {
  const L = useLocalized();
  return (
    <section className="container-x py-24">
      <div className="mb-12 max-w-2xl">
        <p className="eyebrow inline-flex items-center gap-2"><LuCamera className="size-4" />{L({ en: "From our range", ar: "من أعمالنا" })}</p>
        <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">{L({ en: "A glimpse of what we make", ar: "لمحة من منتجاتنا" })}</h2>
        <p className="mt-4 leading-relaxed text-mute">
          {L({
            en: "Every piece can be adjusted to your size, colour and budget. Here are some examples from our showroom and workshop.",
            ar: "كل قطعة يمكن تعديلها حسب مقاسك ولونك وميزانيتك. هذه أمثلة من مجموعتنا في المعرض والورشة.",
          })}
        </p>
      </div>
      <Reveal as="ul" stagger className="grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-3 md:auto-rows-[260px]">
        {gallery.map((g, i) => (
          <li key={g.image} className={i === 0 ? "md:row-span-2" : undefined}>
            <div className="group relative h-full overflow-hidden rounded-3xl bg-surface">
              <Image src={imageUrl(g.image, 800)} alt="" fill unoptimized sizes="(max-width:768px) 50vw, 33vw" className="object-cover transition-transform duration-[1200ms] ease-[var(--ease-out-expo)] group-hover:scale-110" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-fg/85 via-fg/40 to-transparent p-5 pt-16">
                <p className="font-display text-[19px] text-page">{L(g.label)}</p>
                <p className="mt-1 max-w-xs text-[13px] leading-snug text-page/80 md:translate-y-1 md:opacity-0 md:transition-all md:duration-500 md:group-hover:translate-y-0 md:group-hover:opacity-100">{L(g.desc)}</p>
              </div>
            </div>
          </li>
        ))}
      </Reveal>
    </section>
  );
}
