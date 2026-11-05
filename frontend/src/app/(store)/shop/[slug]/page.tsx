import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LuChevronRight } from "react-icons/lu";
import { getProduct } from "@/lib/server/api";
import { getDictionary, getLocale } from "@/i18n/server";
import { pick } from "@/i18n/format";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductPurchase } from "@/components/product/ProductPurchase";
import { ProductGrid } from "@/components/product/ProductGrid";
import { SectionHeading } from "@/components/ui/SectionHeading";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const [{ slug }, locale] = await Promise.all([params, getLocale()]);
  const data = await getProduct(slug);
  if (!data) return {};
  const p = data.product;
  return { title: pick(p.name, locale), description: pick(p.description, locale).slice(0, 160), openGraph: { images: p.images[0] ? [p.images[0].url] : [] } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) notFound();
  const [data, { t }, locale] = await Promise.all([getProduct(slug), getDictionary(), getLocale()]);
  if (!data) notFound();
  const { product: p, related } = data;
  const name = pick(p.name, locale);

  const jsonLd = {
    "@context": "https://schema.org", "@type": "Product", name, sku: p.sku, image: p.images.map((i) => i.url), description: pick(p.description, locale),
    offers: { "@type": "Offer", priceCurrency: "QAR", price: p.price, availability: p.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pt-28 lg:pt-32">
        <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-1.5 text-[13px] text-mute">
          <Link href="/" className="hover:text-fg">{t.nav.home}</Link><LuChevronRight className="size-3.5 flip-rtl" />
          <Link href="/shop" className="hover:text-fg">{t.nav.shop}</Link><LuChevronRight className="size-3.5 flip-rtl" />
          <Link href={`/shop?category=${p.category.slug}`} className="hover:text-fg">{pick(p.category.name, locale)}</Link><LuChevronRight className="size-3.5 flip-rtl" />
          <span aria-current="page" className="text-fg">{name}</span>
        </nav>
        <div className="grid gap-12 pb-24 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <ProductGallery images={p.images} name={name} />
          <ProductPurchase product={p} />
        </div>
      </div>
      {related.length > 0 && (
        <section className="border-t border-line bg-surface/60 py-24">
          <div className="container-x">
            <SectionHeading title={t.product.related} align="start" />
            <ProductGrid products={related.slice(0, 4)} className="mt-12" />
          </div>
        </section>
      )}
    </>
  );
}
