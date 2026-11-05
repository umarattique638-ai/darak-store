"use client";

import { useRouter } from "next/navigation";
import { LuHeart } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { useToggleWishlistMutation, useWishlistIdsQuery } from "@/store/api";
import { useCurrentUser } from "@/store/hooks";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function WishlistButton({ productId, className, withLabel }: { productId: string; className?: string; withLabel?: boolean }) {
  const { t } = useI18n();
  const user = useCurrentUser();
  const router = useRouter();
  const { data } = useWishlistIdsQuery(undefined, { skip: !user });
  const [toggle, { isLoading }] = useToggleWishlistMutation();
  const active = !!data?.ids.includes(productId);

  const onClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.info(t.common.signInRequired);
      router.push(`/login?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    try {
      const r = await toggle(productId).unwrap();
      toast.success(r.inWishlist ? t.common.wishlistAdded : t.common.wishlistRemoved);
    } catch {
      toast.error(t.common.error);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      aria-pressed={active}
      aria-label={active ? t.product.inWishlist : t.product.wishlist}
      className={cn("inline-flex items-center justify-center gap-2 transition-transform active:scale-90", className)}
    >
      <LuHeart className={cn("size-[18px] transition-all duration-300", active ? "scale-110 fill-accent text-accent" : "")} />
      {withLabel && <span>{active ? t.product.inWishlist : t.product.wishlist}</span>}
    </button>
  );
}
