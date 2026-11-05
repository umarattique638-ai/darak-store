"use client";

import { useI18n } from "@/i18n/client";
import { Pill } from "@/components/order/StatusBadge";
import type { DesignStatus } from "@/types/api";

const TONES = { new: "amber", reviewing: "sky", quoted: "violet", in_production: "sky", completed: "emerald", declined: "stone" } as const;

export function DesignStatusPill({ status }: { status: DesignStatus }) {
  const { t } = useI18n();
  return <Pill tone={TONES[status]}>{t.custom.statuses[status]}</Pill>;
}
