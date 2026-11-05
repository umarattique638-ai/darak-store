"use client";

import { useEffect, type ReactNode } from "react";
import { LuX } from "react-icons/lu";
import { cn } from "@/lib/utils";

export function DashHeader({ title, text, action }: { title: string; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 animate-[toastIn_.5s_both]">
      <div>
        <h1 className="font-display text-[2rem] leading-tight">{title}</h1>
        {text && <p className="mt-1 text-sm text-mute">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Card({ children, className, title, action }: { children: ReactNode; className?: string; title?: string; action?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-white p-5 md:p-6", className)}>
      {(title || action) && <div className="mb-4 flex items-center justify-between gap-3">{title && <h2 className="font-semibold">{title}</h2>}{action}</div>}
      {children}
    </section>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: boolean }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-surface/60 text-start text-[12px] tracking-wide text-mute uppercase">
          <tr>{head.map((h, i) => <th key={i} className="px-4 py-3 text-start font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="py-14 text-center text-mute">Nothing here yet</p>}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: ReactNode; wide?: boolean }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 animate-[fadeIn_.25s] bg-fg/50 backdrop-blur-sm" />
      <div className={cn("relative max-h-[90vh] w-full animate-[toastIn_.35s] overflow-y-auto rounded-3xl bg-page p-6 shadow-2xl md:p-8", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-surface"><LuX className="size-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-white p-1 ring-1 ring-line">
      {options.map((o) => (
        <button key={o.value} onClick={() => onChange(o.value)} className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-[13px] font-semibold transition-colors", value === o.value ? "bg-fg text-page" : "text-mute hover:text-fg")}>
          {o.label}{o.count !== undefined && <span className={cn("rounded-full px-1.5 text-[11px]", value === o.value ? "bg-page/20" : "bg-surface")}>{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function PagerMini({ page, pages, onPage }: { page: number; pages: number; onPage: (p: number) => void }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 text-sm">
      <button disabled={page <= 1} onClick={() => onPage(page - 1)} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">Prev</button>
      <span className="text-mute">{page} / {pages}</span>
      <button disabled={page >= pages} onClick={() => onPage(page + 1)} className="rounded-lg border border-line bg-white px-3 py-1.5 disabled:opacity-40">Next</button>
    </div>
  );
}
