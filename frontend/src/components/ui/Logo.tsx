import { cn } from "@/lib/utils";

/** Darak monogram: an arch (doorway — "your home") with a seat line. */
export function LogoMark({ className = "size-9", light }: { className?: string; light?: boolean }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill={light ? "#faf7f2" : "#8a1538"} />
      <path d="M11 31V19a9 9 0 0 1 18 0v12" fill="none" stroke={light ? "#8a1538" : "#faf7f2"} strokeWidth="2.6" strokeLinecap="round" />
      <path d="M15 31v-6h10v6M15 25h10" fill="none" stroke="#b8925a" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className, light, locale = "en" }: { className?: string; light?: boolean; locale?: "en" | "ar" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark light={light} />
      <span className="leading-none">
        <span className={cn("font-display block text-[22px] font-semibold tracking-tight", light ? "text-page" : "text-fg")}>{locale === "ar" ? "دارك" : "Darak"}</span>
        <span className="block text-[9.5px] font-bold tracking-[0.38em] text-gold uppercase">{locale === "ar" ? "للأثاث" : "Living"}</span>
      </span>
    </span>
  );
}
