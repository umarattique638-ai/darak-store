import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { LoginForm } from "@/components/auth/LoginForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.auth.loginTitle, robots: { index: false } };
}

export default function Page() {
  return <Suspense><LoginForm /></Suspense>;
}
