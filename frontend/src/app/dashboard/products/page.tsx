"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LuPencil, LuPlus, LuSearch, LuStar } from "react-icons/lu";
import { useCategoriesQuery, useProductsQuery } from "@/store/api";
import { formatMoney, pick } from "@/i18n/format";
import { DashHeader, PagerMini, Table } from "@/components/dashboard/ui";
import { ButtonLink } from "@/components/ui/Button";
import { Pill } from "@/components/order/StatusBadge";
import { inputCls } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { cn, imageUrl } from "@/lib/utils";

export default function ProductsAdmin() {
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const { data: cats } = useCategoriesQuery({ all: true });
  const { data, isLoading, isFetching } = useProductsQuery({ admin: 1, q: search, category, page, limit: 20, sort: "newest" });

  return (
    <>
      <DashHeader title="Products" text={data ? `${data.total} products` : undefined} action={<ButtonLink href="/dashboard/products/new"><LuPlus className="size-4" /> Add product</ButtonLink>} />
      <div className="mb-4 flex flex-wrap gap-3">
        <form className="relative min-w-60 flex-1" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); setPage(1); }}>
          <LuSearch className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-mute" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or SKU…" className={cn(inputCls, "h-11 ps-11")} />
        </form>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }} className={cn(inputCls, "h-11 w-auto")}>
          <option value="">All categories</option>
          {cats?.categories.map((c) => <option key={c.id} value={c.slug}>{pick(c.name, "en")}</option>)}
        </select>
      </div>
      {isLoading ? (
        <Skeleton className="h-96" />
      ) : (
        <div className={cn("transition-opacity", isFetching && "opacity-60")}>
          <Table head={["Product", "SKU", "Category", "Price", "Stock", "Status", ""]} empty={!data?.items.length}>
            {data?.items.map((p) => (
              <tr key={p.id} className="hover:bg-surface/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-surface">{p.images[0] && <Image src={imageUrl(p.images[0].url, 120)} alt="" fill unoptimized sizes="48px" className="object-cover" />}</span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{pick(p.name, "en")} {p.featured && <LuStar className="inline size-3.5 fill-gold text-gold" />}</p>
                      <p dir="rtl" className="truncate text-xs text-mute">{p.name.ar}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">{pick(p.category.name, "en")}</td>
                <td className="px-4 py-3 whitespace-nowrap">{formatMoney(p.price, "en")}{p.compareAtPrice ? <s className="ms-2 text-xs text-mute">{p.compareAtPrice}</s> : null}</td>
                <td className="px-4 py-3"><span className={cn("font-bold", p.stock === 0 ? "text-red-600" : p.lowStock ? "text-amber-600" : "")}>{p.stock}</span></td>
                <td className="px-4 py-3">{p.active ? <Pill tone="emerald">Active</Pill> : <Pill>Archived</Pill>}</td>
                <td className="px-4 py-3 text-end"><Link href={`/dashboard/products/${p.id}`} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-accent hover:bg-accent-soft"><LuPencil className="size-3.5" /> Edit</Link></td>
              </tr>
            ))}
          </Table>
          {data && <PagerMini page={data.page} pages={data.pages} onPage={setPage} />}
        </div>
      )}
    </>
  );
}
