import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "dark" | "outline" | "ghost" | "light" | "danger";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-white hover:bg-accent-deep shadow-[0_12px_30px_-14px_rgba(138,21,56,0.8)]",
  dark: "bg-fg text-page hover:bg-black",
  outline: "border border-fg/20 text-fg hover:border-fg hover:bg-fg hover:text-page",
  ghost: "text-fg hover:bg-surface",
  light: "bg-page text-fg hover:bg-white",
  danger: "bg-red-600 text-white hover:bg-red-700",
};
const sizes: Record<Size, string> = { sm: "h-9 px-4 text-[13px]", md: "h-11 px-6 text-sm", lg: "h-13 px-8 text-[15px]" };
const base =
  "group relative inline-flex items-center justify-center gap-2 rounded-full font-semibold tracking-wide whitespace-nowrap transition-all duration-300 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

interface Common { variant?: Variant; size?: Size; children: ReactNode; className?: string; loading?: boolean }

function Spinner() {
  return <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />;
}

export function Button({ variant = "primary", size = "md", loading, children, className, disabled, ...rest }: Common & ComponentPropsWithoutRef<"button">) {
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {loading && <Spinner />}
      {children}
    </button>
  );
}

export function ButtonLink({ variant = "primary", size = "md", children, className, ...rest }: Common & ComponentPropsWithoutRef<typeof Link>) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], className)} {...rest}>
      {children}
    </Link>
  );
}
