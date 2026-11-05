/**
 * Tiny global toast store (no provider needed) — call from anywhere on the client:
 *   toast.success("Saved")   toast.error("Something went wrong", "Try again")   toast.info("…")
 * Rendered by <Toaster /> in the root layout, top-center, so it survives client-side navigations.
 */
export type ToastTone = "success" | "error" | "info";
export interface ToastItem {
  id: number;
  tone: ToastTone;
  title: string;
  description?: string;
  duration: number;
}

type Listener = () => void;
let items: ToastItem[] = [];
const listeners = new Set<Listener>();
const emit = () => listeners.forEach((l) => l());
let seq = 0;

export const toastStore = {
  subscribe(l: Listener) {
    listeners.add(l);
    return () => void listeners.delete(l);
  },
  getSnapshot: () => items,
  getServerSnapshot: () => EMPTY,
  dismiss(id: number) {
    items = items.filter((t) => t.id !== id);
    emit();
  },
};
const EMPTY: ToastItem[] = [];

function push(tone: ToastTone, title: string, description?: string, duration = tone === "error" ? 6000 : 4000) {
  const id = ++seq;
  // identical toast already visible? don't stack duplicates
  if (items.some((t) => t.title === title && t.tone === tone)) return id;
  items = [...items.slice(-3), { id, tone, title, description, duration }];
  emit();
  return id;
}

export const toast = {
  success: (title: string, description?: string) => push("success", title, description),
  error: (title: string, description?: string) => push("error", title, description),
  info: (title: string, description?: string) => push("info", title, description),
  dismiss: (id: number) => toastStore.dismiss(id),
};
