"use client";

import { useState } from "react";
import { LuMail, LuPhone, LuTrash2 } from "react-icons/lu";
import { apiError, useDeleteLeadMutation, useLeadsQuery, useUpdateLeadMutation } from "@/store/api";
import { useCurrentUser } from "@/store/hooks";
import { formatDate } from "@/i18n/format";
import { DashHeader, Tabs } from "@/components/dashboard/ui";
import { Pill } from "@/components/order/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { LeadDTO } from "@/types/api";

const TONE = { new: "amber", contacted: "sky", closed: "stone" } as const;

export default function LeadsAdmin() {
  const me = useCurrentUser();
  const [status, setStatus] = useState<"" | LeadDTO["status"]>("");
  const { data, isLoading } = useLeadsQuery(status || undefined);
  const [update] = useUpdateLeadMutation();
  const [remove] = useDeleteLeadMutation();
  const [open, setOpen] = useState<string | null>(null);

  return (
    <>
      <DashHeader title="Leads" text="Messages from the contact form. Every new lead is also emailed to your team." />
      <Tabs value={status} onChange={setStatus} options={[{ value: "", label: "All" }, { value: "new", label: "New" }, { value: "contacted", label: "Contacted" }, { value: "closed", label: "Closed" }]} />
      {isLoading ? <Skeleton className="h-96" /> : !data?.leads.length ? <p className="rounded-2xl border border-dashed border-line py-16 text-center text-mute">No leads</p> : (
        <ul className="space-y-3">
          {data.leads.map((l, i) => (
            <li key={l.id} style={{ animationDelay: `${i * 30}ms` }} className={cn("animate-[toastIn_.4s_both] rounded-2xl border bg-white transition-shadow", l.status === "new" ? "border-accent/30 shadow-[0_8px_30px_-20px_rgba(138,21,56,.6)]" : "border-line")}>
              <button onClick={() => setOpen(open === l.id ? null : l.id)} className="flex w-full flex-wrap items-center gap-3 p-4 text-start">
                {l.status === "new" && <span className="size-2 animate-pulse rounded-full bg-accent" />}
                <span className="font-semibold">{l.name}</span>
                <span className="text-sm text-mute">{l.subject || l.message.slice(0, 60)}</span>
                <span className="ms-auto text-xs text-mute">{formatDate(l.createdAt, "en", true)}</span>
                <Pill tone={TONE[l.status]}>{l.status}</Pill>
              </button>
              <div className={cn("grid transition-[grid-template-rows] duration-500", open === l.id ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className="overflow-hidden">
                  <div className="border-t border-line p-4">
                    <p className="whitespace-pre-line text-sm leading-relaxed">{l.message}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
                      <a href={`mailto:${l.email}?subject=${encodeURIComponent(`Re: ${l.subject || "Your message to Darak"}`)}`} className="inline-flex items-center gap-1.5 font-semibold text-accent"><LuMail className="size-4" />{l.email}</a>
                      {l.phone && <a href={`tel:${l.phone}`} className="inline-flex items-center gap-1.5 font-semibold text-accent"><LuPhone className="size-4" /><span dir="ltr">{l.phone}</span></a>}
                      <span className="ms-auto flex gap-2">
                        {(["new", "contacted", "closed"] as const).filter((s) => s !== l.status).map((s) => (
                          <button key={s} onClick={() => update({ id: l.id, status: s }).unwrap().then(() => toast.success(`Marked ${s}`)).catch((e) => toast.error(apiError(e).message))} className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold capitalize hover:border-fg">{s}</button>
                        ))}
                        {me?.role === "admin" && <button aria-label="Delete lead" onClick={() => remove(l.id).unwrap().then(() => toast.info("Lead deleted")).catch((e) => toast.error(apiError(e).message))} className="rounded-lg px-2 text-red-600 hover:bg-red-50"><LuTrash2 className="size-4" /></button>}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
