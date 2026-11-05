"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { apiError, useForgotPasswordMutation } from "@/store/api";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { AuthHeading } from "./AuthHeading";
import { DEV_CODE_KEY } from "./keys";
import { toast } from "@/lib/toast";

export function ForgotPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [send, { isLoading }] = useForgotPasswordMutation();
  return (
    <>
      <AuthHeading title={t.auth.forgotTitle} text={t.auth.forgotText} />
      <form
        noValidate
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          try {
            const r = await send({ email: email.trim() }).unwrap();
            try { if (r.devCode) sessionStorage.setItem(DEV_CODE_KEY, r.devCode); } catch {}
            toast.success(t.auth.codeSent);
            router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
          } catch (e2) {
            const a = apiError(e2);
            setError(a.fields.email ?? a.message);
          }
        }}
      >
        <TextInput id="email" type="email" label={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} error={error} autoComplete="email" autoFocus required />
        <Button type="submit" size="lg" className="w-full" loading={isLoading}>{t.auth.sendCode}</Button>
      </form>
      <p className="mt-8 text-center text-sm"><Link href="/login" className="font-semibold text-accent hover:underline">← {t.auth.signIn}</Link></p>
    </>
  );
}
