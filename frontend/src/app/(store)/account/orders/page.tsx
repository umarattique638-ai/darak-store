"use client";

import { useI18n } from "@/i18n/client";
import { OrderList } from "@/components/account/OrderList";

export default function OrdersPage() {
  const { t } = useI18n();
  return (
    <>
      <h1 className="display mb-8 text-[clamp(2rem,4vw,3rem)]">{t.account.orders}</h1>
      <OrderList />
    </>
  );
}
