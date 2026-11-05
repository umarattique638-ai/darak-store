"use client";

import Link from "next/link";
import { LuHeart, LuMapPin, LuPackage, LuPencilRuler } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { useCurrentUser } from "@/store/hooks";
import { useMyDesignsQuery, useMyOrdersQuery } from "@/store/api";
import { OrderList } from "@/components/account/OrderList";

export default function AccountOverview() {
  const { t } = useI18n();
  const user = useCurrentUser();
  const { data: orders } = useMyOrdersQuery();
  const { data: designs } = useMyDesignsQuery();
  const tiles = [
    { href: "/account/orders", label: t.account.orders, v: orders?.orders.length ?? "–", Icon: LuPackage },
    { href: "/wishlist", label: t.nav.wishlist, v: user?.wishlistCount ?? 0, Icon: LuHeart },
    { href: "/account/designs", label: t.account.designs, v: designs?.designs.length ?? "–", Icon: LuPencilRuler },
    { href: "/account/addresses", label: t.account.addresses, v: user?.addresses.length ?? 0, Icon: LuMapPin },
  ];
  return (
    <>
      <h1 className="display text-[clamp(2rem,4vw,3rem)]">{fill(t.account.hello, { name: user?.name.split(" ")[0] ?? "" })}</h1>
      <ul className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {tiles.map(({ href, label, v, Icon }, i) => (
          <li key={href} style={{ animationDelay: `${i * 70}ms` }} className="animate-[toastIn_.6s_both]">
            <Link href={href} className="group block rounded-2xl bg-surface p-5 transition-colors hover:bg-accent hover:text-white">
              <Icon className="size-5 text-accent transition-colors group-hover:text-white" />
              <p className="mt-6 font-display text-3xl">{v}</p>
              <p className="text-sm text-mute group-hover:text-white/75">{label}</p>
            </Link>
          </li>
        ))}
      </ul>
      <h2 className="mt-12 mb-5 font-display text-2xl">{t.account.orders}</h2>
      <OrderList limit={5} />
    </>
  );
}
