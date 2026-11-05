import Link from "next/link";
import { LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import { getDictionary } from "@/i18n/server";
import { getCategories } from "@/lib/server/api";
import { pick } from "@/i18n/format";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/ui/Logo";

export async function Footer() {
  const [{ t, locale }, categories] = await Promise.all([getDictionary(), getCategories()]);
  const year = new Date().getFullYear();
  const col = "space-y-3 text-[14.5px] text-page/65";
  const link = "transition-colors hover:text-page";
  return (
    <footer className="bg-dark text-page">
      <div className="container-x grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-5">
          <Logo light locale={locale} />
          <p className="max-w-xs text-[14.5px] leading-relaxed text-page/60">{t.footer.tagline}</p>
          <ul className="flex gap-2">
            {siteConfig.socials.map((s) => (
              <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer noopener" className="rounded-full border border-page/15 px-3.5 py-1.5 text-[12px] font-semibold text-page/75 transition-colors hover:border-gold hover:text-gold">{s.label}</a></li>
            ))}
          </ul>
        </div>
        <nav aria-label={t.footer.shop}>
          <p className="eyebrow mb-5">{t.footer.shop}</p>
          <ul className={col}>
            {categories.slice(0, 6).map((c) => <li key={c.id}><Link className={link} href={`/shop?category=${c.slug}`}>{pick(c.name, locale)}</Link></li>)}
          </ul>
        </nav>
        <nav aria-label={t.footer.help}>
          <p className="eyebrow mb-5">{t.footer.help}</p>
          <ul className={col}>
            <li><Link className={link} href="/track">{t.nav.track}</Link></li>
            <li><Link className={link} href="/custom-design">{t.nav.custom}</Link></li>
            <li><Link className={link} href="/account">{t.nav.account}</Link></li>
            <li><Link className={link} href="/about">{t.nav.about}</Link></li>
            <li><Link className={link} href="/contact">{t.nav.contact}</Link></li>
          </ul>
        </nav>
        <div>
          <p className="eyebrow mb-5">{t.contact.visit}</p>
          <ul className={col}>
            <li className="flex gap-3"><LuMapPin className="mt-1 size-4 shrink-0 text-gold" />{siteConfig.address[locale]}</li>
            <li className="flex gap-3"><LuPhone className="mt-1 size-4 shrink-0 text-gold" /><a className={link} href={siteConfig.whatsapp} dir="ltr">{siteConfig.phone}</a></li>
            <li className="flex gap-3"><LuMail className="mt-1 size-4 shrink-0 text-gold" /><a className={link} href={`mailto:${siteConfig.email}`}>{siteConfig.email}</a></li>
            <li className="text-page/45">{siteConfig.hours[locale]}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-page/10">
        <div className="container-x flex flex-wrap items-center justify-between gap-3 py-6 text-[12.5px] text-page/45">
          <p>© {year} {siteConfig.legalName}. {t.footer.rights}</p>
          <p>{t.footer.payments}</p>
        </div>
      </div>
    </footer>
  );
}
