"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuArrowLeft } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { formatDate, formatMoney } from "@/i18n/format";
import { apiError, useCancelMyOrderMutation, useMyOrderQuery, useSettingsQuery } from "@/store/api";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { StatusBadge } from "@/components/order/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { imageUrl } from "@/lib/utils";

export default function OrderDetail({ params }: { params: Promise<{ number: string }> }) {
  const { number } = use(params);
  const { t, locale } = useI18n();
  const { data, isLoading, error } = useMyOrderQuery(number);
  const { data: settings } = useSettingsQuery();
  const [cancel, { isLoading: cancelling }] = useCancelMyOrderMutation();
  const [confirm, setConfirm] = useState(false);
  const o = data?.order;

  if (isLoading) return <Skeleton className="h-96" />;
  if (error || !o) return <p className="text-mute">{apiError(error).message}</p>;
  const a = o.shippingAddress;

  return (
    <>
      <Link href="/account/orders" className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-mute hover:text-fg"><LuArrowLeft className="size-4 flip-rtl" />{t.account.orders}</Link>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 dir="ltr" className="font-mono text-2xl font-bold rtl:text-end">{o.orderNumber}</h1>
          <p className="text-sm text-mute">{formatDate(o.createdAt, locale, true)}</p>
        </div>
        <div className="flex gap-2"><StatusBadge status={o.status} /><StatusBadge kind="payment" status={o.paymentStatus} /></div>
      </div>

      <div className="mt-8 rounded-3xl border border-line bg-white p-6 md:p-8"><OrderTimeline status={o.status} timeline={o.timeline} /></div>
      {o.trackingNumber && <p className="mt-4 rounded-xl bg-surface p-4 text-sm">{o.courier} · <span className="font-mono font-semibold">{o.trackingNumber}</span></p>}

      <div className="mt-8 grid gap-6 md:grid-cols-[1fr_300px]">
        <ul className="divide-y divide-line rounded-3xl border border-line bg-white px-6">
          {o.items.map((i, k) => (
            <li key={k} className="flex items-center gap-4 py-4">
              <span className="relative size-16 overflow-hidden rounded-xl bg-surface">{i.image && <Image src={imageUrl(i.image, 160)} alt="" fill unoptimized sizes="64px" className="object-cover" />}</span>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-semibold">{locale === "ar" ? i.nameAr || i.name : i.name}</p>
                <p className="text-mute">{i.color && `${i.color} · `}{formatMoney(i.unitPrice, locale)} × {i.quantity}</p>
              </div>
              <p className="font-semibold">{formatMoney(i.lineTotal, locale)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-4">
          <dl className="space-y-2 rounded-3xl bg-surface p-6 text-sm">
            <div className="flex justify-between"><dt className="text-mute">{t.common.subtotal}</dt><dd>{formatMoney(o.subtotal, locale)}</dd></div>
            <div className="flex justify-between"><dt className="text-mute">{t.common.shipping}</dt><dd>{o.shippingFee ? formatMoney(o.shippingFee, locale) : t.common.free}</dd></div>
            <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><dt>{t.common.total}</dt><dd>{formatMoney(o.total, locale)}</dd></div>
            <p className="pt-2 text-mute">{t.payment[o.paymentMethod]}</p>
          </dl>
          <div className="rounded-3xl bg-surface p-6 text-sm">
            <p className="mb-2 font-semibold">{t.checkout.shippingTitle}</p>
            <p>{a.fullName} · <span dir="ltr">{a.phone}</span></p>
            <p className="text-mute">{[a.building, a.street, a.area, a.city].filter(Boolean).join(", ")}</p>
          </div>
          {o.paymentMethod === "bank_transfer" && o.paymentStatus === "awaiting_transfer" && settings && (
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-3xl bg-dark p-6 text-sm text-page">
              <dt className="col-span-2 mb-2 eyebrow text-gold">{t.checkout.bankDetails}</dt>
              <dt className="text-page/60">{t.checkout.bankName}</dt><dd>{settings.bank.name}</dd>
              <dt className="text-page/60">{t.checkout.iban}</dt><dd dir="ltr" className="font-mono text-xs rtl:text-end">{settings.bank.iban}</dd>
            </dl>
          )}
          {o.status === "pending" &&
            (confirm ? (
              <div className="animate-[fadeIn_.3s] rounded-2xl border border-red-200 bg-red-50 p-4 text-sm">
                <p className="text-red-800">{t.account.cancelConfirm}</p>
                <div className="mt-3 flex gap-2">
                  <Button size="sm" variant="danger" loading={cancelling} onClick={async () => { try { await cancel(o.orderNumber).unwrap(); toast.success(t.status.cancelled); setConfirm(false); } catch (e) { toast.error(apiError(e).message); } }}>{t.account.cancelOrder}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>{t.common.back}</Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full" onClick={() => setConfirm(true)}>{t.account.cancelOrder}</Button>
            ))}
        </div>
      </div>
    </>
  );
}
