"use client";

import Link from "next/link";
import Image from "next/image";
import { LuPlus } from "react-icons/lu";
import { useI18n, useLocalized } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { Price } from "@/components/ui/Price";
import { WishlistButton } from "./WishlistButton";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { toast } from "@/lib/toast";
import { imageUrl } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

/** Grid card: image swaps to the 2nd photo on hover; quick-add slides up. */
export function ProductCard({ product: p, priority }: { product: ProductDTO; priority?: boolean }) {
  const { t } = useI18n();
  const L = useLocalized();
  const dispatch = useAppDispatch();
  const [img1, img2] = p.images;
  const discount = p.compareAtPrice && p.compareAtPrice > p.price ? Math.round((1 - p.price / p.compareAtPrice) * 100) : 0;

  const quickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(addItem({ productId: p.id, slug: p.slug, name: p.name, image: img1?.url ?? "", price: p.price, color: p.colors[0]?.name ?? "", maxQty: p.stock }));
    toast.success(t.common.added, L(p.name));
  };

  return (
    <article className="group relative">
      <Link href={`/shop/${p.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-surface">
          {img1 && <Image src={imageUrl(img1.url, 700)} alt={img1.alt || L(p.name)} fill unoptimized priority={priority} sizes="(max-width:768px) 50vw, 25vw" className="object-cover transition-all duration-[900ms] ease-[var(--ease-out-expo)] group-hover:scale-105" />}
          {img2 && <Image src={imageUrl(img2.url, 700)} alt="" fill unoptimized sizes="(max-width:768px) 50vw, 25vw" className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100" />}
          <div className="absolute start-3 top-3 flex flex-col gap-1.5">
            {discount > 0 && <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-bold text-white">−{discount}%</span>}
            {!p.inStock && <span className="rounded-full bg-fg px-2.5 py-1 text-[11px] font-bold text-page">{t.common.outOfStock}</span>}
            {p.inStock && p.lowStock && <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-bold text-accent">{fill(t.common.onlyLeft, { n: p.stock })}</span>}
          </div>
          <WishlistButton productId={p.id} className="absolute end-3 top-3 size-9 rounded-full bg-white/90 shadow-sm backdrop-blur hover:bg-white" />
          {p.inStock && (
            <button
              type="button"
              onClick={quickAdd}
              className="absolute inset-x-3 bottom-3 flex h-11 translate-y-3 items-center justify-center gap-2 rounded-full bg-fg/90 text-[13px] font-semibold text-page opacity-0 backdrop-blur transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0 group-hover:opacity-100 focus-visible:translate-y-0 focus-visible:opacity-100"
            >
              <LuPlus className="size-4" /> {t.common.addToCart}
            </button>
          )}
        </div>
        <div className="mt-4 space-y-1 px-0.5">
          <p className="text-[12px] font-semibold tracking-wide text-mute uppercase">{L(p.category.name)}</p>
          <h3 className="font-display text-[18px] leading-snug text-fg transition-colors group-hover:text-accent">{L(p.name)}</h3>
          <div className="flex items-center justify-between gap-2">
            <Price amount={p.price} compareAt={p.compareAtPrice} className="text-[15px]" />
            {p.colors.length > 1 && (
              <span className="flex -space-x-1 rtl:space-x-reverse">
                {p.colors.slice(0, 4).map((c) => <i key={c.hex + c.name} title={c.name} className="size-3.5 rounded-full ring-2 ring-page" style={{ background: c.hex }} />)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}
