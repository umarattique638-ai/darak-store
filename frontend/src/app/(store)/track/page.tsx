import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { PageHeader } from "@/components/ui/PageHeader";
import { TrackForm } from "@/components/order/TrackForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.track.title };
}

export default async function TrackPage() {
  const { t } = await getDictionary();
  return (
    <>
      <PageHeader eyebrow={t.nav.track} title={t.track.title} text={t.track.text} />
      <section className="container-x pb-28"><Suspense><TrackForm /></Suspense></section>
    </>
  );
}
