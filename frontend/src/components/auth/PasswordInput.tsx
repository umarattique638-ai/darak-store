"use client";

import { useState, type ComponentPropsWithoutRef } from "react";
import { LuEye, LuEyeOff } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { Field, inputCls } from "@/components/ui/Field";
import { cn } from "@/lib/utils";

/** Password field with show/hide and an optional strength meter. */
export function PasswordInput({ id, label, error, hint, meter, ...rest }: { id: string; label: string; error?: string; hint?: string; meter?: boolean } & ComponentPropsWithoutRef<"input">) {
  const { t } = useI18n();
  const [show, setShow] = useState(false);
  const v = String(rest.value ?? "");
  const score = [v.length >= 8, /[a-z]/.test(v) && /[A-Z]/.test(v), /\d/.test(v), v.length >= 12 || /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      <div className="relative">
        <input id={id} type={show ? "text" : "password"} aria-invalid={!!error} className={cn(inputCls, "h-12 pe-16")} {...rest} />
        <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? t.auth.hide : t.auth.show} className="absolute inset-y-0 end-0 grid w-12 place-items-center text-mute hover:text-fg">
          {show ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
        </button>
      </div>
      {meter && v && (
        <div className="mt-2 flex gap-1" aria-hidden>
          {[0, 1, 2, 3].map((i) => <span key={i} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", i < score ? (score < 3 ? "bg-amber-500" : "bg-success") : "bg-line")} />)}
        </div>
      )}
    </Field>
  );
}
