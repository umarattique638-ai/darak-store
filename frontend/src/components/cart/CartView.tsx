"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuShoppingBag, LuTrash2, LuTriangleAlert } from "react-icons/lu";
import { useI18n, useLocalized } from "@/i18n/client";
import { fill, formatMoney } from "@/i18n/format";
import { useAppDispatch, useCart } from "@/store/hooks";
import { removeItem, setQuantity, syncFromQuote } from "@/store/cartSlice";
import { useQuoteMutation } from "@/store/api";
import { QtyStepper } from "./QtyStepper";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { imageUrl } from "@/lib/utils";

/** Full cart page. Prices/stock are re-checked with the server on load and on each change. */
export function CartView() {
  const { t, locale } = useI18n();
  const L = useLocalized();
  const dispatch = useAppDispatch();
  const { items, hydrated } = useCart();
  const [quote, { data: q, isLoading }] = useQuoteMutation();
  const sig = items.map((i) => `${i.key}x${i.quantity}`).join("|");

  useEffect(() => {
    if (!items.length) return;
    const h = setTimeout(() => {
      quote({ items: items.map((i) => ({ productId: i.productId, quantity: i.quantity, color: i.color })) })
        .unwrap()
        .then((r) => dispatch(syncFromQuote(r.lines.map((l) => ({ productId: l.product, unitPrice: l.unitPrice, stock: l.stock })))))
        .catch(() => undefined);
    }, 350);
    return () => clearTimeout(h);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sig]);

  if (!hydrated) return <div className="grid gap-4"><Skeleton className="h-32" /><Skeleton className="h-32" /></div>;
  if (!items.length)
    return (
      <div className="flex flex-col items-center py-20 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-surface"><LuShoppingBag className="size-10 text-mute" /></span>
        <h2 className="mt-6 font-display text-3xl">{t.cart.empty}</h2>
        <p className="mt-2 text-mute">{t.cart.emptyText}</p>
        <ButtonLink href="/shop" className="mt-8" size="lg">{t.common.shopNow}</ButtonLink>
      </div>
    );

  const subtotal = q?.subtotal ?? items.reduce((s, i) => s + i.price * i.quantity, 0);
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <ul className="divide-y divide-line border-y border-line">
        {items.map((i) => {
          const problem = q?.problems.find((p) => p.productId === i.productId);
          return (
            <li key={i.key} className="flex gap-5 py-6 animate-[fadeIn_.4s]">
              <Link href={`/shop/${i.slug}`} className="relative size-28 shrink-0 overflow-hidden rounded-2xl bg-surface sm:size-32">
                {i.image && <Image src={imageUrl(i.image, 300)} alt="" fill unoptimized sizes="128px" className="object-cover transition-transform duration-700 hover:scale-110" />}
              </Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex justify-between gap-4">
                  <div>
                    <Link href={`/shop/${i.slug}`} className="font-display text-xl hover:text-accent">{L(i.name)}</Link>
                    {i.color && <p className="mt-1 text-sm text-mute">{t.common.color}: {i.color}</p>}
                  </div>
                  <p className="font-semibold whitespace-nowrap">{formatMoney(i.price * i.quantity, locale)}</p>
                </div>
                {problem && <p className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-600"><LuTriangleAlert className="size-4" />{problem.message}</p>}
                <div className="mt-auto flex items-center justify-between pt-4">
                  <QtyStepper value={i.quantity} max={Math.max(1, Math.min(20, i.maxQty))} onChange={(v) => dispatch(setQuantity({ key: i.key, quantity: v }))} size="sm" />
                  <button onClick={() => dispatch(removeItem(i.key))} className="inline-flex items-center gap-1.5 text-sm text-mute hover:text-red-600"><LuTrash2 className="size-4" />{t.cart.remove}</button>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <aside className="h-fit rounded-3xl bg-surface p-7 lg:sticky lg:top-28">
        <h2 className="font-display text-2xl">{t.checkout.reviewTitle}</h2>
        <dl className="mt-6 space-y-3 text-[15px]">
          <div className="flex justify-between"><dt className="text-mute">{t.common.subtotal}</dt><dd>{formatMoney(subtotal, locale)}</dd></div>
          <div className="flex justify-between"><dt className="text-mute">{t.common.shipping}</dt><dd>{q ? (q.shippingFee ? formatMoney(q.shippingFee, locale) : t.common.free) : "…"}</dd></div>
          <div className="flex justify-between border-t border-line pt-4 text-lg font-bold"><dt>{t.common.total}</dt><dd>{q ? formatMoney(q.total, locale) : "…"}</dd></div>
        </dl>
        {q?.problems.length ? <p className="mt-4 text-sm text-red-600">{t.cart.review}</p> : null}
        <ButtonLink href="/checkout" size="lg" className="mt-7 w-full" aria-disabled={isLoading || !!q?.problems.length}>{t.cart.checkout}</ButtonLink>
        <Link href="/shop" className="mt-4 block text-center text-sm font-semibold text-mute hover:text-fg">{t.cart.continueShopping}</Link>
        <p className="mt-6 text-center text-xs text-mute">{fill("{a}", { a: t.footer.payments })}</p>
      </aside>
    </div>
  );
}
