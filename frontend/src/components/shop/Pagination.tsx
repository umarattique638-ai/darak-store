"use client";

import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { useShopParams } from "./ShopToolbar";
import { cn } from "@/lib/utils";

export function Pagination({ page, pages }: { page: number; pages: number }) {
  const { t } = useI18n();
  const { set } = useShopParams();
  if (pages <= 1) return null;
  const go = (p: number) => {
    set({ page: p > 1 ? String(p) : null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const nums = Array.from({ length: pages }, (_, i) => i + 1).filter((n) => n === 1 || n === pages || Math.abs(n - page) <= 1);
  return (
    <nav aria-label={fill(t.shop.page, { p: page, n: pages })} className="mt-16 flex items-center justify-center gap-2">
      <button disabled={page <= 1} onClick={() => go(page - 1)} aria-label={t.shop.prev} className="grid size-11 place-items-center rounded-full border border-line disabled:opacity-30 hover:enabled:border-fg"><LuChevronLeft className="size-5 flip-rtl" /></button>
      {nums.map((n, i) => (
        <span key={n} className="flex items-center gap-2">
          {i > 0 && n - nums[i - 1]! > 1 && <span className="text-mute">…</span>}
          <button onClick={() => go(n)} aria-current={n === page ? "page" : undefined} className={cn("grid size-11 place-items-center rounded-full text-sm font-semibold transition-colors", n === page ? "bg-fg text-page" : "hover:bg-surface")}>{n}</button>
        </span>
      ))}
      <button disabled={page >= pages} onClick={() => go(page + 1)} aria-label={t.shop.next} className="grid size-11 place-items-center rounded-full border border-line disabled:opacity-30 hover:enabled:border-fg"><LuChevronRight className="size-5 flip-rtl" /></button>
    </nav>
  );
}
