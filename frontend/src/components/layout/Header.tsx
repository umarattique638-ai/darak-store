"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuHeart, LuMenu, LuSearch, LuShoppingBag, LuUser, LuX } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { Logo } from "@/components/ui/Logo";
import { LanguageSwitch } from "./LanguageSwitch";
import { useAppDispatch, useCartCount, useCurrentUser, useIsStaff } from "@/store/hooks";
import { setCartOpen } from "@/store/cartSlice";
import { cn } from "@/lib/utils";

export function Header() {
  const { t, locale } = useI18n();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const count = useCartCount();
  const user = useCurrentUser();
  const isStaff = useIsStaff();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 12);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menu ? "hidden" : "";
  }, [menu]);

  const nav = [
    { href: "/", label: t.nav.home },
    { href: "/shop", label: t.nav.shop },
    { href: "/custom-design", label: t.nav.custom },
    { href: "/about", label: t.nav.about },
    { href: "/contact", label: t.nav.contact },
  ];
  const active = (h: string) => (h === "/" ? pathname === "/" : pathname.startsWith(h));
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(false);
    router.push(`/shop${q.trim() ? `?q=${encodeURIComponent(q.trim())}` : ""}`);
  };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", scrolled || menu ? "bg-page/90 shadow-[0_10px_30px_-24px_rgba(29,27,25,0.6)] backdrop-blur-xl" : "bg-transparent")}>
      <div className="hidden bg-fg py-2 text-center text-[12px] font-medium tracking-wide text-page/85 sm:block">{t.home.perks[0]!.t} · {t.footer.payments}</div>
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Link href="/" aria-label={t.nav.home} onClick={() => setMenu(false)}><Logo locale={locale} /></Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={active(n.href) ? "page" : undefined} className={cn("relative px-3.5 py-2 text-[14.5px] font-semibold transition-colors hover:text-accent", active(n.href) ? "text-accent" : "text-fg/80")}>
                  {n.label}
                  <span className={cn("absolute inset-x-3.5 -bottom-0.5 h-0.5 origin-center rounded bg-accent transition-transform duration-300", active(n.href) ? "scale-x-100" : "scale-x-0")} />
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1 sm:gap-1.5">
          <LanguageSwitch className="hidden sm:flex" />
          <button type="button" onClick={() => setSearch((s) => !s)} aria-label={t.common.search} className="grid size-10 place-items-center rounded-full hover:bg-surface"><LuSearch className="size-[19px]" /></button>
          <Link href="/wishlist" aria-label={t.nav.wishlist} className="hidden size-10 place-items-center rounded-full hover:bg-surface sm:grid"><LuHeart className="size-[19px]" /></Link>
          <Link href={user ? (isStaff ? "/dashboard" : "/account") : "/login"} aria-label={user ? t.nav.account : t.nav.login} className="grid size-10 place-items-center rounded-full hover:bg-surface">
            {user ? <span className="grid size-8 place-items-center rounded-full bg-accent text-[13px] font-bold text-white">{user.name.charAt(0).toUpperCase()}</span> : <LuUser className="size-[19px]" />}
          </Link>
          <button type="button" onClick={() => dispatch(setCartOpen(true))} aria-label={`${t.nav.cart} (${count})`} className="relative grid size-10 place-items-center rounded-full hover:bg-surface">
            <LuShoppingBag key={count} className={cn("size-[19px]", count > 0 && "animate-[pop_.45s_ease-out]")} />
            {count > 0 && <span className="absolute -top-0.5 -end-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 text-[11px] font-bold text-white">{count}</span>}
          </button>
          <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={menu ? t.nav.close : t.nav.menu} className="grid size-10 place-items-center rounded-full hover:bg-surface lg:hidden">
            {menu ? <LuX className="size-5" /> : <LuMenu className="size-5" />}
          </button>
        </div>
      </div>

      {/* search bar */}
      <div className={cn("grid transition-[grid-template-rows] duration-400 ease-[var(--ease-out-expo)]", search ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <form onSubmit={submit} className="container-x pb-4" role="search">
            <div className="flex items-center gap-3 rounded-full border border-line bg-white px-5">
              <LuSearch className="size-5 text-mute" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.nav.search} aria-label={t.nav.search} className="h-12 flex-1 bg-transparent outline-none" maxLength={60} tabIndex={search ? 0 : -1} />
            </div>
          </form>
        </div>
      </div>

      {/* mobile menu */}
      {menu && (
        <div className="h-[calc(100svh-72px)] overflow-y-auto border-t border-line bg-page lg:hidden">
          <nav aria-label="Mobile" className="container-x flex flex-col py-6">
            {nav.map((n, i) => (
              <Link key={n.href} href={n.href} onClick={() => setMenu(false)} style={{ animationDelay: `${i * 50}ms` }} className={cn("animate-[fadeIn_.4s_both] border-b border-line py-4 font-display text-2xl", active(n.href) ? "text-accent" : "text-fg")}>
                {n.label}
              </Link>
            ))}
            <Link href="/track" onClick={() => setMenu(false)} className="border-b border-line py-4 text-lg font-semibold text-fg/80">{t.nav.track}</Link>
            <Link href="/wishlist" onClick={() => setMenu(false)} className="border-b border-line py-4 text-lg font-semibold text-fg/80">{t.nav.wishlist}</Link>
            <LanguageSwitch className="mt-6 w-fit" />
          </nav>
        </div>
      )}
    </header>
  );
}
