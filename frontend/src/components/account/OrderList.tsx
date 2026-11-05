"use client";

import Link from "next/link";
import Image from "next/image";
import { LuPackageOpen } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { formatDate, formatMoney } from "@/i18n/format";
import { useMyOrdersQuery } from "@/store/api";
import { StatusBadge } from "@/components/order/StatusBadge";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { imageUrl } from "@/lib/utils";

export function OrderList({ limit }: { limit?: number }) {
  const { t, locale } = useI18n();
  const { data, isLoading } = useMyOrdersQuery();
  if (isLoading) return <div className="space-y-3">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-24" />)}</div>;
  const orders = (data?.orders ?? []).slice(0, limit);
  if (!orders.length)
    return (
      <div className="flex flex-col items-center rounded-3xl border border-dashed border-line py-16 text-center">
        <LuPackageOpen className="size-10 text-mute" />
        <p className="mt-3 font-semibold">{t.account.noOrders}</p>
        <ButtonLink href="/shop" className="mt-5" size="sm">{t.common.shopNow}</ButtonLink>
      </div>
    );
  return (
    <ul className="space-y-3">
      {orders.map((o) => (
        <li key={o.id}>
          <Link href={`/account/orders/${o.orderNumber}`} className="group flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-white p-4 transition-all hover:border-fg/20 hover:shadow-md sm:flex-nowrap">
            <div className="flex -space-x-3 rtl:space-x-reverse">
              {o.items.slice(0, 3).map((i, k) => (
                <span key={k} className="relative size-14 overflow-hidden rounded-xl border-2 border-white bg-surface">{i.image && <Image src={imageUrl(i.image, 120)} alt="" fill unoptimized sizes="56px" className="object-cover" />}</span>
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <p dir="ltr" className="font-mono text-sm font-bold rtl:text-end">{o.orderNumber}</p>
              <p className="text-sm text-mute">{formatDate(o.createdAt, locale)} · {o.items.reduce((n, i) => n + i.quantity, 0)} {t.common.items}</p>
            </div>
            <StatusBadge status={o.status} />
            <p className="w-28 text-end font-semibold">{formatMoney(o.total, locale)}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
