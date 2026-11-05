"use client";

import { useState } from "react";
import { LuSend } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { useCurrentUser } from "@/store/hooks";
import { apiError, useContactMutation } from "@/store/api";
import { Button } from "@/components/ui/Button";
import { TextArea, TextInput } from "@/components/ui/Field";
import { toast } from "@/lib/toast";

export function ContactForm() {
  const { t } = useI18n();
  const user = useCurrentUser();
  // signed-in users get name/email prefilled (they may still edit them)
  const [edits, setF] = useState<Partial<Record<"name" | "email" | "phone" | "subject" | "message" | "website", string>>>({});
  const f = { name: user?.name ?? "", email: user?.email ?? "", phone: user?.phone ?? "", subject: "", message: "", website: "", ...edits };
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [send, { isLoading }] = useContactMutation();
  const on = (k: keyof typeof edits) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  return (
    <form
      noValidate
      className="grid gap-5 rounded-3xl border border-line bg-white p-6 sm:grid-cols-2 md:p-10"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrors({});
        try {
          await send(f).unwrap();
          toast.success(t.contact.sent);
          setF((s) => ({ ...s, subject: "", message: "" }));
        } catch (e2) {
          const a = apiError(e2);
          setErrors(a.fields);
          toast.error(a.message);
        }
      }}
    >
      <TextInput id="c-name" label={t.contact.name} value={f.name} onChange={on("name")} error={errors.name} autoComplete="name" required />
      <TextInput id="c-email" type="email" label={t.contact.email} value={f.email} onChange={on("email")} error={errors.email} autoComplete="email" required />
      <TextInput id="c-phone" label={t.contact.phone} value={f.phone} onChange={on("phone")} error={errors.phone} inputMode="tel" optional={t.common.optional} />
      <TextInput id="c-subject" label={t.contact.subject} value={f.subject} onChange={on("subject")} optional={t.common.optional} />
      <TextArea id="c-msg" label={t.contact.message} value={f.message} onChange={on("message")} error={errors.message} rows={6} maxLength={3000} className="sm:col-span-2" required />
      {/* honeypot — hidden from people, bots fill it */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={f.website} onChange={on("website")} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />
      <Button type="submit" size="lg" loading={isLoading} className="sm:col-span-2 sm:w-fit">{t.contact.send} <LuSend className="size-4 flip-rtl" /></Button>
    </form>
  );
}
