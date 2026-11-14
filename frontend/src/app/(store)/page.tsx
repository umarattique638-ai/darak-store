import { getProducts } from "@/lib/server/api";
import { getDictionary } from "@/i18n/server";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { BannerCarousel } from "@/components/home/BannerCarousel";
import { ServicesGrid } from "@/components/home/ServicesGrid";
import { CustomBanner } from "@/components/home/CustomBanner";
import { Perks } from "@/components/home/Perks";
import { FAQ } from "@/components/home/FAQ";
import { Gallery } from "@/components/home/Gallery";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";

export default async function HomePage() {
  const [{ t }, featured, pool] = await Promise.all([getDictionary(), getProducts("featured=1&limit=8&sort=popular"), getProducts("limit=12&sort=popular")]);
  const heroImages = pool.items.map((p) => p.images[0]?.url).filter((u): u is string => Boolean(u));
  return (
    <>
      <Hero images={heroImages} />
      <Marquee />
      <div className="pb-24 pt-4">
        <BannerCarousel priority />
      </div>
      <ServicesGrid />
      {featured.items.length > 0 && (
        <section className="bg-surface/60 py-24">
          <div className="container-x">
            <SectionHeading eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} />
            <ProductGrid products={featured.items} className="mt-14" />
            <div className="mt-14 text-center"><ButtonLink href="/shop" variant="outline" size="lg">{t.common.viewAll}</ButtonLink></div>
          </div>
        </section>
      )}
      <CustomBanner />
      <Perks />
      <Gallery />
      <FAQ />
    </>
  );
}
