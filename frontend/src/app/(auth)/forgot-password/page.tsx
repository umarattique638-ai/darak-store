import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.auth.forgotTitle, robots: { index: false } };
}

export default function Page() {
  return <Suspense><ForgotPasswordForm /></Suspense>;
}
