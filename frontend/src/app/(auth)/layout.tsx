import Link from "next/link";
import Image from "next/image";
import { getDictionary, getLocale } from "@/i18n/server";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";

/** Split screen: form on one side, an editorial interior photo on the other. */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const [{ t }, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-6 sm:px-12">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label={t.nav.home}><Logo locale={locale} /></Link>
          <LanguageSwitch />
        </div>
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-12">{children}</main>
        <p className="text-center text-xs text-mute">© {new Date().getFullYear()} Darak Living</p>
      </div>
      <div className="relative hidden overflow-hidden bg-dark lg:block">
        <Image src={"/images/scenes/bedroom.webp"} alt="" fill unoptimized priority sizes="50vw" className="animate-[authZoom_24s_ease-in-out_infinite_alternate] object-cover opacity-85" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 via-transparent to-transparent" />
        <blockquote className="absolute inset-x-12 bottom-12 animate-[toastIn_1s_.3s_both] text-page">
          <p className="display text-4xl leading-tight">{t.home.heroTitle}</p>
          <footer className="mt-4 text-sm text-page/70">{t.footer.tagline}</footer>
        </blockquote>
      </div>
    </div>
  );
}
