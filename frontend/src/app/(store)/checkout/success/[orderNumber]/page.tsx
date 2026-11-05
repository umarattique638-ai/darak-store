import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderSuccess } from "@/components/checkout/OrderSuccess";

export const metadata: Metadata = { robots: { index: false } };

export default async function SuccessPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params;
  if (!/^DRK-\d{6}-\d{6}$/.test(orderNumber)) notFound();
  return <div className="container-x pt-36 pb-28 lg:pt-44"><OrderSuccess orderNumber={orderNumber} /></div>;
}
