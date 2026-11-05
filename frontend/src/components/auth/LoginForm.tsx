"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { apiError, useLoginMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { PasswordInput } from "./PasswordInput";
import { AuthHeading } from "./AuthHeading";
import { safeNext } from "@/lib/safe-next";
import { toast } from "@/lib/toast";
import { DEV_CODE_KEY } from "./keys";

export function LoginForm() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");

  return (
    <>
      <AuthHeading title={t.auth.loginTitle} text={t.auth.loginText} />
      <form
        noValidate
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setErrors({});
          setFormError("");
          try {
            const { user } = await login({ email: email.trim(), password }).unwrap();
            dispatch(setUser(user));
            toast.success(fill(t.auth.welcome, { name: user.name.split(" ")[0]! }));
            const fallback = user.role === "customer" ? "/account" : "/dashboard";
            router.replace(safeNext(sp.get("next"), fallback));
            router.refresh();
          } catch (e2) {
            const a = apiError(e2);
            if (a.code === "EMAIL_NOT_VERIFIED") {
              const dev = (a.details as { devCode?: string } | undefined)?.devCode;
              try { if (dev) sessionStorage.setItem(DEV_CODE_KEY, dev); } catch {}
              toast.info(a.message);
              router.push(`/verify-email?email=${encodeURIComponent(email.trim())}${sp.get("next") ? `&next=${encodeURIComponent(sp.get("next")!)}` : ""}`);
              return;
            }
            setErrors(a.fields);
            setFormError(a.message);
          }
        }}
      >
        {formError && <p role="alert" className="animate-[shake_.4s] rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</p>}
        <TextInput id="email" type="email" label={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" autoFocus required />
        <div>
          <PasswordInput id="password" label={t.auth.password} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="current-password" required />
          <Link href="/forgot-password" className="mt-2 inline-block text-sm font-semibold text-accent hover:underline">{t.auth.forgot}</Link>
        </div>
        <Button type="submit" size="lg" className="w-full" loading={isLoading}>{isLoading ? t.auth.signingIn : t.auth.signIn}</Button>
      </form>
      <p className="mt-8 text-center text-sm text-mute">
        {t.auth.noAccount} <Link href={`/register${sp.get("next") ? `?next=${encodeURIComponent(sp.get("next")!)}` : ""}`} className="font-semibold text-accent hover:underline">{t.auth.createAccount}</Link>
      </p>
    </>
  );
}
