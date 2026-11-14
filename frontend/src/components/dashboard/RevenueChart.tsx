"use client";

import { useMemo, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { formatMoney } from "@/i18n/format";

/** Lightweight SVG area chart (30 days). Line draws in on mount; hover shows the day. */
export function RevenueChart({ series }: { series: { date: string; revenue: number; orders: number }[] }) {
  const ref = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const W = 720, H = 220, P = 8;
  const max = Math.max(1, ...series.map((s) => s.revenue));
  const pts = useMemo(() => series.map((s, i) => [P + (i / Math.max(1, series.length - 1)) * (W - P * 2), H - P - (s.revenue / max) * (H - P * 2 - 16)] as const), [series, max]);
  const line = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${W - P},${H - P} L${P},${H - P} Z`;

  useGSAP(
    () => {
      const path = ref.current?.querySelector<SVGPathElement>("[data-line]");
      if (!path) return;
      const len = path.getTotalLength();
      gsap.fromTo(path, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" });
      gsap.from("[data-area]", { opacity: 0, duration: 1.2, delay: 0.6 });
    },
    { scope: ref, dependencies: [line] },
  );

  const h = hover !== null ? series[hover] : null;
  return (
    <div className="relative">
      <svg
        ref={ref}
        viewBox={`0 0 ${W} ${H}`}
        className="h-56 w-full"
        preserveAspectRatio="none"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(series.length - 1, Math.round(((x - P) / (W - P * 2)) * (series.length - 1)))));
        }}
        role="img"
        aria-label="Revenue over the last 30 days"
      >
        <defs>
          <linearGradient id="rev" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8a1538" stopOpacity="0.25" /><stop offset="1" stopColor="#8a1538" stopOpacity="0" /></linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => <line key={f} x1={P} x2={W - P} y1={H * f} y2={H * f} stroke="#e6ddd0" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />)}
        <path data-area d={area} fill="url(#rev)" />
        <path data-line d={line} fill="none" stroke="#8a1538" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        {hover !== null && pts[hover] && <line x1={pts[hover][0]} x2={pts[hover][0]} y1={P} y2={H - P} stroke="#1d1b19" strokeOpacity=".25" vectorEffect="non-scaling-stroke" />}
      </svg>
      {h && hover !== null && pts[hover] && (
        <div className="pointer-events-none absolute top-2 -translate-x-1/2 rounded-lg bg-fg px-3 py-2 text-xs text-page shadow-lg" style={{ left: `${(pts[hover][0] / W) * 100}%` }}>
          <p className="font-semibold">{formatMoney(h.revenue, "en")}</p>
          <p className="text-page/70">{h.date} · {h.orders} orders</p>
        </div>
      )}
      <div className="mt-2 flex justify-between text-[11px] text-mute"><span>{series[0]?.date}</span><span>{series.at(-1)?.date}</span></div>
    </div>
  );
}
