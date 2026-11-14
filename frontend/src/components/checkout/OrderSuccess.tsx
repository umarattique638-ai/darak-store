"use client";

import { useRef } from "react";
import { LuCopy } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/client";
import { formatMoney } from "@/i18n/format";
import { useMyOrderQuery, useSettingsQuery } from "@/store/api";
import { ButtonLink } from "@/components/ui/Button";
import { toast } from "@/lib/toast";

/** Animated check mark that draws itself, then a confetti burst of brand-coloured dots. */
export function OrderSuccess({ orderNumber }: { orderNumber: string }) {
  const { t, locale } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { data } = useMyOrderQuery(orderNumber);
  const { data: settings } = useSettingsQuery();
  const order = data?.order;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline();
        tl.from("[data-ok-circle]", { scale: 0, duration: 0.7, ease: "back.out(1.7)" })
          .fromTo("[data-ok-path]", { strokeDashoffset: 60 }, { strokeDashoffset: 0, duration: 0.5, ease: "power2.out" })
          .fromTo("[data-ok-dot]", { x: 0, y: 0, opacity: 1, scale: 1 }, { x: () => gsap.utils.random(-160, 160), y: () => gsap.utils.random(-140, 60), opacity: 0, scale: 0.3, duration: 1.4, ease: "expo.out", stagger: 0.01 }, "<")
          .from("[data-ok-text] > *", { y: 20, opacity: 0, stagger: 0.08, duration: 0.7 }, "-=1.1");
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const colors = ["#8a1538", "#b8925a", "#1d1b19", "#e9dfd1"];
  return (
    <div ref={ref} className="mx-auto max-w-xl text-center">
      <div className="relative mx-auto size-24">
        {Array.from({ length: 24 }, (_, i) => <span key={i} data-ok-dot aria-hidden className="absolute start-1/2 top-1/2 size-2.5 rounded-full opacity-0" style={{ background: colors[i % 4] }} />)}
        <span data-ok-circle className="relative grid size-24 place-items-center rounded-full bg-accent text-white">
          <svg viewBox="0 0 24 24" className="size-12" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path data-ok-path d="M5 12.5l4.5 4.5L19 7.5" strokeDasharray="60" /></svg>
        </span>
      </div>
      <div data-ok-text>
        <h1 className="display mt-10 text-[clamp(2rem,4vw,3rem)]">{t.checkout.successTitle}</h1>
        <p className="mt-4 text-mute">{t.checkout.successText}</p>
        <div className="mx-auto mt-8 inline-flex items-center gap-3 rounded-2xl bg-surface px-6 py-4">
          <span className="text-sm text-mute">{t.checkout.orderNumber}</span>
          <span dir="ltr" className="font-mono text-lg font-bold">{orderNumber}</span>
          <button aria-label="Copy" onClick={() => navigator.clipboard.writeText(orderNumber).then(() => toast.success("✓"))} className="text-mute hover:text-fg"><LuCopy className="size-4" /></button>
        </div>
        {order && <p className="mt-4 text-lg font-semibold">{t.common.total}: {formatMoney(order.total, locale)}</p>}
        {order?.paymentMethod === "bank_transfer" && settings && (
          <dl className="mx-auto mt-6 grid max-w-sm grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-2xl bg-dark p-6 text-start text-sm text-page">
            <dt className="col-span-2 mb-1 eyebrow text-gold">{t.checkout.bankDetails}</dt>
            <dt className="text-page/60">{t.checkout.bankName}</dt><dd>{settings.bank.name}</dd>
            <dt className="text-page/60">{t.checkout.accountName}</dt><dd>{settings.bank.accountName}</dd>
            <dt className="text-page/60">{t.checkout.iban}</dt><dd dir="ltr" className="font-mono rtl:text-end">{settings.bank.iban}</dd>
            <dt className="text-page/60">{t.checkout.reference}</dt><dd dir="ltr" className="font-mono rtl:text-end">{orderNumber}</dd>
          </dl>
        )}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ButtonLink href={`/account/orders/${orderNumber}`}>{t.checkout.trackIt}</ButtonLink>
          <ButtonLink href="/shop" variant="outline">{t.cart.continueShopping}</ButtonLink>
        </div>
      </div>
    </div>
  );
}
