"use client";

import { LuMinus, LuPlus } from "react-icons/lu";
import { cn } from "@/lib/utils";

export function QtyStepper({ value, max, onChange, className, size = "md" }: { value: number; max: number; onChange: (v: number) => void; className?: string; size?: "sm" | "md" | "lg" }) {
  const h = size === "sm" ? "h-9" : size === "lg" ? "h-14 px-1" : "h-12";
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-white", h, className)}>
      <button type="button" aria-label="−" onClick={() => onChange(Math.max(1, value - 1))} disabled={value <= 1} className="grid h-full w-9 place-items-center rounded-full disabled:opacity-30 hover:bg-surface"><LuMinus className="size-3.5" /></button>
      <output aria-live="polite" className="w-8 text-center text-sm font-semibold tabular-nums">{value}</output>
      <button type="button" aria-label="+" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} className="grid h-full w-9 place-items-center rounded-full disabled:opacity-30 hover:bg-surface"><LuPlus className="size-3.5" /></button>
    </div>
  );
}
