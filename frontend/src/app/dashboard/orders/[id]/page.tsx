"use client";

import { use, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuArrowLeft, LuMail, LuPhone } from "react-icons/lu";
import { apiError, useAdminOrderQuery, useSetOrderStatusMutation } from "@/store/api";
import { formatDate, formatMoney } from "@/i18n/format";
import { Card, DashHeader } from "@/components/dashboard/ui";
import { OrderTimeline } from "@/components/order/OrderTimeline";
import { StatusBadge } from "@/components/order/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Select, TextInput } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { imageUrl } from "@/lib/utils";
import type { OrderDTO, OrderStatus, PaymentStatus } from "@/types/api";

/** Mirrors the API's allowed transitions so we only offer valid next steps. */
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"], confirmed: ["processing", "shipped", "cancelled"], processing: ["shipped", "cancelled"], shipped: ["delivered"], delivered: [], cancelled: [],
};
const PAY: PaymentStatus[] = ["unpaid", "awaiting_transfer", "paid", "refunded"];

export default function AdminOrder({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, isLoading, error } = useAdminOrderQuery(id);
  const o = data?.order;
  if (isLoading) return <Skeleton className="h-[600px]" />;
  if (!o) return <p className="text-mute">{apiError(error).message}</p>;
  const a = o.shippingAddress;

  return (
    <>
      <Link href="/dashboard/orders" className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-mute hover:text-fg"><LuArrowLeft className="size-4 flip-rtl" /> Orders</Link>
      <DashHeader title={o.orderNumber} text={`Placed ${formatDate(o.createdAt, "en", true)}`} action={<div className="flex gap-2"><StatusBadge status={o.status} /><StatusBadge kind="payment" status={o.paymentStatus} /></div>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <Card><OrderTimeline status={o.status} timeline={o.timeline} /></Card>
          <Card title={`Items (${o.items.length})`}>
            <ul className="divide-y divide-line">
              {o.items.map((i, k) => (
                <li key={k} className="flex items-center gap-4 py-3 text-sm">
                  <span className="relative size-14 overflow-hidden rounded-lg bg-surface">{i.image && <Image src={imageUrl(i.image, 140)} alt="" fill unoptimized sizes="56px" className="object-cover" />}</span>
                  <div className="min-w-0 flex-1"><p className="font-semibold">{i.name}</p><p className="text-xs text-mute">{i.sku}{i.color && ` · ${i.color}`} · {formatMoney(i.unitPrice, "en")} × {i.quantity}</p></div>
                  <p className="font-semibold">{formatMoney(i.lineTotal, "en")}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-mute">Subtotal</dt><dd>{formatMoney(o.subtotal, "en")}</dd></div>
              <div className="flex justify-between"><dt className="text-mute">Shipping</dt><dd>{o.shippingFee ? formatMoney(o.shippingFee, "en") : "Free"}</dd></div>
              <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd>{formatMoney(o.total, "en")}</dd></div>
            </dl>
          </Card>
        </div>
        <div className="space-y-6">
          <UpdateOrder key={o.updatedAt} order={o} />
          <Card title="Customer">
            <p className="font-semibold">{a.fullName}</p>
            <a href={`mailto:${o.email}`} className="mt-2 flex items-center gap-2 text-sm text-accent"><LuMail className="size-4" />{o.email}</a>
            <a href={`tel:${a.phone}`} className="mt-1 flex items-center gap-2 text-sm text-accent"><LuPhone className="size-4" /><span dir="ltr">{a.phone}</span></a>
            <p className="mt-4 text-sm text-mute">{[a.building, a.street, a.area, a.city].filter(Boolean).join(", ")}</p>
            {a.notes && <p className="mt-2 rounded-lg bg-surface p-3 text-sm">{a.notes}</p>}
            {o.customerNote && <p className="mt-2 rounded-lg bg-accent-soft p-3 text-sm"><b>Note:</b> {o.customerNote}</p>}
            <p className="mt-4 text-sm">{o.paymentMethod === "cod" ? "💵 Cash on delivery" : "🏦 Bank transfer"}</p>
          </Card>
        </div>
      </div>
    </>
  );
}

function UpdateOrder({ order: o }: { order: OrderDTO }) {
  const [setStatus, { isLoading: saving }] = useSetOrderStatusMutation();
  const [next, setNext] = useState<OrderStatus | "">("");
  const [note, setNote] = useState("");
  const [tracking, setTracking] = useState(o.trackingNumber);
  const [courier, setCourier] = useState(o.courier);
  const [pay, setPay] = useState<PaymentStatus>(o.paymentStatus);

  const save = async () => {
    try {
      await setStatus({ id: o.id, status: next || o.status, note, trackingNumber: tracking, courier, paymentStatus: pay }).unwrap();
      toast.success(next ? `Order marked ${next} — customer notified by email` : "Order updated");
    } catch (e) {
      toast.error(apiError(e).message);
    }
  };

  return (
    <Card title="Update order">
      <div className="space-y-4">
        <Select id="next" label="Move to" value={next} onChange={(e) => setNext(e.target.value as OrderStatus | "")} disabled={!NEXT[o.status].length}>
          <option value="">{NEXT[o.status].length ? "Keep current status" : "Final status"}</option>
          {NEXT[o.status].map((s) => <option key={s} value={s}>{s}</option>)}
        </Select>
        {next === "cancelled" && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Cancelling returns all items to stock.</p>}
        <TextInput id="note" label="Note to customer" value={note} onChange={(e) => setNote(e.target.value)} optional="optional" />
        <div className="grid grid-cols-2 gap-3">
          <TextInput id="courier" label="Courier" value={courier} onChange={(e) => setCourier(e.target.value)} />
          <TextInput id="tracking" label="Tracking #" value={tracking} onChange={(e) => setTracking(e.target.value)} />
        </div>
        <Select id="pay" label="Payment status" value={pay} onChange={(e) => setPay(e.target.value as PaymentStatus)}>
          {PAY.map((p) => <option key={p} value={p}>{p.replace("_", " ")}</option>)}
        </Select>
        <Button className="w-full" loading={saving} onClick={save}>Save</Button>
      </div>
    </Card>
  );
}
