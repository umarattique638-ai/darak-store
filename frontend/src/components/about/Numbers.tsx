"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Counts each number up from zero when it scrolls into view (keeps suffixes like "+" or " yr"). */
export function Numbers({ items }: { items: { v: string; l: string }[] }) {
  const ref = useRef<HTMLDListElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ref.current!.querySelectorAll<HTMLElement>("[data-n]").forEach((el) => {
          const raw = el.dataset.n!;
          const m = raw.match(/^([\d,]+)(.*)$/);
          if (!m) return;
          const target = Number(m[1]!.replace(/,/g, ""));
          const isYear = target > 1900 && target < 2100;
          const o = { v: isYear ? target - 30 : 0 };
          gsap.to(o, {
            v: target, duration: 2, ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 90%", once: true },
            onUpdate: () => (el.textContent = (isYear ? String(Math.round(o.v)) : Math.round(o.v).toLocaleString("en")) + m[2]),
          });
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );
  return (
    <dl ref={ref} className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl bg-line md:grid-cols-4">
      {items.map((n) => (
        <div key={n.l} className="flex flex-col-reverse gap-2 bg-page p-8 text-center">
          <dt className="text-sm text-mute">{n.l}</dt>
          <dd data-n={n.v} className="font-display text-5xl text-accent">{n.v}</dd>
        </div>
      ))}
    </dl>
  );
}
