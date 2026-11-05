import type { Metadata } from "next";
import { Suspense } from "react";
import { LuPackageSearch } from "react-icons/lu";
import { getCategories, getProducts } from "@/lib/server/api";
import { getDictionary, getLocale } from "@/i18n/server";
import { pick } from "@/i18n/format";
import { PageHeader } from "@/components/ui/PageHeader";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ShopSidebar, ShopToolbar } from "@/components/shop/ShopToolbar";
import { Pagination } from "@/components/shop/Pagination";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.shop.title, description: t.shop.subtitle };
}

const ALLOWED = ["q", "category", "material", "minPrice", "maxPrice", "inStock", "onSale", "sort", "page"] as const;

export default async function ShopPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const qs = new URLSearchParams({ limit: "12" });
  for (const k of ALLOWED) {
    const v = sp[k];
    if (typeof v === "string" && v.length <= 80) qs.set(k, v);
  }
  const [{ t }, locale, categories, list] = await Promise.all([getDictionary(), getLocale(), getCategories(), getProducts(qs.toString())]);
  const activeCat = categories.find((c) => c.slug === sp.category);

  return (
    <>
      <PageHeader eyebrow={t.shop.title} title={activeCat ? pick(activeCat.name, locale) : t.shop.title} text={activeCat ? pick(activeCat.description, locale) || t.shop.subtitle : t.shop.subtitle} />
      <section className="container-x pb-28">
        <div className="grid gap-12 lg:grid-cols-[250px_1fr]">
          <Suspense><ShopSidebar categories={categories} priceRange={list.priceRange} /></Suspense>
          <div>
            <Suspense><ShopToolbar categories={categories} priceRange={list.priceRange} total={list.total} /></Suspense>
            {list.items.length ? (
              <ProductGrid products={list.items} priorityCount={3} className="lg:grid-cols-3" />
            ) : (
              <div className="flex flex-col items-center rounded-3xl border border-dashed border-line py-24 text-center">
                <LuPackageSearch className="size-12 text-mute" />
                <p className="mt-4 font-display text-2xl">{t.shop.noResults}</p>
              </div>
            )}
            <Suspense><Pagination page={list.page} pages={list.pages} /></Suspense>
          </div>
        </div>
      </section>
    </>
  );
}
