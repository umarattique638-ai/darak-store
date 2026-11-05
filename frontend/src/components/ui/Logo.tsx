import { cn } from "@/lib/utils";

/**
 * Al Sharq Exhibition mark: a Qatari arch (showroom doorway) with the sun rising
 * in the east ("Sharq") on the horizon line.
 */
export function LogoMark({ className = "size-9", light }: { className?: string; light?: boolean }) {
  const bg = light ? "#faf7f2" : "#8a1538";
  const fg = light ? "#8a1538" : "#faf7f2";
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <rect width="40" height="40" rx="11" fill={bg} />
      {/* arch */}
      <path d="M10.5 31V18.5a9.5 9.5 0 0 1 19 0V31" fill="none" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
      {/* rising sun + rays */}
      <path d="M14.5 27a5.5 5.5 0 0 1 11 0z" fill="#b8925a" />
      <path d="M20 17.6v2.2M14.2 20.3l1.4 1.5M25.8 20.3l-1.4 1.5" stroke="#b8925a" strokeWidth="1.8" strokeLinecap="round" />
      {/* horizon */}
      <path d="M12.5 27h15" stroke={fg} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, light, locale = "en" }: { className?: string; light?: boolean; locale?: "en" | "ar" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark light={light} />
      <span className="leading-none">
        <span className={cn("font-display block text-[21px] font-semibold tracking-tight whitespace-nowrap", light ? "text-page" : "text-fg")}>{locale === "ar" ? "معرض الشرق" : "Al Sharq"}</span>
        <span className={cn("mt-0.5 block font-bold text-gold uppercase", locale === "ar" ? "text-[10px] tracking-normal" : "text-[8.5px] tracking-[0.34em]")}>{locale === "ar" ? "للأثاث" : "Exhibition"}</span>
      </span>
    </span>
  );
}
