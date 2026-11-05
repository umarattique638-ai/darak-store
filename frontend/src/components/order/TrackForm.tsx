"use client";

import { useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { formatDate, formatMoney } from "@/i18n/format";
import { apiError, useTrackMutation } from "@/store/api";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { OrderTimeline } from "./OrderTimeline";
import { StatusBadge } from "./StatusBadge";
import { imageUrl } from "@/lib/utils";

export function TrackForm() {
  const { t, locale } = useI18n();
  const sp = useSearchParams();
  const [num, setNum] = useState(sp.get("order") ?? "");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [track, { data, isLoading, error, reset }] = useTrackMutation();
  const o = data?.order;

  return (
    <div className="grid gap-12 lg:grid-cols-[380px_1fr]">
      <form
        className="h-fit space-y-5 rounded-3xl bg-surface p-7"
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          setErrors({});
          reset();
          try {
            await track({ orderNumber: num.trim().toUpperCase(), email: email.trim() }).unwrap();
          } catch (e2) {
            setErrors(apiError(e2).fields);
          }
        }}
      >
        <TextInput id="num" dir="ltr" label={t.track.orderNumber} placeholder="DRK-260101-123456" value={num} onChange={(e) => setNum(e.target.value)} error={errors.orderNumber} required />
        <TextInput id="email" type="email" label={t.track.email} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" required />
        <Button type="submit" className="w-full" loading={isLoading}>{t.track.submit}</Button>
        {error && !Object.keys(errors).length && <p role="alert" className="text-sm font-medium text-red-600">{apiError(error).code === "NOT_FOUND" ? t.track.notFound : apiError(error).message}</p>}
      </form>

      {o ? (
        <div className="animate-[fadeIn_.5s] rounded-3xl border border-line bg-white p-7 md:p-9">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p dir="ltr" className="font-mono text-lg font-bold rtl:text-end">{o.orderNumber}</p>
              <p className="text-sm text-mute">{t.track.placed} {formatDate(o.createdAt, locale)} · {o.city}</p>
            </div>
            <div className="flex gap-2"><StatusBadge status={o.status} /><StatusBadge kind="payment" status={o.paymentStatus} /></div>
          </div>
          <div className="mt-10"><OrderTimeline status={o.status} timeline={o.timeline} /></div>
          {o.trackingNumber && <p className="mt-8 rounded-xl bg-surface p-4 text-sm">{o.courier} · <span className="font-mono font-semibold">{o.trackingNumber}</span></p>}
          <ul className="mt-8 flex flex-wrap gap-3 border-t border-line pt-8">
            {o.items.map((i, k) => (
              <li key={k} className="flex items-center gap-3 rounded-xl bg-surface p-2 pe-4 text-sm">
                <span className="relative size-12 overflow-hidden rounded-lg bg-white">{i.image && <Image src={imageUrl(i.image, 120)} alt="" fill unoptimized sizes="48px" className="object-cover" />}</span>
                {locale === "ar" ? i.nameAr || i.name : i.name} × {i.quantity}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-end text-lg font-bold">{t.common.total}: {formatMoney(o.total, locale)}</p>
        </div>
      ) : (
        <div aria-hidden className="hidden items-center justify-center rounded-3xl border border-dashed border-line p-10 lg:flex">
          <svg viewBox="0 0 200 120" className="w-64 text-line" fill="none" stroke="currentColor" strokeWidth="2"><rect x="20" y="40" width="100" height="50" rx="6" /><path d="M120 55h30l20 20v15h-50z" /><circle cx="50" cy="95" r="10" className="fill-page" /><circle cx="150" cy="95" r="10" className="fill-page" /><path d="M10 105h180" strokeDasharray="6 6" className="animate-[marquee_6s_linear_infinite]" /></svg>
        </div>
      )}
    </div>
  );
}
