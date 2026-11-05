"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/client";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function Newsletter() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  return (
    <section className="pb-24">
      <Reveal className="container-x">
        <div className="relative overflow-hidden rounded-[2rem] bg-accent px-6 py-14 text-center text-white md:px-16">
          <span aria-hidden className="absolute -top-24 -start-24 size-72 rounded-full border-[40px] border-white/5" />
          <span aria-hidden className="absolute -bottom-28 -end-20 size-80 rounded-full border-[50px] border-white/5" />
          <h2 className="display relative text-[clamp(2rem,4vw,3rem)]">{t.home.newsletterTitle}</h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/75">{t.home.newsletterText}</p>
          <form
            className="relative mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
            onSubmit={(e) => {
              e.preventDefault();
              if (!/^\S+@\S+\.\S+$/.test(email)) return;
              toast.success(t.home.newsletterOk);
              setEmail("");
            }}
          >
            <label htmlFor="nl" className="sr-only">Email</label>
            <input id="nl" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@example.com" className="h-12 flex-1 rounded-full bg-white px-5 text-fg outline-none placeholder:text-fg/40" />
            <Button type="submit" variant="dark" className="h-12">{t.home.newsletterCta}</Button>
          </form>
        </div>
      </Reveal>
    </section>
  );
}
