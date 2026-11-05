"use client";

import { useState } from "react";
import Link from "next/link";
import { LuSearch } from "react-icons/lu";
import { useAdminOrdersQuery, useStatsQuery } from "@/store/api";
import { formatDate, formatMoney } from "@/i18n/format";
import { DashHeader, PagerMini, Table, Tabs } from "@/components/dashboard/ui";
import { StatusBadge } from "@/components/order/StatusBadge";
import { inputCls } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

const TABS: ("" | OrderStatus)[] = ["", "pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function OrdersAdmin() {
  const [status, setStatus] = useState<"" | OrderStatus>("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data: stats } = useStatsQuery();
  const { data, isLoading, isFetching } = useAdminOrdersQuery({ status, q: search, page, limit: 20 }, { pollingInterval: 30_000 });

  return (
    <>
      <DashHeader title="Orders" text="New orders refresh automatically every 30 seconds" />
      <Tabs value={status} onChange={(v) => { setStatus(v); setPage(1); }} options={TABS.map((s) => ({ value: s, label: s ? s[0]!.toUpperCase() + s.slice(1) : "All", count: s ? stats?.ordersByStatus[s] ?? 0 : stats?.orders }))} />
      <form className="relative mb-4 max-w-md" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); setPage(1); }}>
        <LuSearch className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Order number, email or name…" className={cn(inputCls, "h-11 ps-11")} />
      </form>
      {isLoading ? <Skeleton className="h-96" /> : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <Table head={["Order", "Customer", "Date", "Payment", "Status", "Total"]} empty={!data?.items.length}>
            {data?.items.map((o) => (
              <tr key={o.id} className="cursor-pointer hover:bg-surface/40">
                <td className="px-4 py-3"><Link href={`/dashboard/orders/${o.id}`} className="font-mono font-semibold text-accent hover:underline">{o.orderNumber}</Link></td>
                <td className="px-4 py-3"><p className="font-medium">{o.shippingAddress.fullName}</p><p className="text-xs text-mute">{o.email}</p></td>
                <td className="px-4 py-3 text-mute whitespace-nowrap">{formatDate(o.createdAt, "en", true)}</td>
                <td className="px-4 py-3"><p className="text-xs">{o.paymentMethod === "cod" ? "Cash on delivery" : "Bank transfer"}</p><StatusBadge kind="payment" status={o.paymentStatus} className="mt-1" /></td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 font-semibold whitespace-nowrap">{formatMoney(o.total, "en")}</td>
              </tr>
            ))}
          </Table>
          {data && <PagerMini page={data.page} pages={data.pages} onPage={setPage} />}
        </div>
      )}
    </>
  );
}
