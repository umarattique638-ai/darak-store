import type { Metadata } from "next";
import { getDictionary } from "@/i18n/server";
import { CartView } from "@/components/cart/CartView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.cart.title, robots: { index: false } };
}

export default async function CartPage() {
  const { t } = await getDictionary();
  return (
    <div className="container-x pt-32 pb-28 lg:pt-40">
      <h1 className="display mb-10 text-[clamp(2.4rem,5vw,4rem)] animate-[fadeIn_.6s]">{t.cart.title}</h1>
      <CartView />
    </div>
  );
}
