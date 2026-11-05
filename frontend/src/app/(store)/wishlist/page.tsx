import type { Metadata } from "next";
import { getDictionary } from "@/i18n/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { WishlistView } from "@/components/product/WishlistView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.wishlist.title, robots: { index: false } };
}

export default async function WishlistPage() {
  const { t } = await getDictionary();
  return (
    <>
      <PageHeader title={t.wishlist.title} />
      <section className="container-x pb-28"><WishlistView /></section>
    </>
  );
}
