"use client";

import { LuHeart } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { useCurrentUser } from "@/store/hooks";
import { useWishlistQuery } from "@/store/api";
import { ProductGrid } from "./ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

export function WishlistView() {
  const { t } = useI18n();
  const user = useCurrentUser();
  const { data, isLoading } = useWishlistQuery(undefined, { skip: !user });
  if (!user)
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <LuHeart className="size-12 text-accent" />
        <p className="mt-4 font-display text-2xl">{t.wishlist.signIn}</p>
        <ButtonLink href="/login?next=/wishlist" className="mt-6">{t.nav.login}</ButtonLink>
      </div>
    );
  if (isLoading) return <div className="grid grid-cols-2 gap-6 md:grid-cols-4">{Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="aspect-[4/5]" />)}</div>;
  if (!data?.products.length)
    return (
      <div className="flex flex-col items-center py-16 text-center">
        <span className="grid size-24 place-items-center rounded-full bg-accent-soft"><LuHeart className="size-10 animate-pulse text-accent" /></span>
        <p className="mt-6 font-display text-3xl">{t.wishlist.empty}</p>
        <p className="mt-2 text-mute">{t.wishlist.emptyText}</p>
        <ButtonLink href="/shop" className="mt-8">{t.common.shopNow}</ButtonLink>
      </div>
    );
  return <ProductGrid products={data.products} />;
}
