import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/api";
import { AccountNav } from "@/components/account/AccountNav";
import { ServerDown } from "@/components/ui/ServerDown";

export const metadata: Metadata = { title: "Account", robots: { index: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user === "unreachable") return <ServerDown />;
  if (!user) redirect("/login?next=/account");
  return (
    <div className="container-x grid gap-10 pt-32 pb-28 lg:grid-cols-[240px_1fr] lg:pt-40">
      <AccountNav />
      <div className="min-w-0 animate-[fadeIn_.5s]">{children}</div>
    </div>
  );
}
