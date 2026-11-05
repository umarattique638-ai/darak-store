"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuShoppingBag, LuTrash2, LuX } from "react-icons/lu";
import { useI18n, useLocalized } from "@/i18n/client";
import { fill, formatMoney } from "@/i18n/format";
import { useAppDispatch, useCart } from "@/store/hooks";
import { removeItem, setCartOpen, setQuantity } from "@/store/cartSlice";
import { useSettingsQuery } from "@/store/api";
import { QtyStepper } from "./QtyStepper";
import { ButtonLink } from "@/components/ui/Button";
import { cn, imageUrl } from "@/lib/utils";

export function CartDrawer() {
  const { t, locale } = useI18n();
  const L = useLocalized();
  const dispatch = useAppDispatch();
  const { items, open } = useCart();
  const { data: settings } = useSettingsQuery();
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const freeOver = settings?.freeShippingOver ?? 2000;
  const left = Math.max(0, freeOver - subtotal);
  const close = () => dispatch(setCartOpen(false));

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={t.cart.title}>
      <button aria-label={t.nav.close} onClick={close} className="absolute inset-0 animate-[fadeIn_.3s] bg-fg/40 backdrop-blur-sm" />
      <aside className="absolute inset-y-0 end-0 flex w-full max-w-md animate-[slideIn_.45s_var(--ease-out-expo)] flex-col bg-page shadow-2xl rtl:animate-[slideInRtl_.45s_var(--ease-out-expo)]">
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-2xl">{t.cart.title}</h2>
          <button onClick={close} aria-label={t.nav.close} className="grid size-10 place-items-center rounded-full hover:bg-surface"><LuX className="size-5" /></button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <span className="grid size-20 place-items-center rounded-full bg-surface"><LuShoppingBag className="size-8 text-mute" /></span>
            <p className="font-display text-xl">{t.cart.empty}</p>
            <p className="text-sm text-mute">{t.cart.emptyText}</p>
            <ButtonLink href="/shop" onClick={close}>{t.common.shopNow}</ButtonLink>
          </div>
        ) : (
          <>
            <div className="px-6 pt-5">
              <p className="text-[13px] font-medium text-fg/80">{left > 0 ? fill(t.cart.freeShipLeft, { amount: formatMoney(left, locale) }) : t.cart.freeShipOk}</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-sand"><div className="h-full rounded-full bg-accent transition-[width] duration-700" style={{ width: `${Math.min(100, (subtotal / freeOver) * 100)}%` }} /></div>
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((i) => (
                <li key={i.key} className="flex gap-4 py-5">
                  <Link href={`/shop/${i.slug}`} onClick={close} className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-surface">
                    {i.image && <Image src={imageUrl(i.image, 240)} alt="" fill unoptimized className="object-cover" sizes="96px" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/shop/${i.slug}`} onClick={close} className="font-display text-[16px] leading-snug hover:text-accent">{L(i.name)}</Link>
                      <button onClick={() => dispatch(removeItem(i.key))} aria-label={t.cart.remove} className="text-mute hover:text-red-600"><LuTrash2 className="size-4" /></button>
                    </div>
                    {i.color && <p className="text-xs text-mute">{t.common.color}: {i.color}</p>}
                    <div className="mt-auto flex items-center justify-between pt-3">
                      <QtyStepper size="sm" value={i.quantity} max={Math.max(1, Math.min(20, i.maxQty))} onChange={(v) => dispatch(setQuantity({ key: i.key, quantity: v }))} />
                      <span className="text-sm font-semibold">{formatMoney(i.price * i.quantity, locale)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <footer className="space-y-4 border-t border-line px-6 py-5">
              <div className="flex items-center justify-between text-[15px]"><span className="text-mute">{t.common.subtotal}</span><span className="font-semibold">{formatMoney(subtotal, locale)}</span></div>
              <div className="grid gap-2">
                <ButtonLink href="/checkout" onClick={close} size="lg" className="w-full">{t.cart.checkout}</ButtonLink>
                <ButtonLink href="/cart" onClick={close} variant="outline" className={cn("w-full")}>{t.cart.title}</ButtonLink>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
