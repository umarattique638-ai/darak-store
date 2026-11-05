"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuHeart, LuLayoutDashboard, LuLogOut, LuMapPin, LuPackage, LuPencilRuler, LuShield, LuUser } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { useLogoutMutation } from "@/store/api";
import { useAppDispatch, useCurrentUser } from "@/store/hooks";
import { loggedOut } from "@/store/authSlice";
import { api } from "@/store/api";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export function AccountNav() {
  const { t } = useI18n();
  const path = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useCurrentUser();
  const [logout] = useLogoutMutation();
  const links = [
    { href: "/account", label: t.account.overview, Icon: LuLayoutDashboard },
    { href: "/account/orders", label: t.account.orders, Icon: LuPackage },
    { href: "/wishlist", label: t.nav.wishlist, Icon: LuHeart },
    { href: "/account/designs", label: t.account.designs, Icon: LuPencilRuler },
    { href: "/account/addresses", label: t.account.addresses, Icon: LuMapPin },
    { href: "/account/profile", label: t.account.profile, Icon: LuUser },
    { href: "/account/security", label: t.account.security, Icon: LuShield },
  ];
  return (
    <aside className="lg:sticky lg:top-28 lg:h-fit">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid size-12 place-items-center rounded-full bg-accent font-display text-lg text-white">{user?.name?.[0]?.toUpperCase()}</span>
        <div className="min-w-0"><p className="truncate font-semibold">{user?.name}</p><p className="truncate text-xs text-mute">{user?.email}</p></div>
      </div>
      <nav className="-mx-1 flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
        {links.map(({ href, label, Icon }) => {
          const active = href === "/account" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} className={cn("flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-[14.5px] font-medium transition-colors", active ? "bg-fg text-page" : "text-fg/75 hover:bg-surface")}>
              <Icon className="size-4" /> {label}
            </Link>
          );
        })}
        <button
          onClick={async () => {
            await logout().unwrap().catch(() => undefined);
            dispatch(loggedOut());
            dispatch(api.util.resetApiState());
            toast.info(t.auth.signedOut);
            router.replace("/");
            router.refresh();
          }}
          className="flex shrink-0 items-center gap-3 rounded-xl px-4 py-2.5 text-[14.5px] font-medium text-red-600 hover:bg-red-50"
        >
          <LuLogOut className="size-4 flip-rtl" /> {t.nav.logout}
        </button>
      </nav>
    </aside>
  );
}
