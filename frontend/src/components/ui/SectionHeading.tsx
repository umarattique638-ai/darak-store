import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

export function SectionHeading({ eyebrow, title, text, align = "center", className, action }: { eyebrow?: string; title: ReactNode; text?: ReactNode; align?: "center" | "start"; className?: string; action?: ReactNode }) {
  return (
    <Reveal stagger className={cn("flex flex-col gap-3", align === "center" ? "mx-auto max-w-2xl items-center text-center" : "items-start", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="display text-[clamp(2rem,4vw,3.25rem)]">{title}</h2>
      {text && <p className="max-w-xl text-[16px] leading-relaxed text-mute">{text}</p>}
      {action}
    </Reveal>
  );
}
