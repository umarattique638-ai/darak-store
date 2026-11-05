import type { Locale } from "./config";

/** "QAR 4,890" / "4,890 ر.ق" — Latin digits in both languages for prices (common in Qatar). */
export function formatMoney(amount: number, locale: Locale, currency = "QAR") {
  const n = amount.toLocaleString("en-US", { maximumFractionDigits: 2 });
  return locale === "ar" ? `${n} ر.ق` : `${currency} ${n}`;
}

export function formatDate(iso: string | null, locale: Locale, withTime = false) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB", {
    day: "numeric", month: "short", year: "numeric", ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

/** Simple "{name}" template filling. */
export const fill = (s: string, vars: Record<string, string | number>) => s.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));
export const pick = (v: { en: string; ar: string } | undefined | null, locale: Locale) => (v ? (locale === "ar" ? v.ar || v.en : v.en) : "");
