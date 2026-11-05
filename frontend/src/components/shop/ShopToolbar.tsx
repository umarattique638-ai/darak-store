"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LuSearch, LuSlidersHorizontal, LuX } from "react-icons/lu";
import { useI18n, useLocalized } from "@/i18n/client";
import { fill, formatMoney } from "@/i18n/format";
import { Checkbox, inputCls } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { CategoryDTO } from "@/types/api";

const MATERIALS = ["wood", "fabric", "leather", "metal", "rattan", "marble", "glass", "velvet"] as const;
const SORTS = ["newest", "popular", "price_asc", "price_desc"] as const;

/** All filter state lives in the URL, so results are shareable and rendered on the server. */
export function useShopParams() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const set = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    if (!("page" in patch)) next.delete("page");
    start(() => router.push(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false }));
  };
  return { params, set, pending };
}

function PriceForm({ initialMin, initialMax, label, onApply }: { initialMin: string; initialMax: string; label: string; onApply: (min: string, max: string) => void }) {
  const [min, setMin] = useState(initialMin);
  const [max, setMax] = useState(initialMax);
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(min, max);
      }}
    >
      <input aria-label="min" inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value.replace(/\D/g, ""))} placeholder="Min" className={cn(inputCls, "h-10 px-3 text-sm")} />
      <span className="text-mute">–</span>
      <input aria-label="max" inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value.replace(/\D/g, ""))} placeholder="Max" className={cn(inputCls, "h-10 px-3 text-sm")} />
      <Button type="submit" size="sm" variant="dark" className="h-10 shrink-0">{label}</Button>
    </form>
  );
}

function SearchBox({ initial, placeholder, label, onSearch }: { initial: string; placeholder: string; label: string; onSearch: (q: string) => void }) {
  const [q, setQ] = useState(initial);
  return (
    <form
      role="search"
      className="relative min-w-0 flex-1 basis-64"
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(q.trim());
      }}
    >
      <LuSearch className="pointer-events-none absolute start-4 top-1/2 size-4 -translate-y-1/2 text-mute" />
      <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} aria-label={label} maxLength={80} className={cn(inputCls, "h-12 ps-11")} />
    </form>
  );
}

