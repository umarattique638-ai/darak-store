"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuLaptop, LuSmartphone } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { formatDate } from "@/i18n/format";
import { api, apiError, useChangePasswordMutation, useLogoutAllMutation, useRevokeSessionMutation, useSessionsQuery } from "@/store/api";
import { useAppDispatch } from "@/store/hooks";
import { loggedOut } from "@/store/authSlice";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { toast } from "@/lib/toast";

function device(ua: string) {
  const mobile = /mobile|android|iphone|ipad/i.test(ua);
  const browser = /edg\//i.test(ua) ? "Edge" : /chrome\//i.test(ua) ? "Chrome" : /firefox\//i.test(ua) ? "Firefox" : /safari\//i.test(ua) ? "Safari" : "Browser";
  const os = /windows/i.test(ua) ? "Windows" : /mac os/i.test(ua) ? "macOS" : /android/i.test(ua) ? "Android" : /iphone|ipad|ios/i.test(ua) ? "iOS" : /linux/i.test(ua) ? "Linux" : "";
  return { mobile, label: `${browser}${os ? ` · ${os}` : ""}` };
}

export default function SecurityPage() {
  const { t, locale } = useI18n();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [change, { isLoading }] = useChangePasswordMutation();
  const { data, isLoading: loadingSessions } = useSessionsQuery();
  const [revoke] = useRevokeSessionMutation();
  const [logoutAll, { isLoading: allLoading }] = useLogoutAllMutation();

  return (
    <>
      <h1 className="display mb-8 text-[clamp(2rem,4vw,3rem)]">{t.account.security}</h1>
      <div className="grid gap-8 xl:grid-cols-2">
        <form
          noValidate
          className="space-y-5 rounded-3xl border border-line bg-white p-6 md:p-8"
          onSubmit={async (e) => {
            e.preventDefault();
            setErrors({});
            try {
              await change({ currentPassword: cur, newPassword: next }).unwrap();
              toast.success(t.account.saved);
              setCur("");
              setNext("");
            } catch (e2) {
              const a = apiError(e2);
              setErrors(a.fields);
              if (!Object.keys(a.fields).length) toast.error(a.message);
            }
          }}
        >
          <h2 className="font-display text-xl">{t.account.changePassword}</h2>
          <PasswordInput id="cur" label={t.account.currentPassword} value={cur} onChange={(e) => setCur(e.target.value)} error={errors.currentPassword} autoComplete="current-password" />
          <PasswordInput id="new" label={t.auth.newPassword} value={next} onChange={(e) => setNext(e.target.value)} error={errors.newPassword} hint={t.auth.passwordRules} autoComplete="new-password" meter />
          <Button type="submit" loading={isLoading}>{t.account.changePassword}</Button>
        </form>

        <section className="rounded-3xl border border-line bg-white p-6 md:p-8">
          <h2 className="font-display text-xl">{t.account.sessions}</h2>
          {loadingSessions ? (
            <Skeleton className="mt-5 h-32" />
          ) : (
            <ul className="mt-5 divide-y divide-line">
              {data?.sessions.map((s) => {
                const d = device(s.userAgent);
                return (
                  <li key={s.id} className="flex items-center gap-4 py-4">
                    <span className="grid size-10 place-items-center rounded-xl bg-surface">{d.mobile ? <LuSmartphone className="size-5" /> : <LuLaptop className="size-5" />}</span>
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-semibold">{d.label} {s.current && <span className="ms-1 rounded-full bg-success/10 px-2 py-0.5 text-xs text-success">{t.account.thisDevice}</span>}</p>
                      <p className="text-xs text-mute"><span dir="ltr">{s.ip}</span> · {formatDate(s.lastUsedAt, locale, true)}</p>
                    </div>
                    {!s.current && <button onClick={() => revoke(s.id)} className="text-sm font-semibold text-red-600 hover:underline">{t.account.signOutDevice}</button>}
                  </li>
                );
              })}
            </ul>
          )}
          <Button
            variant="outline"
            className="mt-4 w-full"
            loading={allLoading}
            onClick={async () => {
              await logoutAll().unwrap().catch(() => undefined);
              dispatch(loggedOut());
              dispatch(api.util.resetApiState());
              toast.info(t.auth.signedOut);
              router.replace("/login");
            }}
          >
            {t.account.signOutAll}
          </Button>
        </section>
      </div>
    </>
  );
}
