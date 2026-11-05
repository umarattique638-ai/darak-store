"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

/** 6 boxes; supports paste, backspace navigation and SMS one-time-code autofill. */
export function OtpInput({ value, onChange, error, autoFocus }: { value: string; onChange: (v: string) => void; error?: boolean; autoFocus?: boolean }) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");
  const setAt = (i: number, d: string) => {
    const arr = digits.slice();
    arr[i] = d;
    onChange(arr.join("").slice(0, 6));
  };
  return (
    <div dir="ltr" className="flex justify-between gap-2" role="group" aria-label="Verification code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el; }}
          value={d}
          autoFocus={autoFocus && i === 0}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={6}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) {
              onChange(v.slice(0, 6));
              refs.current[Math.min(5, v.length - 1)]?.focus();
              return;
            }
            setAt(i, v);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
            if (e.key === "ArrowRight" && i < 5) refs.current[i + 1]?.focus();
          }}
          onFocus={(e) => e.target.select()}
          className={cn("h-14 w-full min-w-0 rounded-xl border-2 bg-white text-center font-display text-2xl outline-none transition-all focus:border-accent focus:ring-4 focus:ring-accent/10", d ? "border-fg/30" : "border-line", error && "border-red-400 animate-[shake_.4s]")}
        />
      ))}
    </div>
  );
}
