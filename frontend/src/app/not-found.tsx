import Link from "next/link";
import { getDictionary } from "@/i18n/server";

export default async function NotFound() {
  const { t, locale } = await getDictionary();
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="display text-[9rem] leading-none text-accent/15 select-none">404</p>
        <h1 className="display -mt-10 text-4xl">{locale === "ar" ? "الصفحة غير موجودة" : "This room is empty"}</h1>
        <p className="mt-3 text-mute">{locale === "ar" ? "ربما نُقلت الصفحة أو لم تعد موجودة." : "The page you're looking for has moved or no longer exists."}</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-deep">{t.nav.home}</Link>
          <Link href="/shop" className="rounded-full border border-line px-6 py-3 text-sm font-semibold hover:border-fg">{t.nav.shop}</Link>
        </div>
      </div>
    </main>
  );
}
