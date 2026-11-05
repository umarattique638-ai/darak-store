"use client";

import { LuBadgeCheck, LuBanknote, LuMapPinned, LuTruck } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = [LuTruck, LuBanknote, LuMapPinned, LuBadgeCheck];

export function Perks() {
  const { t } = useI18n();
  return (
    <section className="py-20">
      <Reveal as="ul" stagger className="container-x grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {t.home.perks.map((p, i) => {
          const Icon = ICONS[i] ?? LuBadgeCheck;
          return (
            <li key={p.t} className="group rounded-3xl border border-line bg-white/60 p-7 transition-all duration-500 hover:-translate-y-1 hover:border-accent/30 hover:bg-white hover:shadow-[0_30px_60px_-40px_rgba(138,21,56,0.6)]">
              <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-accent transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"><Icon className="size-6" /></span>
              <h3 className="mt-6 font-display text-[19px] leading-snug">{p.t}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-mute">{p.d}</p>
            </li>
          );
        })}
      </Reveal>
    </section>
  );
}
