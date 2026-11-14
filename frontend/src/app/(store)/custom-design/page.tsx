import type { Metadata } from "next";
import { getDictionary } from "@/i18n/server";
import { Reveal } from "@/components/ui/Reveal";
import { CustomDesignForm } from "@/components/forms/CustomDesignForm";
import { CustomDesignWalkthrough } from "@/components/forms/CustomDesignWalkthrough";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.custom.title, description: t.custom.text };
}

export default async function CustomDesignPage() {
  const { t } = await getDictionary();
  return (
    <>
      {/* Intro with the autoplay walkthrough on the right */}
      <section className="container-x grid items-center gap-12 pb-16 pt-36 lg:grid-cols-[1fr_1.1fr] lg:gap-16 lg:pt-40">
        <Reveal stagger>
          <p className="eyebrow">{t.custom.eyebrow}</p>
          <h1 className="display mt-4 text-[clamp(2.4rem,5vw,4.2rem)]">{t.custom.title}</h1>
          <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-mute">{t.custom.text}</p>
        </Reveal>
        <CustomDesignWalkthrough />
      </section>

      <section className="container-x pb-28">
        <CustomDesignForm />
      </section>
    </>
  );
}
