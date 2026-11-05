"use client";

import Image from "next/image";
import { LuPencilRuler } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { formatDate, formatMoney } from "@/i18n/format";
import { useMyDesignsQuery } from "@/store/api";
import { ButtonLink } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { DesignStatusPill } from "@/components/account/DesignStatusPill";
import { imageUrl } from "@/lib/utils";

export default function MyDesignsPage() {
  const { t, locale } = useI18n();
  const { data, isLoading } = useMyDesignsQuery();
  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="display text-[clamp(2rem,4vw,3rem)]">{t.account.designs}</h1>
        <ButtonLink href="/custom-design" size="sm">+ {t.custom.title}</ButtonLink>
      </div>
      {isLoading ? (
        <Skeleton className="h-40" />
      ) : !data?.designs.length ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line py-16 text-center"><LuPencilRuler className="size-10 text-mute" /><p className="mt-3 text-mute">{t.common.empty}</p></div>
      ) : (
        <ul className="space-y-4">
          {data.designs.map((d) => (
            <li key={d.id} className="rounded-3xl border border-line bg-white p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p dir="ltr" className="font-mono text-sm font-bold rtl:text-end">{d.requestNumber}</p>
                  <p className="font-display text-xl">{t.custom.types[d.furnitureType as keyof typeof t.custom.types] ?? d.furnitureType}</p>
                  <p className="text-xs text-mute">{formatDate(d.createdAt, locale)}</p>
                </div>
                <DesignStatusPill status={d.status} />
              </div>
              <p className="mt-4 line-clamp-3 text-sm text-fg/80">{d.description}</p>
              {d.referenceImages.length > 0 && (
                <div className="mt-4 flex gap-2">{d.referenceImages.map((u) => <span key={u} className="relative size-16 overflow-hidden rounded-xl bg-surface"><Image src={imageUrl(u, 160)} alt="" fill unoptimized sizes="64px" className="object-cover" /></span>)}</div>
              )}
              {d.quotedPrice != null && <p className="mt-4 rounded-xl bg-accent-soft p-3 text-sm font-semibold text-accent">{t.custom.quoted}: {formatMoney(d.quotedPrice, locale)}</p>}
              {d.adminNote && <p className="mt-3 rounded-xl bg-surface p-3 text-sm">{d.adminNote}</p>}
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
