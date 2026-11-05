import { useEffect, useState } from "react";

/** Seconds-remaining countdown for "resend code" buttons. */
export function useCooldown(initial = 60) {
  const [left, setLeft] = useState(initial);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  return { left, restart: (s = 60) => setLeft(s) };
}
