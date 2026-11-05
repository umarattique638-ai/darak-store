import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.auth.resetTitle, robots: { index: false } };
}

export default function Page() {
  return <Suspense><ResetPasswordForm /></Suspense>;
}
