"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { toastStore, type ToastItem } from "@/lib/toast";
import { cn } from "@/lib/utils";

const tones = {
  success: { ring: "ring-emerald-200", icon: "bg-emerald-500", bar: "bg-emerald-500", path: "m5 12 5 5 9-10" },
  error: { ring: "ring-red-200", icon: "bg-red-500", bar: "bg-red-500", path: "M12 7v6m0 4h.01" },
  info: { ring: "ring-accent/30", icon: "bg-accent", bar: "bg-accent", path: "M12 11v6m0-10h.01" },
} as const;

/** Global toasts — top-center, stacked, auto-dismiss with a progress bar, pause on hover. */
export function Toaster() {
  const items = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot, toastStore.getServerSnapshot);
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 top-4 z-[1000] flex flex-col items-center gap-2.5 px-4 sm:top-6"
    >
      {items.map((t) => <ToastCard key={t.id} t={t} />)}
    </div>
  );
}

function ToastCard({ t }: { t: ToastItem }) {
  const [paused, setPaused] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const tone = tones[t.tone];

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(() => setLeaving(true), t.duration);
    return () => clearTimeout(timer);
  }, [paused, t.duration]);

  useEffect(() => {
    if (!leaving) return;
    const timer = setTimeout(() => toastStore.dismiss(t.id), 220);
    return () => clearTimeout(timer);
  }, [leaving, t.id]);

  return (
    <div
      role={t.tone === "error" ? "alert" : "status"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={cn(
        "pointer-events-auto relative w-full max-w-[420px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_50px_-18px_rgba(6,13,31,0.45)] ring-1",
        tone.ring,
        leaving ? "animate-[toastOut_.22s_ease-in_forwards]" : "animate-[toastIn_.35s_cubic-bezier(.16,1,.3,1)]",
      )}
    >
      <div className="flex items-start gap-3 px-4 py-3.5">
        <span className={cn("mt-0.5 grid size-6 shrink-0 place-items-center rounded-full text-white", tone.icon)}>
          <svg viewBox="0 0 24 24" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d={tone.path} />
          </svg>
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14.5px] font-bold text-fg">{t.title}</p>
          {t.description && <p className="mt-0.5 text-[13px] leading-snug text-mute">{t.description}</p>}
        </div>
        <button type="button" onClick={() => setLeaving(true)} aria-label="Dismiss notification" className="-mr-1 grid size-7 shrink-0 place-items-center rounded-lg text-mute hover:bg-surface hover:text-fg">
          <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
      </div>
      <span
        aria-hidden
        className={cn("absolute bottom-0 left-0 h-[3px] origin-left", tone.bar)}
        style={{ width: "100%", animation: `toastBar ${t.duration}ms linear forwards`, animationPlayState: paused ? "paused" : "running" }}
      />
    </div>
  );
}
