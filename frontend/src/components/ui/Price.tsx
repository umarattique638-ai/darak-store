"use client";

import { useI18n } from "@/i18n/client";
import { formatMoney } from "@/i18n/format";
import { cn } from "@/lib/utils";

export function Price({ amount, compareAt, className }: { amount: number; compareAt?: number | null; className?: string }) {
  const { locale } = useI18n();
  return (
    <span className={cn("inline-flex flex-wrap items-baseline gap-x-2", className)}>
      <span className="font-semibold text-fg">{formatMoney(amount, locale)}</span>
      {compareAt && compareAt > amount && <s className="text-[0.85em] text-mute">{formatMoney(compareAt, locale)}</s>}
    </span>
  );
}
