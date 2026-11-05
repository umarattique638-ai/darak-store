"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { dictionaries, type Dictionary } from "./dictionaries";
import { LOCALE_COOKIE, type Locale } from "./config";

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
}

const I18nCtx = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const router = useRouter();
  const setLocale = useCallback(
    (l: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      document.documentElement.lang = l;
      document.documentElement.dir = l === "ar" ? "rtl" : "ltr";
      router.refresh();
    },
    [router],
  );
  return <I18nCtx.Provider value={{ locale, t: dictionaries[locale], setLocale }}>{children}</I18nCtx.Provider>;
}

export function useI18n() {
  const v = useContext(I18nCtx);
  if (!v) throw new Error("useI18n must be used inside <I18nProvider>");
  return v;
}

/** Pick the right side of a bilingual {en, ar} value. */
export function useLocalized() {
  const { locale } = useI18n();
  return (v: { en: string; ar: string } | undefined | null) => (v ? (locale === "ar" ? v.ar || v.en : v.en) : "");
}
