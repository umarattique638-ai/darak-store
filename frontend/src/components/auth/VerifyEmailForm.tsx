"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LuMailCheck } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { fill } from "@/i18n/format";
import { apiError, useResendVerificationMutation, useVerifyEmailMutation } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { setUser } from "@/store/authSlice";
import { Button, ButtonLink } from "@/components/ui/Button";
import { OtpInput } from "./OtpInput";
import { AuthHeading } from "./AuthHeading";
import { DevCode } from "./DevCode";
import { DEV_CODE_KEY } from "./keys";
import { useCooldown } from "./useCooldown";
import { safeNext } from "@/lib/safe-next";
import { toast } from "@/lib/toast";

export function VerifyEmailForm() {
  const { t } = useI18n();
  const router = useRouter();
  const sp = useSearchParams();
  const dispatch = useAppDispatch();
  const email = (sp.get("email") ?? "").slice(0, 200);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [dev, setDev] = useState<string | null>(null);
  const [verify, { isLoading }] = useVerifyEmailMutation();
  const [resend, { isLoading: resending }] = useResendVerificationMutation();
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

  const submit = async (c = code) => {
    if (c.length !== 6) return;
    setErr("");
    try {
      const { user } = await verify({ email, code: c }).unwrap();
      dispatch(setUser(user));
      toast.success(fill(t.auth.welcome, { name: user.name.split(" ")[0]! }));
      router.replace(safeNext(sp.get("next"), "/account"));
      router.refresh();
    } catch (e) {
      setErr(apiError(e).message);
      setCode("");
    }
  };

  if (!email) return <ButtonLink href="/register">{t.auth.createAccount}</ButtonLink>;
  return (
    <>
      <span className="mb-6 grid size-16 animate-[pop_.6s] place-items-center rounded-2xl bg-accent-soft text-accent"><LuMailCheck className="size-8" /></span>
      <AuthHeading title={t.auth.verifyTitle} text={fill(t.auth.verifyText, { email })} />
      <DevCode code={dev} />
      <form noValidate onSubmit={(e) => { e.preventDefault(); submit(); }} className="space-y-6">
        <OtpInput value={code} autoFocus error={!!err} onChange={(v) => { setCode(v); if (v.length === 6) submit(v); }} />
        {err && <p role="alert" className="text-sm font-medium text-red-600">{err}</p>}
        <Button type="submit" size="lg" className="w-full" loading={isLoading} disabled={code.length !== 6}>{t.auth.verify}</Button>
      </form>
      <button
        disabled={left > 0 || resending}
        onClick={async () => {
          try {
            const r = await resend({ email }).unwrap();
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
