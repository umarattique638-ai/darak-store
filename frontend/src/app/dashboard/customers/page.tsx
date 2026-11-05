"use client";

import { useState } from "react";
import { LuSearch } from "react-icons/lu";
import { apiError, useCustomersQuery, useUpdateCustomerMutation } from "@/store/api";
import { useCurrentUser } from "@/store/hooks";
import { formatDate, formatMoney } from "@/i18n/format";
import { DashHeader, PagerMini, Table, Tabs } from "@/components/dashboard/ui";
import { Pill } from "@/components/order/StatusBadge";
import { inputCls } from "@/components/ui/Field";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

export default function CustomersAdmin() {
  const me = useCurrentUser();
  const [role, setRole] = useState("");
  const [q, setQ] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useCustomersQuery({ role, q: search, page });
  const [update] = useUpdateCustomerMutation();
  const isAdmin = me?.role === "admin";

  const act = async (id: string, body: { blocked?: boolean; role?: string }) => {
    try {
      await update({ id, ...body }).unwrap();
      toast.success("Updated");
    } catch (e) {
      toast.error(apiError(e).message);
    }
  };

  return (
    <>
      <DashHeader title="Customers" text={data ? `${data.total} accounts` : undefined} />
      <Tabs value={role} onChange={(v) => { setRole(v); setPage(1); }} options={[{ value: "", label: "All" }, { value: "customer", label: "Customers" }, { value: "staff", label: "Staff" }, { value: "admin", label: "Admins" }]} />
      <form className="relative mb-4 max-w-md" onSubmit={(e) => { e.preventDefault(); setSearch(q.trim()); setPage(1); }}>
        <LuSearch className="absolute start-4 top-1/2 size-4 -translate-y-1/2 text-mute" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or phone…" className={cn(inputCls, "h-11 ps-11")} />
      </form>
      {isLoading ? <Skeleton className="h-96" /> : (
        <>
          <Table head={["Name", "Contact", "Joined", "Orders", "Spent", "Role", "Status"]} empty={!data?.items.length}>
            {data?.items.map((u) => (
              <tr key={u.id} className="hover:bg-surface/40">
                <td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full bg-accent-soft font-bold text-accent">{u.name[0]?.toUpperCase()}</span><span className="font-medium">{u.name}</span></div></td>
                <td className="px-4 py-3"><p>{u.email} {u.emailVerified ? <span className="text-success" title="Verified">✓</span> : <span className="text-xs text-amber-600">unverified</span>}</p><p dir="ltr" className="text-xs text-mute rtl:text-end">{u.phone}</p></td>
                <td className="px-4 py-3 text-mute">{formatDate(u.createdAt, "en")}</td>
                <td className="px-4 py-3">{u.orders}</td>
                <td className="px-4 py-3 font-semibold">{formatMoney(u.spent, "en")}</td>
                <td className="px-4 py-3">
                  {isAdmin && u.id !== me?.id ? (
                    <select value={u.role} onChange={(e) => act(u.id, { role: e.target.value })} className="rounded-lg border border-line bg-white px-2 py-1 text-sm capitalize">
                      <option value="customer">customer</option><option value="staff">staff</option><option value="admin">admin</option>
                    </select>
                  ) : <span className="capitalize">{u.role}</span>}
                </td>
                <td className="px-4 py-3">
                  {u.id === me?.id ? <Pill tone="sky">You</Pill> : (
                    <button onClick={() => act(u.id, { blocked: !u.blocked })} disabled={!isAdmin} className="disabled:cursor-not-allowed" title={isAdmin ? (u.blocked ? "Unblock" : "Block — signs them out everywhere") : "Admins only"}>
                      {u.blocked ? <Pill tone="rose">Blocked</Pill> : <Pill tone="emerald">Active</Pill>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </Table>
          {data && <PagerMini page={data.page} pages={data.pages} onPage={setPage} />}
        </>
      )}
    </>
  );
}
