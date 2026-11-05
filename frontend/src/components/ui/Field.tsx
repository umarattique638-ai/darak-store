import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const inputCls =
  "w-full rounded-xl border border-line bg-white px-4 text-[15px] text-fg placeholder:text-fg/35 outline-none transition-[border-color,box-shadow] hover:border-fg/25 focus:border-accent focus:ring-4 focus:ring-accent/10 aria-[invalid=true]:border-red-400 aria-[invalid=true]:ring-red-100 disabled:bg-surface";

interface FieldProps { label: string; error?: string; hint?: ReactNode; className?: string; optional?: string }

export function Field({ label, error, hint, className, optional, id, children }: FieldProps & { id: string; children: ReactNode }) {
  return (
    <div className={cn("block", className)}>
      <label htmlFor={id} className="mb-1.5 flex items-baseline justify-between text-[13px] font-semibold text-fg/80">
        <span>{label}</span>
        {optional && <span className="text-[11px] font-normal text-mute">{optional}</span>}
      </label>
      {children}
      {error ? <p id={`${id}-err`} role="alert" className="mt-1.5 text-xs font-medium text-red-600">{error}</p> : hint ? <p className="mt-1.5 text-xs text-mute">{hint}</p> : null}
    </div>
  );
}

export function TextInput({ label, error, hint, className, optional, id, ...rest }: FieldProps & { id: string } & ComponentPropsWithoutRef<"input">) {
  return (
    <Field label={label} error={error} hint={hint} className={className} optional={optional} id={id}>
      <input id={id} aria-invalid={!!error} aria-describedby={error ? `${id}-err` : undefined} className={cn(inputCls, "h-12")} {...rest} />
    </Field>
  );
}

export function TextArea({ label, error, hint, className, optional, id, ...rest }: FieldProps & { id: string } & ComponentPropsWithoutRef<"textarea">) {
  return (
    <Field label={label} error={error} hint={hint} className={className} optional={optional} id={id}>
      <textarea id={id} rows={4} aria-invalid={!!error} className={cn(inputCls, "block resize-y py-3 leading-relaxed")} {...rest} />
    </Field>
  );
}

export function Select({ label, error, className, id, children, ...rest }: FieldProps & { id: string } & ComponentPropsWithoutRef<"select">) {
  return (
    <Field label={label} error={error} className={className} id={id}>
      <select id={id} aria-invalid={!!error} className={cn(inputCls, "h-12 appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236f665c%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:18px] bg-[position:right_14px_center] bg-no-repeat pe-10 rtl:bg-[position:left_14px_center]")} {...rest}>
        {children}
      </select>
    </Field>
  );
}

export function Checkbox({ label, className, ...rest }: { label: ReactNode; className?: string } & ComponentPropsWithoutRef<"input">) {
  return (
    <label className={cn("flex cursor-pointer items-center gap-2.5 text-sm text-fg/80", className)}>
      <input type="checkbox" className="size-4 rounded accent-[var(--color-accent)]" {...rest} />
      {label}
    </label>
  );
}
