"use client";

import { useI18n } from "@/i18n/client";

export function Marquee() {
  const { t, locale } = useI18n();
  const row = [...t.home.marquee, ...t.home.marquee];
  return (
    <div className="overflow-hidden border-y border-line bg-surface py-5" aria-hidden>
      <div className={`flex w-max gap-12 ${locale === "ar" ? "animate-[marquee-rtl_45s_linear_infinite]" : "animate-[marquee_45s_linear_infinite]"}`}>
        {row.map((w, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-[26px] whitespace-nowrap text-fg/80">
            {w} <span className="text-gold">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
