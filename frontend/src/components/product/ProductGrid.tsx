"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { ProductCard } from "./ProductCard";
import type { ProductDTO } from "@/types/api";
import { cn } from "@/lib/utils";

/** Cards rise in with a stagger whenever the list changes. */
export function ProductGrid({ products, className, priorityCount = 0 }: { products: ProductDTO[]; className?: string; priorityCount?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from("[data-card]", { y: 40, opacity: 0, duration: 0.8, stagger: 0.06, ease: "power3.out", clearProps: "all", scrollTrigger: { trigger: ref.current, start: "top 90%", once: true } });
      });
      return () => mm.revert();
    },
    { scope: ref, dependencies: [products.map((p) => p.id).join()] },
  );
  return (
    <div ref={ref} className={cn("grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6", className)}>
      {products.map((p, i) => <div key={p.id} data-card><ProductCard product={p} priority={i < priorityCount} /></div>)}
    </div>
  );
}
