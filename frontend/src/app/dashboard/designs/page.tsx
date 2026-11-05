"use client";

import { useState } from "react";
import Image from "next/image";
import { LuMail, LuPhone } from "react-icons/lu";
import { apiError, useDesignsQuery, useUpdateDesignMutation } from "@/store/api";
import { formatDate, formatMoney } from "@/i18n/format";
import en from "@/i18n/dictionaries/en";
import { DashHeader, Modal, Tabs } from "@/components/dashboard/ui";
import { DesignStatusPill } from "@/components/account/DesignStatusPill";
import { Button } from "@/components/ui/Button";
import { Checkbox, Select, TextArea, TextInput } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { imageUrl } from "@/lib/utils";
import type { DesignDTO, DesignStatus } from "@/types/api";

const STATUSES: DesignStatus[] = ["new", "reviewing", "quoted", "in_production", "completed", "declined"];

export default function DesignsAdmin() {
  const [status, setStatus] = useState<DesignStatus | "">("");
  const { data, isLoading } = useDesignsQuery(status || undefined);
  const [sel, setSel] = useState<DesignDTO | null>(null);
  const [form, setForm] = useState({ status: "new" as DesignStatus, quotedPrice: "", adminNote: "", notify: true });
  const [save, { isLoading: saving }] = useUpdateDesignMutation();
  const [zoom, setZoom] = useState<string | null>(null);

  const openD = (d: DesignDTO) => { setSel(d); setForm({ status: d.status, quotedPrice: d.quotedPrice != null ? String(d.quotedPrice) : "", adminNote: d.adminNote, notify: true }); };

  return (
    <>
      <DashHeader title="Custom design requests" text="Customers' made-to-order ideas. Updating a request can email the customer." />
      <Tabs value={status} onChange={setStatus} options={[{ value: "", label: "All" }, ...STATUSES.map((s) => ({ value: s, label: en.custom.statuses[s] }))]} />
      {isLoading ? <Skeleton className="h-96" /> : !data?.designs.length ? <p className="rounded-2xl border border-dashed border-line py-16 text-center text-mute">No requests</p> : (
        <ul className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
          {data.designs.map((d, i) => (
            <li key={d.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-[toastIn_.5s_both]">
              <button onClick={() => openD(d)} className="block h-full w-full rounded-2xl border border-line bg-white p-5 text-start transition-all hover:-translate-y-0.5 hover:shadow-lg">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="font-mono text-xs font-bold">{d.requestNumber}</p><p className="mt-1 font-display text-xl">{en.custom.types[d.furnitureType as keyof typeof en.custom.types] ?? d.furnitureType}</p></div>
                  <DesignStatusPill status={d.status} />
                </div>
                <p className="mt-2 text-sm font-medium">{d.name} <span className="text-mute">· {formatDate(d.createdAt, "en")}</span></p>
                <p className="mt-2 line-clamp-2 text-sm text-mute">{d.description}</p>
                {d.referenceImages.length > 0 && <div className="mt-3 flex gap-1.5">{d.referenceImages.slice(0, 4).map((u) => <span key={u} className="relative size-12 overflow-hidden rounded-lg bg-surface"><Image src={imageUrl(u, 120)} alt="" fill unoptimized sizes="48px" className="object-cover" /></span>)}</div>}
                {d.budget > 0 && <p className="mt-3 text-xs text-mute">Budget {formatMoney(d.budget, "en")}</p>}
              </button>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.requestNumber}` : ""} wide>
        {sel && (
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3 text-sm">
              <p className="font-semibold">{sel.name}</p>
              <a href={`mailto:${sel.email}`} className="flex items-center gap-2 text-accent"><LuMail className="size-4" />{sel.email}</a>
              <a href={`tel:${sel.phone}`} className="flex items-center gap-2 text-accent"><LuPhone className="size-4" /><span dir="ltr">{sel.phone}</span></a>
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 rounded-xl bg-surface p-4">
                <dt className="text-mute">Type</dt><dd>{en.custom.types[sel.furnitureType as keyof typeof en.custom.types]}</dd>
                <dt className="text-mute">Size</dt><dd>{[sel.dimensions.width, sel.dimensions.depth, sel.dimensions.height].map((v) => v ?? "–").join(" × ")} cm</dd>
                <dt className="text-mute">Material</dt><dd>{sel.material || "–"}</dd>
                <dt className="text-mute">Colour</dt><dd>{sel.color || "–"}</dd>
                <dt className="text-mute">Qty</dt><dd>{sel.quantity}</dd>
                <dt className="text-mute">Budget</dt><dd>{sel.budget ? formatMoney(sel.budget, "en") : "–"}</dd>
                <dt className="text-mute">Needed by</dt><dd>{sel.deadline ? formatDate(sel.deadline, "en") : "–"}</dd>
              </dl>
              <p className="whitespace-pre-line">{sel.description}</p>
              {sel.referenceImages.length > 0 && <div className="grid grid-cols-3 gap-2">{sel.referenceImages.map((u) => <button key={u} onClick={() => setZoom(u)} className="relative aspect-square overflow-hidden rounded-lg bg-surface"><Image src={imageUrl(u, 300)} alt="" fill unoptimized sizes="120px" className="object-cover transition-transform hover:scale-110" /></button>)}</div>}
            </div>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await save({ id: sel.id, status: form.status, quotedPrice: form.quotedPrice ? Number(form.quotedPrice) : null, adminNote: form.adminNote, notify: form.notify }).unwrap();
                  toast.success(form.notify ? "Saved — customer emailed" : "Saved");
                  setSel(null);
                } catch (e2) {
                  toast.error(apiError(e2).message);
                }
              }}
            >
              <Select id="st" label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DesignStatus })}>
                {STATUSES.map((s) => <option key={s} value={s}>{en.custom.statuses[s]}</option>)}
              </Select>
              <TextInput id="qp" label="Quoted price (QAR)" inputMode="decimal" value={form.quotedPrice} onChange={(e) => setForm({ ...form, quotedPrice: e.target.value })} />
              <TextArea id="an" label="Message to customer" rows={5} value={form.adminNote} onChange={(e) => setForm({ ...form, adminNote: e.target.value })} />
              <Checkbox label="Email the customer about this update" checked={form.notify} onChange={(e) => setForm({ ...form, notify: e.target.checked })} />
              <Button type="submit" className="w-full" loading={saving}>Save</Button>
            </form>
          </div>
        )}
      </Modal>
      {zoom && (
        <button onClick={() => setZoom(null)} className="fixed inset-0 z-[100] grid animate-[fadeIn_.2s] place-items-center bg-fg/80 p-6" aria-label="Close image">
          <span className="relative h-[80vh] w-full max-w-4xl"><Image src={imageUrl(zoom, 1600)} alt="" fill unoptimized sizes="90vw" className="object-contain" /></span>
        </button>
      )}
    </>
  );
}
