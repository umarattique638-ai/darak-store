import type { Metadata } from "next";
import { LuClock, LuMail, LuMapPin, LuPhone } from "react-icons/lu";
import { getDictionary, getLocale } from "@/i18n/server";
import { siteConfig } from "@/config/site";
import { PageHeader } from "@/components/ui/PageHeader";
import { Reveal } from "@/components/ui/Reveal";
import { ContactForm } from "@/components/forms/ContactForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.nav.contact, description: t.contact.text };
}

export default async function ContactPage() {
  const [{ t }, locale] = await Promise.all([getDictionary(), getLocale()]);
  const cards = [
    { Icon: LuMapPin, title: t.contact.visit, body: siteConfig.address[locale], href: `https://maps.google.com/?q=${encodeURIComponent(siteConfig.address.en)}` },
    { Icon: LuPhone, title: t.contact.call, body: siteConfig.phone, href: siteConfig.whatsapp, ltr: true },
    { Icon: LuMail, title: t.contact.write, body: siteConfig.email, href: `mailto:${siteConfig.email}`, ltr: true },
    { Icon: LuClock, title: t.contact.hours, body: siteConfig.hours[locale] },
  ];
  return (
    <>
      <PageHeader eyebrow={t.contact.eyebrow} title={t.contact.title} text={t.contact.text} />
      <section className="container-x grid gap-10 pb-28 lg:grid-cols-[360px_1fr]">
        <Reveal as="ul" stagger className="space-y-4">
          {cards.map(({ Icon, title, body, href, ltr }) => {
            const inner = (
              <>
                <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent transition-colors duration-300 group-hover:bg-accent group-hover:text-white"><Icon className="size-5" /></span>
                <span><span className="block text-sm text-mute">{title}</span><span dir={ltr ? "ltr" : undefined} className="block font-semibold">{body}</span></span>
              </>
            );
            return (
              <li key={title}>
                {href ? <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5 transition-all hover:border-accent/40 hover:shadow-lg">{inner}</a> : <div className="group flex items-center gap-4 rounded-2xl border border-line bg-white p-5">{inner}</div>}
              </li>
            );
          })}
        </Reveal>
        <ContactForm />
      </section>
    </>
  );
}
