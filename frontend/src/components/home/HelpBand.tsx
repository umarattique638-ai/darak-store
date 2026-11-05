"use client";

import Link from "next/link";
import Image from "next/image";
import { FaWhatsapp } from "react-icons/fa6";
import { LuMapPin, LuPackageSearch, LuPhone } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { Reveal } from "@/components/ui/Reveal";
import { siteConfig, tel } from "@/config/site";

/** Replaces the newsletter: real ways to reach the shop (WhatsApp, call, showroom, tracking). */
export function HelpBand() {
  const { t, locale } = useI18n();
  const items = [
    { href: siteConfig.mapUrl, label: t.home.helpVisit, sub: siteConfig.address[locale], Icon: LuMapPin, ext: true },
    { href: tel(siteConfig.landline), label: t.home.helpCall, sub: siteConfig.landline, Icon: LuPhone, ltr: true },
    { href: "/track", label: t.home.helpTrack, sub: "DRK-…", Icon: LuPackageSearch },
  ];
  return (
    <section className="pb-24">
      <Reveal className="container-x">
        <div className="relative grid overflow-hidden rounded-[2rem] bg-dark text-page lg:grid-cols-[1.1fr_1fr]">
          <div className="relative z-10 p-8 md:p-12">
            <p className="eyebrow text-gold">{t.home.helpEyebrow}</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">{t.home.helpTitle}</h2>
            <p className="mt-4 max-w-md leading-relaxed text-page/70">{t.home.helpText}</p>
            <a href={siteConfig.whatsapp} target="_blank" rel="noopener noreferrer" className="group mt-8 inline-flex items-center gap-3 rounded-full bg-[#25d366] px-6 py-3.5 font-semibold text-[#073b1c] transition-transform hover:-translate-y-0.5">
              <FaWhatsapp className="size-5 transition-transform group-hover:rotate-12" /> {t.home.helpWhatsapp}
            </a>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {items.map(({ href, label, sub, Icon, ext, ltr }) => {
                const inner = (
                  <>
                    <Icon className="size-5 text-gold transition-transform duration-300 group-hover:scale-110" />
                    <span className="mt-3 block text-sm font-semibold">{label}</span>
                    <span dir={ltr ? "ltr" : undefined} className="block truncate text-xs text-page/55">{sub}</span>
                  </>
                );
                return (
                  <li key={label}>
                    {href.startsWith("/") ? (
                      <Link href={href} className="group block rounded-2xl border border-page/10 p-4 transition-colors hover:border-gold/50 hover:bg-page/5">{inner}</Link>
                    ) : (
                      <a href={href} target={ext ? "_blank" : undefined} rel="noopener noreferrer" className="group block rounded-2xl border border-page/10 p-4 transition-colors hover:border-gold/50 hover:bg-page/5">{inner}</a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="relative min-h-64">
            <Image src="/images/scenes/hero-chair.webp" alt="" fill unoptimized sizes="(max-width:1024px) 100vw, 45vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-dark via-dark/20 to-transparent rtl:bg-gradient-to-l" />
          </div>
        </div>
      </Reveal>
    </section>
  );
}
