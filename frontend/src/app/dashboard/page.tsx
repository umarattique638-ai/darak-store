"use client";

import Link from "next/link";
import Image from "next/image";
import { LuInbox, LuPackage, LuPencilRuler, LuShoppingCart, LuTrendingUp, LuTriangleAlert, LuUsers } from "react-icons/lu";
import { useStatsQuery } from "@/store/api";
import { formatDate, formatMoney, pick } from "@/i18n/format";
import { Card, DashHeader } from "@/components/dashboard/ui";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { StatusBadge } from "@/components/order/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { imageUrl } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

const STATUSES: OrderStatus[] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function DashboardHome() {
  const { data: s, isLoading } = useStatsQuery();
  if (isLoading || !s) return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }, (_, i) => <Skeleton key={i} className="h-32" />)}</div>;
  const kpis = [
    { label: "Revenue (paid & active)", v: formatMoney(s.revenue, "en"), Icon: LuTrendingUp, href: "/dashboard/orders" },
    { label: "Orders", v: s.orders, Icon: LuShoppingCart, href: "/dashboard/orders" },
    { label: "Customers", v: s.customers, Icon: LuUsers, href: "/dashboard/customers" },
    { label: "Active products", v: s.products, Icon: LuPackage, href: "/dashboard/products" },
  ];
  const total = Math.max(1, STATUSES.reduce((n, k) => n + (s.ordersByStatus[k] ?? 0), 0));
  return (
    <>
      <DashHeader title="Overview" text="Store performance at a glance" />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        {kpis.map(({ label, v, Icon, href }, i) => (
          <Link key={label} href={href} style={{ animationDelay: `${i * 60}ms` }} className="group animate-[toastIn_.6s_both] rounded-2xl border border-line bg-white p-5 transition-all hover:-translate-y-0.5 hover:shadow-lg">
            <span className="grid size-10 place-items-center rounded-xl bg-accent-soft text-accent transition-colors group-hover:bg-accent group-hover:text-white"><Icon className="size-5" /></span>
            <p className="mt-5 font-display text-[1.8rem] leading-none">{v}</p>
            <p className="mt-1.5 text-[13px] text-mute">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card title="Revenue · last 30 days"><RevenueChart series={s.series} /></Card>
        <Card title="Orders by status">
          <ul className="space-y-3">
            {STATUSES.map((k) => (
              <li key={k} className="flex items-center gap-3 text-sm">
                <StatusBadge status={k} className="w-28 justify-center" />
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface"><span className="block h-full origin-left animate-[growX_1.2s_var(--ease-out-expo)_both] rounded-full bg-accent rtl:origin-right" style={{ width: `${((s.ordersByStatus[k] ?? 0) / total) * 100}%` }} /></span>
                <span className="w-8 text-end font-semibold tabular-nums">{s.ordersByStatus[k] ?? 0}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Link href="/dashboard/designs" className="rounded-xl bg-surface p-3 text-sm hover:bg-sand"><LuPencilRuler className="mb-2 size-4 text-accent" /><b>{s.newDesigns}</b> new designs</Link>
            <Link href="/dashboard/leads" className="rounded-xl bg-surface p-3 text-sm hover:bg-sand"><LuInbox className="mb-2 size-4 text-accent" /><b>{s.newLeads}</b> new leads</Link>
          </div>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card title="Recent orders" action={<Link href="/dashboard/orders" className="text-sm font-semibold text-accent">View all</Link>}>
          <ul className="divide-y divide-line">
            {s.recentOrders.map((o) => (
              <li key={o.id}>
                <Link href={`/dashboard/orders/${o.id}`} className="flex items-center gap-3 py-3 text-sm hover:bg-surface/40">
                  <span className="font-mono font-semibold">{o.orderNumber}</span>
                  <span className="hidden truncate text-mute sm:inline">{o.shippingAddress.fullName}</span>
                  <span className="ms-auto"><StatusBadge status={o.status} /></span>
                  <span className="w-28 text-end font-semibold">{formatMoney(o.total, "en")}</span>
                  <span className="hidden w-24 text-end text-xs text-mute md:inline">{formatDate(o.createdAt, "en")}</span>
                </Link>
              </li>
            ))}
            {!s.recentOrders.length && <li className="py-8 text-center text-mute">No orders yet</li>}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card title="Low stock" action={<Link href="/dashboard/inventory" className="text-sm font-semibold text-accent">Manage</Link>}>
            <ul className="space-y-3">
              {s.lowStock.slice(0, 6).map((p) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="relative size-10 overflow-hidden rounded-lg bg-surface">{p.images[0] && <Image src={imageUrl(p.images[0].url, 100)} alt="" fill unoptimized sizes="40px" className="object-cover" />}</span>
                  <span className="min-w-0 flex-1 truncate">{pick(p.name, "en")}</span>
                  <span className={p.stock === 0 ? "font-bold text-red-600" : "font-bold text-amber-600"}><LuTriangleAlert className="me-1 inline size-3.5" />{p.stock}</span>
                </li>
              ))}
              {!s.lowStock.length && <li className="text-sm text-mute">All stocked up ✓</li>}
            </ul>
          </Card>
          <Card title="Best sellers">
            <ol className="space-y-3">
              {s.topProducts.slice(0, 5).map((p, i) => (
                <li key={p.id} className="flex items-center gap-3 text-sm">
                  <span className="w-5 font-display text-lg text-mute">{i + 1}</span>
                  <span className="min-w-0 flex-1 truncate">{pick(p.name, "en")}</span>
                  <span className="text-mute">{p.sold ?? 0} sold</span>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}
