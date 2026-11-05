"use client";

import { useState } from "react";
import Image from "next/image";
import { LuHistory, LuPackagePlus } from "react-icons/lu";
import { apiError, useAdjustStockMutation, useProductsQuery, useStockHistoryQuery } from "@/store/api";
import { formatDate, pick } from "@/i18n/format";
import { DashHeader, Modal, PagerMini, Table, Tabs } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Select, TextInput } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { cn, imageUrl } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

function History({ id }: { id: string }) {
  const { data, isLoading } = useStockHistoryQuery(id);
  if (isLoading) return <Skeleton className="h-40" />;
  if (!data?.movements.length) return <p className="text-sm text-mute">No movements yet.</p>;
  return (
    <ul className="divide-y divide-line text-sm">
      {data.movements.map((m) => (
        <li key={m.id} className="flex items-center gap-3 py-2.5">
          <span className={cn("w-14 font-mono font-bold", m.change > 0 ? "text-success" : "text-red-600")}>{m.change > 0 ? `+${m.change}` : m.change}</span>
          <span className="flex-1"><span className="capitalize">{m.reason}</span>{m.orderNumber && <span className="ms-1 font-mono text-xs text-mute">{m.orderNumber}</span>}{m.note && <span className="block text-xs text-mute">{m.note}</span>}</span>
          <span className="text-xs text-mute">→ {m.stockAfter}</span>
          <span className="w-32 text-end text-xs text-mute">{formatDate(m.createdAt, "en", true)}</span>
        </li>
      ))}
    </ul>
  );
}

export default function InventoryPage() {
  const [tab, setTab] = useState<"low" | "all">("low");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useProductsQuery({ admin: 1, lowStock: tab === "low" ? 1 : undefined, page, limit: 30, sort: "newest" });
  const [target, setTarget] = useState<ProductDTO | null>(null);
  const [mode, setMode] = useState<"adjust" | "history">("adjust");
  const [change, setChange] = useState("");
  const [reason, setReason] = useState<"restock" | "adjustment" | "return">("restock");
  const [note, setNote] = useState("");
  const [adjust, { isLoading: saving }] = useAdjustStockMutation();

  const open = (p: ProductDTO, m: "adjust" | "history") => { setTarget(p); setMode(m); setChange(""); setNote(""); setReason("restock"); };

  return (
    <>
      <DashHeader title="Inventory" text="Stock is reserved automatically when an order is placed and released if it's cancelled. Every change is logged." />
      <Tabs value={tab} onChange={(v) => { setTab(v); setPage(1); }} options={[{ value: "low", label: "Low & out of stock" }, { value: "all", label: "All products" }]} />
      {isLoading ? <Skeleton className="h-96" /> : (
        <>
          <Table head={["Product", "SKU", "Stock", "Alert at", "Sold", ""]} empty={!data?.items.length}>
            {data?.items.map((p) => (
              <tr key={p.id} className="hover:bg-surface/40">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="relative size-10 overflow-hidden rounded-lg bg-surface">{p.images[0] && <Image src={imageUrl(p.images[0].url, 100)} alt="" fill unoptimized sizes="40px" className="object-cover" />}</span><span className="font-medium">{pick(p.name, "en")}</span></div></td>
                <td className="px-4 py-3 font-mono text-xs">{p.sku}</td>
                <td className="px-4 py-3">
                  <span className={cn("inline-flex min-w-10 justify-center rounded-full px-2.5 py-1 text-xs font-bold", p.stock === 0 ? "bg-red-100 text-red-700" : p.lowStock ? "bg-amber-100 text-amber-800" : "bg-emerald-50 text-emerald-700")}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 text-mute">{p.lowStockThreshold}</td>
                <td className="px-4 py-3 text-mute">{p.sold ?? 0}</td>
                <td className="px-4 py-3 text-end whitespace-nowrap">
                  <button onClick={() => open(p, "adjust")} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-semibold text-accent hover:bg-accent-soft"><LuPackagePlus className="size-4" /> Adjust</button>
                  <button onClick={() => open(p, "history")} aria-label="History" className="inline-flex items-center rounded-lg px-2 py-1.5 text-mute hover:bg-surface hover:text-fg"><LuHistory className="size-4" /></button>
                </td>
              </tr>
            ))}
          </Table>
          {data && <PagerMini page={data.page} pages={data.pages} onPage={setPage} />}
        </>
      )}
      <Modal open={!!target} onClose={() => setTarget(null)} title={target ? `${mode === "adjust" ? "Adjust stock" : "Stock history"} · ${pick(target.name, "en")}` : ""} wide={mode === "history"}>
        {target && mode === "history" && <History id={target.id} />}
        {target && mode === "adjust" && (
          <form
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const r = await adjust({ id: target.id, change: Number(change), reason, note }).unwrap();
                toast.success(`Stock is now ${r.product.stock}`);
                setTarget(null);
              } catch (e2) {
                toast.error(apiError(e2).message);
              }
            }}
          >
            <p className="rounded-xl bg-surface p-4 text-sm">Current stock: <b>{target.stock}</b>{change && Number.isFinite(Number(change)) && <> → <b className="text-accent">{Math.max(0, target.stock + Number(change))}</b></>}</p>
            <TextInput id="chg" label="Change (use − to remove)" inputMode="numeric" placeholder="+10 or -2" value={change} onChange={(e) => setChange(e.target.value.replace(/[^\d-]/g, ""))} autoFocus />
            <Select id="reason" label="Reason" value={reason} onChange={(e) => setReason(e.target.value as typeof reason)}>
              <option value="restock">Restock (new delivery)</option>
              <option value="adjustment">Adjustment (count / damage)</option>
              <option value="return">Customer return</option>
            </Select>
            <TextInput id="note" label="Note" value={note} onChange={(e) => setNote(e.target.value)} optional="optional" />
            <Button type="submit" className="w-full" loading={saving} disabled={!change || change === "-" || Number(change) === 0}>Save</Button>
          </form>
        )}
      </Modal>
    </>
  );
}
