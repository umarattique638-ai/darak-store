import type { Metadata } from "next";
import { Suspense } from "react";
import { getDictionary } from "@/i18n/server";
import { RegisterForm } from "@/components/auth/RegisterForm";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getDictionary();
  return { title: t.auth.registerTitle, robots: { index: false } };
}

export default function Page() {
  return <Suspense><RegisterForm /></Suspense>;
}
