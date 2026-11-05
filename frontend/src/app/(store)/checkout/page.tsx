import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/api";
import { getDictionary } from "@/i18n/server";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { robots: { index: false } };

export default async function CheckoutPage() {
  const [user, { t }] = await Promise.all([getSessionUser(), getDictionary()]);
  if (user === null) redirect("/login?next=/checkout");
  return (
    <div className="container-x pt-32 pb-28 lg:pt-40">
      <h1 className="display mb-10 text-[clamp(2.4rem,5vw,4rem)] animate-[fadeIn_.6s]">{t.checkout.title}</h1>
      <CheckoutForm />
    </div>
  );
}
