"use client";

import { useState } from "react";
import type { UserDTO } from "@/types/api";
import { useI18n } from "@/i18n/client";
import { useCurrentUser } from "@/store/hooks";
import { apiError, useUpdateProfileMutation } from "@/store/api";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/Field";
import { toast } from "@/lib/toast";

export default function ProfilePage() {
  const { t } = useI18n();
  const user = useCurrentUser();
  return (
    <>
      <h1 className="display mb-8 text-[clamp(2rem,4vw,3rem)]">{t.account.profile}</h1>
      {user && <ProfileForm key={user.id} user={user} />}
    </>
  );
}

function ProfileForm({ user }: { user: UserDTO }) {
  const { t, locale } = useI18n();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState(user.phone);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [save, { isLoading }] = useUpdateProfileMutation();
  return (
      <form
        noValidate
        className="grid max-w-xl gap-5 rounded-3xl border border-line bg-white p-6 md:p-8"
        onSubmit={async (e) => {
          e.preventDefault();
          setErrors({});
          try {
            await save({ name, phone, locale }).unwrap();
            toast.success(t.account.saved);
          } catch (e2) {
            const a = apiError(e2);
            setErrors(a.fields);
            toast.error(a.message);
          }
        }}
      >
        <TextInput id="name" label={t.auth.name} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
        <TextInput id="email" label={t.auth.email} value={user.email} disabled readOnly hint={user.emailVerified ? "✓ Verified" : undefined} />
        <TextInput id="phone" label={t.auth.phone} value={phone} onChange={(e) => setPhone(e.target.value)} error={errors.phone} inputMode="tel" />
        <Button type="submit" loading={isLoading} className="w-fit">{t.common.save}</Button>
      </form>
  );
}
