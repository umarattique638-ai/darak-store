"use client";

import { useState } from "react";
import { LuCheck, LuShieldCheck, LuTruck } from "react-icons/lu";
import { useI18n, useLocalized } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { useAppDispatch } from "@/store/hooks";
import { addItem } from "@/store/cartSlice";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { QtyStepper } from "@/components/cart/QtyStepper";
import { WishlistButton } from "./WishlistButton";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

export function ProductPurchase({ product: p }: { product: ProductDTO }) {
  const { t } = useI18n();
  const L = useLocalized();
  const dispatch = useAppDispatch();
  const [color, setColor] = useState(p.colors[0]?.name ?? "");
  const [qty, setQty] = useState(1);
  const [open, setOpen] = useState<"desc" | "details" | "delivery" | null>("desc");
  const max = Math.min(20, p.stock);

  const add = () => {
    dispatch(addItem({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0]?.url ?? "", price: p.price, color, maxQty: p.stock, quantity: qty }));
    toast.success(t.common.added, L(p.name));
  };

  const dims = p.dimensions;
  const sections = [
    { id: "desc" as const, title: t.product.description, body: <p className="whitespace-pre-line">{L(p.description)}</p> },
    {
      id: "details" as const,
      title: t.product.details,
      body: (
        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2">
          {dims.width > 0 && (<><dt className="text-mute">{t.common.dimensions}</dt><dd>{dims.width} × {dims.depth} × {dims.height} {t.common.cm}</dd></>)}
          {p.materials.length > 0 && (<><dt className="text-mute">{t.common.materials}</dt><dd>{p.materials.map((m) => t.materials[m as keyof typeof t.materials] ?? m).join(", ")}</dd></>)}
          <dt className="text-mute">{t.common.sku}</dt><dd className="font-mono text-[13px]">{p.sku}</dd>
        </dl>
      ),
    },
    { id: "delivery" as const, title: t.product.delivery, body: <p>{t.product.deliveryText}</p> },
  ];

  return (
    <div className="lg:sticky lg:top-28">
      <p className="eyebrow">{L(p.category.name)}</p>
      <h1 className="display mt-3 text-[clamp(2.2rem,4vw,3.4rem)]">{L(p.name)}</h1>
      <Price amount={p.price} compareAt={p.compareAtPrice} className="mt-5 text-2xl" />
      <p className={cn("mt-3 inline-flex items-center gap-2 text-sm font-semibold", p.inStock ? (p.lowStock ? "text-accent" : "text-success") : "text-mute")}>
        <span className={cn("size-2 rounded-full", p.inStock ? (p.lowStock ? "bg-accent animate-pulse" : "bg-success") : "bg-mute")} />
        {p.inStock ? (p.lowStock ? fill(t.common.onlyLeft, { n: p.stock }) : t.common.inStock) : t.common.outOfStock}
      </p>

      {p.colors.length > 0 && (
        <fieldset className="mt-8">
          <legend className="mb-3 text-sm font-semibold">{t.common.color}: <span className="font-normal text-mute">{color}</span></legend>
          <div className="flex flex-wrap gap-3">
            {p.colors.map((c) => (
              <button key={c.name} onClick={() => setColor(c.name)} aria-label={c.name} aria-pressed={color === c.name} title={c.name} className={cn("grid size-11 place-items-center rounded-full ring-offset-2 ring-offset-page transition-all", color === c.name ? "ring-2 ring-fg" : "ring-1 ring-line hover:ring-fg/40")}>
                <span className="grid size-9 place-items-center rounded-full border border-black/10" style={{ background: c.hex }}>{color === c.name && <LuCheck className="size-4 text-white mix-blend-difference" />}</span>
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-8 flex flex-wrap gap-3">
        <QtyStepper value={qty} max={Math.max(1, max)} onChange={setQty} size="lg" />
        <Button size="lg" className="flex-1" disabled={!p.inStock} onClick={add}>{p.inStock ? t.common.addToCart : t.common.outOfStock}</Button>
        <WishlistButton productId={p.id} className="size-14 border border-line" />
      </div>

      <ul className="mt-8 grid gap-3 rounded-2xl bg-surface p-5 text-sm sm:grid-cols-2">
        <li className="flex items-center gap-3"><LuTruck className="size-5 shrink-0 text-accent" />{t.home.perks[0]!.t}</li>
        <li className="flex items-center gap-3"><LuShieldCheck className="size-5 shrink-0 text-accent" />{t.home.perks[3]!.t}</li>
      </ul>

      <div className="mt-8 divide-y divide-line border-y border-line">
        {sections.map((s) => (
          <div key={s.id}>
            <button onClick={() => setOpen(open === s.id ? null : s.id)} aria-expanded={open === s.id} className="flex w-full items-center justify-between py-5 text-start font-semibold">
              {s.title}
              <span className={cn("relative size-4 transition-transform duration-500", open === s.id && "rotate-45")}><span className="absolute inset-x-0 top-1/2 h-px bg-current" /><span className="absolute inset-y-0 start-1/2 w-px bg-current" /></span>
            </button>
            <div className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]", open === s.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
              <div className="overflow-hidden"><div className="pb-6 text-[15px] leading-relaxed text-fg/80">{s.body}</div></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
