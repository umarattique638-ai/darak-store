import type { Metadata } from "next";
import { getDictionary } from "@/i18n/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { CustomDesignForm } from "@/components/forms/CustomDesignForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.custom.title, description: t.custom.text };
}

export default async function CustomDesignPage() {
  const { t } = await getDictionary();
  return (
    <>
      <PageHeader eyebrow={t.custom.eyebrow} title={t.custom.title} text={t.custom.text} />
      <section className="container-x grid gap-12 pb-28 lg:grid-cols-[320px_1fr]">
        <Reveal as="ol" stagger className="space-y-4 lg:sticky lg:top-28 lg:h-fit">
          {t.custom.steps.map((s, i) => (
            <li key={s.t} className="flex gap-4 rounded-2xl bg-surface p-5">
              <span className="font-display text-3xl text-accent">0{i + 1}</span>
              <div><p className="font-semibold">{s.t}</p><p className="mt-1 text-sm text-mute">{s.d}</p></div>
            </li>
          ))}
        </Reveal>
        <CustomDesignForm />
      </section>
    </>
  );
}