function Filters({ categories, priceRange, onDone }: { categories: CategoryDTO[]; priceRange: { min: number; max: number }; onDone?: () => void }) {
  const { t, locale } = useI18n();
  const L = useLocalized();
  const { params, set } = useShopParams();
  const cat = params.get("category") ?? "";
  const mat = params.get("material") ?? "";

  const chip = (active: boolean) => cn("rounded-full border px-3.5 py-1.5 text-[13.5px] transition-colors", active ? "border-fg bg-fg text-page" : "border-line bg-white hover:border-fg/40");

  return (
    <div className="space-y-8">
      <fieldset>
        <legend className="mb-3 text-[13px] font-bold tracking-wide uppercase">{t.shop.category}</legend>
        <div className="flex flex-wrap gap-2">
          <button className={chip(!cat)} onClick={() => set({ category: null })}>{t.common.all}</button>
          {categories.map((c) => (
            <button key={c.id} className={chip(cat === c.slug)} onClick={() => set({ category: cat === c.slug ? null : c.slug })}>{L(c.name)}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-3 text-[13px] font-bold tracking-wide uppercase">{t.shop.material}</legend>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map((m) => (
            <button key={m} className={chip(mat === m)} onClick={() => set({ material: mat === m ? null : m })}>{t.materials[m]}</button>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend className="mb-1 text-[13px] font-bold tracking-wide uppercase">{t.shop.price}</legend>
        {priceRange.max > 0 && <p className="mb-3 text-xs text-mute">{formatMoney(priceRange.min, locale)} – {formatMoney(priceRange.max, locale)}</p>}
        <PriceForm
          key={`${params.get("minPrice")}-${params.get("maxPrice")}`}
          initialMin={params.get("minPrice") ?? ""}
          initialMax={params.get("maxPrice") ?? ""}
          label={t.shop.apply}
          onApply={(min, max) => {
            set({ minPrice: min || null, maxPrice: max || null });
            onDone?.();
          }}
        />
      </fieldset>
      <fieldset className="space-y-3">
        <legend className="mb-3 text-[13px] font-bold tracking-wide uppercase">{t.shop.availability}</legend>
        <Checkbox label={t.shop.inStockOnly} checked={params.get("inStock") === "1"} onChange={(e) => set({ inStock: e.target.checked ? "1" : null })} />
        <Checkbox label={t.shop.onSale} checked={params.get("onSale") === "1"} onChange={(e) => set({ onSale: e.target.checked ? "1" : null })} />
      </fieldset>
    </div>
  );
}

export function ShopSidebar(props: { categories: CategoryDTO[]; priceRange: { min: number; max: number } }) {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-28"><Filters {...props} /></div>
    </aside>
  );
}

export function ShopToolbar({ categories, priceRange, total }: { categories: CategoryDTO[]; priceRange: { min: number; max: number }; total: number }) {
  const { t } = useI18n();
  const { params, set, pending } = useShopParams();
  const [open, setOpen] = useState(false);
  const active = ["category", "material", "minPrice", "maxPrice", "inStock", "onSale", "q"].filter((k) => params.get(k));

  return (
    <div className="mb-8 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <SearchBox key={params.get("q") ?? ""} initial={params.get("q") ?? ""} placeholder={t.nav.search} label={t.common.search} onSearch={(q) => set({ q: q || null })} />
        <button onClick={() => setOpen(true)} className="inline-flex h-12 items-center gap-2 rounded-xl border border-line bg-white px-4 text-sm font-semibold lg:hidden">
          <LuSlidersHorizontal className="size-4" /> {t.shop.filters}{active.length > 0 && <span className="grid size-5 place-items-center rounded-full bg-accent text-[11px] text-white">{active.length}</span>}
        </button>
        <label className="flex items-center gap-2 text-sm text-mute">
          <span className="hidden sm:inline">{t.shop.sort}</span>
          <select value={params.get("sort") ?? "newest"} onChange={(e) => set({ sort: e.target.value === "newest" ? null : e.target.value })} className={cn(inputCls, "h-12 w-auto pe-8 font-semibold text-fg")}>
            {SORTS.map((s) => <option key={s} value={s}>{t.shop.sorts[s]}</option>)}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <p className={cn("text-mute transition-opacity", pending && "opacity-40")} aria-live="polite">{fill(t.shop.results, { n: total })}</p>
        {active.length > 0 && (
          <button onClick={() => set(Object.fromEntries(active.map((k) => [k, null])))} className="inline-flex items-center gap-1 font-semibold text-accent hover:underline">
            <LuX className="size-3.5" /> {t.shop.clear}
          </button>
        )}
        {pending && <span className="size-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" aria-hidden />}
      </div>

      {open && (
        <div className="fixed inset-0 z-[80] lg:hidden" role="dialog" aria-modal="true" aria-label={t.shop.filters}>
          <button aria-label={t.nav.close} onClick={() => setOpen(false)} className="absolute inset-0 animate-[fadeIn_.3s] bg-fg/40" />
          <div className="absolute inset-x-0 bottom-0 max-h-[85vh] animate-[toastIn_.4s] overflow-y-auto rounded-t-3xl bg-page p-6">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl">{t.shop.filters}</h2>
              <button onClick={() => setOpen(false)} aria-label={t.nav.close} className="grid size-10 place-items-center rounded-full bg-surface"><LuX className="size-5" /></button>
            </div>
            <Filters categories={categories} priceRange={priceRange} onDone={() => setOpen(false)} />
            <Button className="mt-8 w-full" onClick={() => setOpen(false)}>{fill(t.shop.results, { n: total })}</Button>
          </div>
        </div>
      )}
    </div>
  );
}
