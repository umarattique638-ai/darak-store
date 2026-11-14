"use client";

import { useState } from "react";
import { LuPlus } from "react-icons/lu";
import { useLocalized } from "@/i18n/client";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";
import { faqHeading, faqs } from "@/content/showcase";

/** Accordion of common questions. The panel height animates with a grid-rows transition. */
export function FAQ() {
  const L = useLocalized();
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section className="py-24">
      <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-20">
        <div className="lg:sticky lg:top-28 lg:h-fit">
          <SectionHeading align="start" eyebrow={L(faqHeading.eyebrow)} title={L(faqHeading.title)} />
        </div>
        <Reveal as="ul" stagger className="divide-y divide-line border-y border-line">
          {faqs.map((f, i) => {
            const isOpen = open === i;
            return (
              <li key={f.q.en}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-6 py-6 text-start"
                >
                  <span className={cn("font-display text-[21px] leading-snug transition-colors duration-300", isOpen ? "text-accent" : "group-hover:text-accent")}>{L(f.q)}</span>
                  <span className={cn("grid size-9 shrink-0 place-items-center rounded-full border border-line transition-all duration-500", isOpen && "rotate-45 border-accent bg-accent text-page")}>
                    <LuPlus className="size-4" />
                  </span>
                </button>
                <div className={cn("grid transition-[grid-template-rows] duration-500 ease-[var(--ease-out-expo)]", isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                  <div className="overflow-hidden">
                    <p className={cn("max-w-2xl pb-7 leading-relaxed text-mute transition-opacity duration-500", isOpen ? "opacity-100" : "opacity-0")}>{L(f.a)}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
