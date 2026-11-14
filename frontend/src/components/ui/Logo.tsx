import { cn } from "@/lib/utils";

/**
 * Al Sharq Exhibition mark: a Qatari arch (the showroom doorway) with a gold sun
 * rising on the horizon ("Sharq" = east). Inner arch line adds depth.
 */
export function LogoMark({ className = "size-10", light }: { className?: string; light?: boolean }) {
  const bg = light ? "#f8f4ec" : "#0e4a3b";
  const fg = light ? "#0e4a3b" : "#f8f4ec";
  const gold = "#b5893f";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden>
      <rect width="48" height="48" rx="13" fill={bg} />
      {/* outer arch */}
      <path d="M11.5 37V22a12.5 12.5 0 0 1 25 0v15" fill="none" stroke={fg} strokeWidth="2.4" strokeLinecap="round" />
      {/* inner arch */}
      <path d="M16.5 37V23a7.5 7.5 0 0 1 15 0v14" fill="none" stroke={gold} strokeWidth="1.2" strokeLinecap="round" opacity=".75" />
      {/* sun */}
      <circle cx="24" cy="30" r="4.6" fill={gold} />
      {/* rays */}
      <path d="M24 22.6v-1.6M17.9 26.4l-1.2-1.1M30.1 26.4l1.2-1.1" stroke={gold} strokeWidth="1.6" strokeLinecap="round" />
      {/* horizon */}
      <path d="M8.5 37h31" stroke={fg} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, light, locale = "en" }: { className?: string; light?: boolean; locale?: "en" | "ar" }) {
  const ar = locale === "ar";
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark light={light} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display block whitespace-nowrap text-[22px] font-semibold tracking-tight", light ? "text-page" : "text-fg")}>
          {ar ? "معرض الشرق" : "Al Sharq"}
        </span>
        {ar ? (
          <span className="mt-1 block text-[11px] font-bold text-gold">للأثاث</span>
        ) : (
          <span className="mt-1.5 flex items-center gap-2">
            <span className="h-px w-4 bg-gold" />
            <span className="block text-[8.5px] font-bold uppercase tracking-[0.34em] text-gold">Exhibition</span>
          </span>
        )}
      </span>
    </span>
  );
}
