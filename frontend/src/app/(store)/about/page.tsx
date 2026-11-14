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
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { Crossfade } from "@/components/ui/Crossfade";
import { aboutSlides, gallery } from "@/content/showcase";
import { LuCamera } from "react-icons/lu";

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
      <div className="pb-24"><BannerCarousel slides={aboutSlides} /></div>
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

      <section className="container-x pb-24">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="eyebrow inline-flex items-center gap-2"><LuCamera className="size-4" />{locale === "ar" ? "من أعمالنا" : "From our range"}</p>
            <h2 className="display mt-3 text-[clamp(2rem,4vw,3.2rem)]">{locale === "ar" ? "لمحة من منتجاتنا" : "A glimpse of what we make"}</h2>
            <p className="mt-4 max-w-2xl leading-relaxed text-mute">
              {locale === "ar"
                ? "كل قطعة يمكن تعديلها حسب مقاسك ولونك وميزانيتك. هذه أمثلة من مجموعتنا في المعرض والورشة."
                : "Every piece can be adjusted to your size, colour and budget. Here are some examples from our showroom and workshop."}
            </p>
          </div>
        </div>
        <Reveal as="ul" stagger className="grid auto-rows-[220px] grid-cols-2 gap-4 md:grid-cols-3 md:auto-rows-[260px]">
          {gallery.map((g, i) => (
            <li key={g.image} className={i === 0 ? "md:row-span-2" : undefined}>
              <div className="group relative h-full overflow-hidden rounded-3xl bg-surface">
                <Crossfade src={g.image} />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-fg/85 via-fg/40 to-transparent p-5 pt-16">
                  <p className="font-display text-[19px] text-page">{locale === "ar" ? g.label.ar : g.label.en}</p>
                  <p className="mt-1 max-w-xs text-[13px] leading-snug text-page/80 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 md:translate-y-1 md:opacity-0">{locale === "ar" ? g.desc.ar : g.desc.en}</p>
                </div>
              </div>
            </li>
          ))}
        </Reveal>
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
