import { getCategories, getProducts } from "@/lib/server/api";
import { getDictionary } from "@/i18n/server";
import { Hero } from "@/components/home/Hero";
import { Marquee } from "@/components/home/Marquee";
import { Categories } from "@/components/home/Categories";
import { ShopTheLook, type LookSpot } from "@/components/home/ShopTheLook";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CustomBanner } from "@/components/home/CustomBanner";
import { HelpBand } from "@/components/home/HelpBand";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { lookImage, lookSpots } from "@/content/look";

export default async function HomePage() {
  const [{ t }, categories, featured, all] = await Promise.all([
    getDictionary(),
    getCategories(),
    getProducts("featured=1&limit=8&sort=popular"),
    getProducts("limit=60"),
  ]);
  const bySku = new Map(all.items.map((p) => [p.sku, p]));
  const spots: LookSpot[] = lookSpots.flatMap((s) => {
    const product = bySku.get(s.sku);
    return product ? [{ product, x: s.x, y: s.y }] : [];
  });

  return (
    <>
      <Hero />
      <Marquee />
      <Categories categories={categories} />
      <ShopTheLook image={lookImage} spots={spots} />
      {featured.items.length > 0 && (
        <section className="bg-surface/60 py-24">
          <div className="container-x">
            <SectionHeading eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} />
            <ProductGrid products={featured.items} className="mt-14" />
            <div className="mt-14 text-center"><ButtonLink href="/shop" variant="outline" size="lg">{t.common.viewAll}</ButtonLink></div>
          </div>
        </section>
      )}
      <HowItWorks />
      <CustomBanner />
      <HelpBand />
    </>
  );
}
