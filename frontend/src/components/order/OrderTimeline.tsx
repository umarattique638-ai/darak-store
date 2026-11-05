"use client";

import { useRef } from "react";
import { LuCheck, LuCircleX, LuHouse, LuPackage, LuPackageCheck, LuReceipt, LuTruck } from "react-icons/lu";
import { gsap, useGSAP } from "@/lib/gsap";
import { useI18n } from "@/i18n/client";
import { formatDate } from "@/i18n/format";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/api";

const STEPS: { s: OrderStatus; Icon: typeof LuCheck }[] = [
  { s: "pending", Icon: LuReceipt }, { s: "confirmed", Icon: LuPackageCheck }, { s: "processing", Icon: LuPackage }, { s: "shipped", Icon: LuTruck }, { s: "delivered", Icon: LuHouse },
];

/** Progress tracker: the bar fills to the current step on mount. */
export function OrderTimeline({ status, timeline }: { status: OrderStatus; timeline: { status: OrderStatus; note: string; at: string | null }[] }) {
  const { t, locale } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const idx = STEPS.findIndex((x) => x.s === status);
  const pct = status === "cancelled" ? 0 : (Math.max(0, idx) / (STEPS.length - 1)) * 100;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-tl-bar]", { scaleX: 0, duration: 1.6, ease: "expo.inOut" });
        gsap.from("[data-tl-dot]", { scale: 0.4, opacity: 0, duration: 0.6, stagger: 0.12, ease: "back.out(2)" });
        gsap.from("[data-tl-ev]", { x: -16, opacity: 0, duration: 0.6, stagger: 0.06, delay: 0.4 });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [status] },
  );

  const at = (s: OrderStatus) => timeline.find((e) => e.status === s)?.at ?? null;

  return (
    <div ref={ref}>
      {status === "cancelled" ? (
        <div className="flex items-center gap-3 rounded-2xl bg-stone-100 p-5 text-stone-700"><LuCircleX className="size-6" /><span className="font-semibold">{t.status.cancelled}</span></div>
      ) : (
        <div className="relative px-2">
          <div className="absolute inset-x-[10%] top-6 h-1 rounded-full bg-line">
            <div data-tl-bar className="h-full origin-left rounded-full bg-accent rtl:origin-right" style={{ width: `${pct}%` }} />
          </div>
          <ol className="relative grid grid-cols-5 gap-2">
            {STEPS.map(({ s, Icon }, i) => {
              const done = i <= idx;
              return (
                <li key={s} className="flex flex-col items-center text-center">
                  <span data-tl-dot className={cn("grid size-12 place-items-center rounded-full border-4 border-page transition-colors", done ? "bg-accent text-white" : "bg-surface text-mute", i === idx && "ring-4 ring-accent/20")}>
                    <Icon className="size-5" />
                  </span>
                  <span className={cn("mt-3 text-[12.5px] font-semibold sm:text-sm", !done && "text-mute")}>{t.status[s]}</span>
                  {at(s) && <span className="mt-0.5 hidden text-[11.5px] text-mute sm:block">{formatDate(at(s), locale)}</span>}
                </li>
              );
            })}
          </ol>
        </div>
      )}
      <ul className="mt-10 space-y-4 border-s-2 border-line ps-6">
        {[...timeline].reverse().map((e, i) => (
          <li data-tl-ev key={i} className="relative">
            <span className={cn("absolute -start-[31px] top-1 size-3 rounded-full ring-4 ring-page", i === 0 ? "bg-accent" : "bg-line")} />
            <p className="text-sm font-semibold">{t.status[e.status]}</p>
            {e.note && <p className="text-sm text-mute">{e.note}</p>}
            <p className="text-xs text-mute">{formatDate(e.at, locale, true)}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
