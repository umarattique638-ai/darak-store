"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { apiError, useRegisterMutation } from "@/store/api";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { PasswordInput } from "./PasswordInput";
import { AuthHeading } from "./AuthHeading";
import { DEV_CODE_KEY } from "./keys";
import { toast } from "@/lib/toast";

export function RegisterForm() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const [register, { isLoading }] = useRegisterMutation();
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const on = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((s) => ({ ...s, [k]: e.target.value }));

  return (
    <>
      <AuthHeading title={t.auth.registerTitle} text={t.auth.registerText} />
      <form
        noValidate
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setErrors({});
          setFormError("");
          try {
            const r = await register({ name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() || undefined, password: f.password }).unwrap();
            try { if (r.devCode) sessionStorage.setItem(DEV_CODE_KEY, r.devCode); } catch {}
            toast.success(t.auth.codeSent);
            const next = sp.get("next");
            router.push(`/verify-email?email=${encodeURIComponent(r.email)}${next ? `&next=${encodeURIComponent(next)}` : ""}`);
          } catch (e2) {
            const a = apiError(e2);
            setErrors(a.fields);
            if (!Object.keys(a.fields).length) setFormError(a.message);
          }
        }}
      >
        {formError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</p>}
        <TextInput id="name" label={t.auth.name} value={f.name} onChange={on("name")} error={errors.name} autoComplete="name" autoFocus required />
        <TextInput id="email" type="email" label={t.auth.email} value={f.email} onChange={on("email")} error={errors.email} autoComplete="email" required />
        <TextInput id="phone" label={t.auth.phone} value={f.phone} onChange={on("phone")} error={errors.phone} autoComplete="tel" inputMode="tel" optional={t.common.optional} placeholder="+974 5555 1234" />
        <PasswordInput id="password" label={t.auth.password} value={f.password} onChange={on("password")} error={errors.password} hint={t.auth.passwordRules} autoComplete="new-password" meter required />
        <Button type="submit" size="lg" className="w-full" loading={isLoading}>{t.auth.register}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-mute">{t.auth.haveAccount} <Link href="/login" className="font-semibold text-accent hover:underline">{t.auth.signIn}</Link></p>
    </>
  );
}
