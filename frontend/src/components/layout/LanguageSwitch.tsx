"use client";

import { useI18n } from "@/i18n/client";
import { cn } from "@/lib/utils";

/** EN | عربي toggle — stores the choice in a cookie and re-renders server components. */
export function LanguageSwitch({ className, tone = "dark" }: { className?: string; tone?: "dark" | "light" }) {
  const { locale, setLocale } = useI18n();
  return (
    <div role="group" aria-label="Language" className={cn("flex items-center rounded-full p-0.5 text-[12px] font-bold", tone === "dark" ? "bg-surface" : "bg-white/10", className)}>
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => l !== locale && setLocale(l)}
          aria-pressed={locale === l}
          lang={l}
          className={cn(
            "rounded-full px-3 py-1.5 transition-colors",
            locale === l ? (tone === "dark" ? "bg-fg text-page" : "bg-page text-fg") : tone === "dark" ? "text-mute hover:text-fg" : "text-white/70 hover:text-white",
          )}
        >
          {l === "en" ? "EN" : "عربي"}
        </button>
      ))}
    </div>
  );
}
