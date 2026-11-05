import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.auth.verifyTitle, robots: { index: false } };
}

export default function Page() {
  return <Suspense><VerifyEmailForm /></Suspense>;
}
