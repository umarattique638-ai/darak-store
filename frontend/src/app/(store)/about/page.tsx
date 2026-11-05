import type { Metadata } from "next";
import Image from "next/image";
import { LuHammer, LuHeartHandshake, LuRuler } from "react-icons/lu";
import { getDictionary, getLocale } from "@/i18n/server";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Numbers } from "@/components/about/Numbers";
import { AboutParallax } from "@/components/about/AboutParallax";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.nav.about, description: t.about.text };
}

const ICONS = [LuHammer, LuRuler, LuHeartHandshake];

export default async function AboutPage() {
  const [{ t }, locale] = await Promise.all([getDictionary(), getLocale()]);
  return (
    <>
      <PageHeader eyebrow={t.about.eyebrow} title={t.about.title} text={t.about.text} />
      <section className="container-x pb-24"><AboutParallax src="/images/scenes/living-wide.webp" /></section>
      <section className="container-x pb-24"><Numbers items={t.about.numbers} /></section>

      <section className="bg-surface/70 py-24">
        <div className="container-x">
          <h2 className="display text-[clamp(2rem,4vw,3.2rem)]">{t.about.valuesTitle}</h2>
          <Reveal as="ul" stagger className="mt-12 grid gap-6 md:grid-cols-3">
            {t.about.values.map((v, i) => {
              const Icon = ICONS[i] ?? LuHammer;
              return (
                <li key={v.t} className="group rounded-3xl bg-page p-8 transition-transform duration-500 hover:-translate-y-1.5">
                  <Icon className="size-8 text-accent transition-transform duration-500 group-hover:rotate-12" />
                  <h3 className="mt-8 font-display text-2xl">{v.t}</h3>
                  <p className="mt-3 leading-relaxed text-mute">{v.d}</p>
                </li>
              );
            })}
          </Reveal>
        </div>
      </section>

      <section className="py-24">
        <Reveal className="container-x grid items-center gap-12 lg:grid-cols-2">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[2rem]">
            <Image src={"/images/scenes/dining.webp"} alt="" fill unoptimized sizes="50vw" className="object-cover transition-transform duration-[1500ms] hover:scale-105" />
          </div>
          <div>
            <p className="eyebrow">{siteConfig.address[locale]}</p>
            <h2 className="display mt-4 text-[clamp(2rem,4vw,3.2rem)]">{t.about.studioTitle}</h2>
            <p className="mt-5 max-w-md leading-relaxed text-mute">{t.about.studioText}</p>
            <p className="mt-4 text-sm font-semibold">{siteConfig.hours[locale].map((h) => <span key={h} className="block">{h}</span>)}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/contact">{t.nav.contact}</ButtonLink>
              <ButtonLink href="/shop" variant="outline">{t.common.shopNow}</ButtonLink>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
