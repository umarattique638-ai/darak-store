"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuArrowRight, LuPlus } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n, useLocalized } from "@/i18n/client";
import { Price } from "@/components/ui/Price";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { toast } from "@/lib/toast";
import { cn, imageUrl } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

export type LookSpot = { product: ProductDTO; x: number; y: number };

/** Interactive room: pulsing hotspots open a mini product card (price, view, add to cart). */
export function ShopTheLook({ image, spots }: { image: string; spots: LookSpot[] }) {
  const { t } = useI18n();
  const L = useLocalized();
  const dispatch = useAppDispatch();
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } });
        tl.from("[data-look-img]", { clipPath: "inset(8% 8% 8% 8% round 2rem)", scale: 1.06, duration: 1.4, ease: "expo.out" })
          .from("[data-look-dot]", { scale: 0, opacity: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2.4)" }, "-=0.7")
          .from("[data-look-head] > *", { y: 24, opacity: 0, stagger: 0.08, duration: 0.8 }, 0);
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  if (!spots.length) return null;
  const cur = spots[active] ?? spots[0]!;
  const p = cur.product;
  // keep the card inside the image: open towards the centre
  const left = cur.x; // image is not mirrored in RTL, so positions are physical
  const cardSide = cur.x > 55 ? "right" : "left";

  const add = () => {
    dispatch(addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? "", price: p.price, color: p.colors[0]?.name ?? "", maxQty: p.stock }));
    toast.success(t.common.added, L(p.name));
  };

  return (
    <section ref={ref} className="py-24">
      <div className="container-x">
        <div data-look-head className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow">{t.home.lookEyebrow}</p>
            <h2 className="display mt-3 text-[clamp(2.2rem,4.5vw,3.6rem)]">{t.home.lookTitle}</h2>
            <p className="mt-3 text-mute">{t.home.lookText}</p>
          </div>
        </div>

        <div className="relative">
          <div data-look-img className="relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-surface">
            <Image src={image} alt="" fill unoptimized sizes="100vw" className="object-cover" />
          </div>

          {spots.map((s, i) => (
            <button
              key={s.product.id}
              data-look-dot
              type="button"
              onClick={() => setActive(i)}
              onMouseEnter={() => setActive(i)}
              aria-label={L(s.product.name)}
              aria-pressed={i === active}
              style={{ left: `${s.x}%`, top: `${s.y}%` }}
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
            >
              <span className={cn("absolute inset-0 rounded-full bg-white/70", i === active ? "animate-none" : "animate-ping")} />
              <span className={cn("relative grid size-9 place-items-center rounded-full border-2 border-white shadow-lg transition-all duration-300 md:size-10", i === active ? "scale-110 bg-accent text-white" : "bg-white/90 text-fg group-hover:scale-110")}>
                <LuPlus className={cn("size-4 transition-transform duration-300", i === active && "rotate-45")} />
              </span>
            </button>
          ))}

          {/* floating card (desktop) */}
          <div
            key={p.id}
            className="pointer-events-auto absolute z-20 hidden w-80 animate-[toastIn_.35s] md:block"
            style={{ top: `${Math.min(Math.max(cur.y, 22), 70)}%`, [cardSide === "left" ? "left" : "right"]: cardSide === "left" ? `calc(${left}% + 32px)` : `calc(${100 - left}% + 32px)` }}
          >
            <LookCard product={p} onAdd={add} viewLabel={t.home.lookView} addLabel={t.common.addToCart} />
          </div>
        </div>

        {/* mobile: card under the image */}
        <div className="mt-5 md:hidden">
          <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
            {spots.map((s, i) => (
              <button key={s.product.id} onClick={() => setActive(i)} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", i === active ? "border-fg bg-fg text-page" : "border-line bg-white")}>
                {L(s.product.name)}
              </button>
            ))}
          </div>
          <LookCard key={p.id} product={p} onAdd={add} viewLabel={t.home.lookView} addLabel={t.common.addToCart} />
        </div>
      </div>
    </section>
  );
}

function LookCard({ product: p, onAdd, viewLabel, addLabel }: { product: ProductDTO; onAdd: () => void; viewLabel: string; addLabel: string }) {
  const L = useLocalized();
  return (
    <div className="flex gap-4 rounded-2xl bg-page/95 p-3 shadow-[0_30px_60px_-30px_rgba(29,27,25,0.6)] ring-1 ring-black/5 backdrop-blur animate-[fadeIn_.3s]">
      <Link href={`/shop/${p.slug}`} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface">
        {p.images[0] && <Image src={imageUrl(p.images[0].url, 240)} alt="" fill unoptimized sizes="96px" className="object-cover transition-transform duration-500 hover:scale-110" />}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="text-[11px] tracking-wide text-mute uppercase">{L(p.category.name)}</p>
        <Link href={`/shop/${p.slug}`} className="font-display text-[17px] leading-snug hover:text-accent">{L(p.name)}</Link>
        <Price amount={p.price} compareAt={p.compareAtPrice} className="mt-1 text-sm" />
        <div className="mt-auto flex items-center gap-3 pt-2 text-[13px] font-semibold">
          <Link href={`/shop/${p.slug}`} className="inline-flex items-center gap-1 whitespace-nowrap text-accent hover:underline">{viewLabel} <LuArrowRight className="size-3.5 flip-rtl" /></Link>
          {p.inStock && <button onClick={onAdd} className="whitespace-nowrap text-fg/70 hover:text-fg">+ {addLabel}</button>}
        </div>
      </div>
    </div>
  );
}
