"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LuBoxes, LuExternalLink, LuFolderTree, LuInbox, LuLayoutDashboard, LuLogOut, LuMenu, LuPackage, LuPencilRuler, LuShoppingCart, LuUsers,
} from "react-icons/lu";
import { api, useLogoutMutation, useStatsQuery } from "@/store/api";
import { useAppDispatch, useCurrentUser } from "@/store/hooks";
import { loggedOut } from "@/store/authSlice";
import { LogoMark } from "@/components/ui/Logo";
import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { cn } from "@/lib/utils";
import type { UserDTO } from "@/types/api";

/** Admin chrome: collapsible dark sidebar with live badges for new orders, designs and leads. */
export function DashShell({ user: initialUser, children }: { user: UserDTO; children: ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useCurrentUser() ?? initialUser;
  const [open, setOpen] = useState(false);
  const [logout] = useLogoutMutation();
  const { data: stats } = useStatsQuery(undefined, { pollingInterval: 60_000 });

  const nav = [
    { href: "/dashboard", label: "Overview", Icon: LuLayoutDashboard },
    { href: "/dashboard/orders", label: "Orders", Icon: LuShoppingCart, badge: stats?.ordersByStatus.pending },
    { href: "/dashboard/products", label: "Products", Icon: LuPackage },
    { href: "/dashboard/categories", label: "Categories", Icon: LuFolderTree },
    { href: "/dashboard/inventory", label: "Inventory", Icon: LuBoxes, badge: stats?.lowStock.length, warn: true },
    { href: "/dashboard/designs", label: "Custom designs", Icon: LuPencilRuler, badge: stats?.newDesigns },
    { href: "/dashboard/leads", label: "Leads", Icon: LuInbox, badge: stats?.newLeads },
    { href: "/dashboard/customers", label: "Customers", Icon: LuUsers },
  ];

  const side = (
    <div className="flex h-full flex-col bg-dark text-page">
      <Link href="/dashboard" className="flex items-center gap-3 px-6 py-6">
        <LogoMark light className="size-9" />
        <span><span className="block font-display text-lg leading-none">Al Sharq</span><span className="text-[11px] tracking-[0.2em] text-page/50 uppercase">Dashboard</span></span>
      </Link>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        {nav.map(({ href, label, Icon, badge, warn }) => {
          const active = href === "/dashboard" ? path === href : path.startsWith(href);
          return (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={cn("group relative flex items-center gap-3 rounded-xl px-4 py-2.5 text-[14px] font-medium transition-colors", active ? "bg-page/10 text-page" : "text-page/60 hover:bg-page/5 hover:text-page")}>
              {active && <span className="absolute inset-y-2 start-0 w-1 rounded-full bg-accent" />}
              <Icon className="size-[18px]" /> {label}
              {!!badge && <span className={cn("ms-auto rounded-full px-2 py-0.5 text-[11px] font-bold", warn ? "bg-amber-500 text-dark" : "bg-accent text-white")}>{badge}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-page/10 p-4">
        <Link href="/" className="mb-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-page/60 hover:bg-page/5 hover:text-page"><LuExternalLink className="size-4" /> View store</Link>
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="grid size-9 place-items-center rounded-full bg-accent text-sm font-bold">{user.name[0]?.toUpperCase()}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{user.name}</p><p className="text-[11px] text-page/50 capitalize">{user.role}</p></div>
          <button
            aria-label="Sign out"
            onClick={async () => {
              await logout().unwrap().catch(() => undefined);
              dispatch(loggedOut());
              dispatch(api.util.resetApiState());
              router.replace("/login");
            }}
            className="grid size-9 place-items-center rounded-lg text-page/60 hover:bg-page/10 hover:text-page"
          >
            <LuLogOut className="size-4 flip-rtl" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-dvh bg-[#f6f3ee] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-dvh lg:block">{side}</aside>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-fg/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 start-0 w-72 animate-[slideInRtl_.35s] rtl:animate-[slideIn_.35s]">{side}</div>
        </div>
      )}
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-[#f6f3ee]/85 px-4 backdrop-blur md:px-8">
          <button aria-label="Open menu" onClick={() => setOpen(true)} className="grid size-10 place-items-center rounded-lg hover:bg-white lg:hidden"><LuMenu className="size-5" /></button>
          <div className="ms-auto"><LanguageSwitch /></div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
