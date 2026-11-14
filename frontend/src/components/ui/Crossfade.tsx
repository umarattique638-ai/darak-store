"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Image that cross-fades to a new src only after the new file has loaded.
 * Two layers are kept mounted, so there is never a blank or flickering frame.
 */
export function Crossfade({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  const [slots, setSlots] = useState<[string, string]>([src, src]);
  const [active, setActive] = useState<0 | 1>(0);

  useEffect(() => {
    if (src === slots[active]) return;
    const next: 0 | 1 = active === 0 ? 1 : 0;
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setSlots((prev) => {
        const c: [string, string] = [prev[0], prev[1]];
        c[next] = src;
        return c;
      });
      setActive(next);
    };
    return () => {
      img.onload = null;
    };
  }, [src, active, slots]);

  return (
    <>
      {([0, 1] as const).map((i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          src={slots[i]}
          alt={i === active ? alt : ""}
          aria-hidden={i !== active}
          draggable={false}
          className={cn("absolute inset-0 h-full w-full object-cover transition-opacity duration-[1100ms] ease-out", i === active ? "opacity-100" : "opacity-0", className)}
        />
      ))}
    </>
  );
}
