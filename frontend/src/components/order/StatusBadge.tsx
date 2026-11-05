"use client";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";
import type { OrderStatus, PaymentStatus } from "@/types/api";

const TONE: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 ring-amber-200",
  confirmed: "bg-sky-50 text-sky-800 ring-sky-200",
  processing: "bg-indigo-50 text-indigo-800 ring-indigo-200",
  shipped: "bg-violet-50 text-violet-800 ring-violet-200",
  delivered: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  cancelled: "bg-stone-100 text-stone-600 ring-stone-200",
  unpaid: "bg-stone-100 text-stone-700 ring-stone-200",
  awaiting_transfer: "bg-amber-50 text-amber-800 ring-amber-200",
  paid: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  refunded: "bg-rose-50 text-rose-700 ring-rose-200",
};

export function StatusBadge({ status, kind = "order", className }: { status: OrderStatus | PaymentStatus; kind?: "order" | "payment"; className?: string }) {
  const { t } = useI18n();
  const label = kind === "order" ? t.status[status as OrderStatus] : t.payment[status as PaymentStatus];
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset whitespace-nowrap", TONE[status], className)}>{label ?? status}</span>;
}

/** Generic pill for other enums (design / lead statuses). */
export function Pill({ children, tone = "stone" }: { children: React.ReactNode; tone?: "stone" | "amber" | "sky" | "emerald" | "rose" | "violet" }) {
  const map = { stone: TONE.cancelled, amber: TONE.pending, sky: TONE.confirmed, emerald: TONE.delivered, rose: TONE.refunded, violet: TONE.shipped };
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-1 text-[12px] font-semibold ring-1 ring-inset whitespace-nowrap", map[tone])}>{children}</span>;
}
