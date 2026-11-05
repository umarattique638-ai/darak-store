"use client";

import { useRef, type ElementType, type ReactNode, type ComponentPropsWithoutRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

type RevealProps<T extends ElementType> = {
  as?: T;
  children: ReactNode;
  /** animate direct children one after another instead of the wrapper as a whole */
  stagger?: boolean;
  /** vertical distance in px */
  y?: number;
  delay?: number;
} & Omit<ComponentPropsWithoutRef<T>, "children">;

/**
 * Lightweight "fade up when visible" wrapper. Plays once, never pins or
 * hijacks scrolling, and is skipped entirely for reduced-motion users.
 */
export function Reveal<T extends ElementType = "div">({
  as,
  children,
  stagger = false,
  y = 40,
  delay = 0,
  ...rest
}: RevealProps<T>) {
  const ref = useRef<HTMLElement>(null);
  const Tag = (as ?? "div") as ElementType;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = ref.current!;
        const targets = stagger ? Array.from(el.children) : [el];
        gsap.set(targets, { y, opacity: 0 });
        ScrollTrigger.batch(targets, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { y: 0, opacity: 1, duration: 0.9, ease: "expo.out", stagger: 0.08, delay, overwrite: true }),
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}
