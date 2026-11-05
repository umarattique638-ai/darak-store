"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Thin top progress bar. Starts the instant an internal link is clicked (before the
 * next page's data arrives) and completes when the URL actually changes.
 */
export function RouteProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // finish whenever the route changes
  useEffect(() => {
    const id = setTimeout(() => {
      setState((s) => (s === "loading" ? "done" : s));
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setState("idle"), 400);
    });
    return () => clearTimeout(id);
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      const url = new URL(href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (timer.current) clearTimeout(timer.current);
      setState("loading");
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-[3px]">
      <div
        className="h-full origin-left bg-accent shadow-[0_0_10px_rgba(138,21,56,0.6)] rtl:origin-right"
        style={{
          transform: state === "idle" ? "scaleX(0)" : state === "loading" ? "scaleX(0.8)" : "scaleX(1)",
          opacity: state === "done" ? 0 : state === "idle" ? 0 : 1,
          transition:
            state === "loading" ? "transform 8s cubic-bezier(.08,.82,.17,1), opacity .1s" : state === "done" ? "transform .25s ease-out, opacity .35s .15s" : "none",
        }}
      />
    </div>
  );
}
