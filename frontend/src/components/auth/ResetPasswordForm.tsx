"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { apiError, useForgotPasswordMutation, useResetPasswordMutation } from "@/store/api";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { OtpInput } from "./OtpInput";
import { PasswordInput } from "./PasswordInput";
import { AuthHeading } from "./AuthHeading";
import { DevCode } from "./DevCode";
import { DEV_CODE_KEY } from "./keys";
import { useCooldown } from "./useCooldown";
import { toast } from "@/lib/toast";

export function ResetPasswordForm() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const [email, setEmail] = useState((sp.get("email") ?? "").slice(0, 200));
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [dev, setDev] = useState<string | null>(null);
  const [reset, { isLoading }] = useResetPasswordMutation();
  const [resend] = useForgotPasswordMutation();
  const { left, restart } = useCooldown(60);

  useEffect(() => {
    // read the one-time dev code from sessionStorage after hydration
    const id = setTimeout(() => {
      try {
        setDev(sessionStorage.getItem(DEV_CODE_KEY));
        sessionStorage.removeItem(DEV_CODE_KEY);
      } catch {}
    });
    return () => clearTimeout(id);
  }, []);

  return (
    <>
      <AuthHeading title={t.auth.resetTitle} text={t.auth.resetText} />
      <DevCode code={dev} />
      <form
        noValidate
        className="space-y-5"
        onSubmit={async (e) => {
          e.preventDefault();
          setErrors({});
          setFormError("");
          try {
            await reset({ email: email.trim(), code, password }).unwrap();
            toast.success(t.auth.resetDone);
            router.replace("/login");
          } catch (e2) {
            const a = apiError(e2);
            setErrors(a.fields);
            if (!Object.keys(a.fields).length) setFormError(a.message);
          }
        }}
      >
        {formError && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{formError}</p>}
        <TextInput id="email" type="email" label={t.auth.email} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" required />
        <div>
          <p className="mb-1.5 text-[13px] font-semibold text-fg/80">{t.auth.code}</p>
          <OtpInput value={code} onChange={setCode} error={!!errors.code} autoFocus />
          {errors.code && <p className="mt-1.5 text-xs font-medium text-red-600">{errors.code}</p>}
        </div>
        <PasswordInput id="password" label={t.auth.newPassword} value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} hint={t.auth.passwordRules} autoComplete="new-password" meter required />
        <Button type="submit" size="lg" className="w-full" loading={isLoading} disabled={code.length !== 6}>{t.auth.reset}</Button>
      </form>
      <button
        disabled={left > 0 || !email}
        onClick={async () => {
          try {
            const r = await resend({ email: email.trim() }).unwrap();
            if (r.devCode) setDev(r.devCode);
            toast.success(t.auth.codeSent);
            restart();
          } catch (e) {
            toast.error(apiError(e).message);
          }
        }}
        className="mt-6 w-full text-center text-sm font-semibold text-accent disabled:text-mute"
      >
        {left > 0 ? fill(t.auth.resendIn, { s: left }) : t.auth.resend}
      </button>
    </>
  );
}
