import { cn } from "@/lib/utils";

/** Small label that appears below an icon on hover or keyboard focus. */
export function Tip({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("group relative inline-flex", className)}>
      {children}
      <span
        role="tooltip"
        className="pointer-events-none absolute start-1/2 top-full z-50 mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-fg px-2.5 py-1 text-[12px] font-medium text-page opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 rtl:translate-x-1/2"
      >
        {label}
      </span>
    </span>
  );
}
