import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/server/api";
import { DashShell } from "@/components/dashboard/DashShell";
import { ServerDown } from "@/components/ui/ServerDown";

export const metadata: Metadata = { title: { default: "Dashboard", template: "%s — Al Sharq Dashboard" }, robots: { index: false, follow: false } };

/** Server-side gate: the API verifies the token (signature, blacklist, session) and role. */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (user === "unreachable") return <ServerDown />;
  if (!user) redirect("/login?next=/dashboard");
  if (user.role === "customer") redirect("/account");
  return <DashShell user={user}>{children}</DashShell>;
}
