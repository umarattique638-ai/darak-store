import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { getDictionary } from "@/i18n/server";
import { dirOf } from "@/i18n/config";
import { AppProviders } from "@/components/providers/AppProviders";
import { siteConfig } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const { t, locale } = await getDictionary();
  return {
    metadataBase: new URL(siteConfig.url),
    title: { default: t.meta.title, template: `%s — ${locale === "ar" ? "دارك" : "Darak Living"}` },
    description: t.meta.description,
    openGraph: { type: "website", siteName: siteConfig.legalName, title: t.meta.title, description: t.meta.description, locale: locale === "ar" ? "ar_QA" : "en_QA" },
    alternates: { languages: { en: "/", ar: "/" } },
  };
}

export const viewport: Viewport = { themeColor: "#8a1538", width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale } = await getDictionary();
  return (
    <html lang={locale} dir={dirOf(locale)} suppressHydrationWarning>
      <body>
        <AppProviders locale={locale}>{children}</AppProviders>
      </body>
    </html>
  );
}
