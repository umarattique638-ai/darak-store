"use client";

import { useState } from "react";
import { LuMapPin, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { useCurrentUser } from "@/store/hooks";
import { apiError, useAddAddressMutation, useDeleteAddressMutation, useUpdateAddressMutation } from "@/store/api";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextInput } from "@/components/ui/Field";
import { toast } from "@/lib/toast";
import type { Address } from "@/types/api";

const blank: Omit<Address, "id"> = { label: "Home", fullName: "", phone: "", city: "Doha", area: "", street: "", building: "", notes: "", isDefault: false };

export default function AddressesPage() {
  const { t } = useI18n();
  const user = useCurrentUser();
  const [editing, setEditing] = useState<(Omit<Address, "id"> & { id?: string }) | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [add, { isLoading: adding }] = useAddAddressMutation();
  const [update, { isLoading: updating }] = useUpdateAddressMutation();
  const [remove] = useDeleteAddressMutation();
  const list = user?.addresses ?? [];

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setErrors({});
    try {
      if (editing.id) await update(editing as Address).unwrap();
      else await add(editing).unwrap();
      toast.success(t.account.saved);
      setEditing(null);
    } catch (e2) {
      const a = apiError(e2);
      setErrors(a.fields);
      toast.error(a.message);
    }
  };
  const on = (k: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => setEditing((s) => (s ? { ...s, [k]: e.target.value } : s));

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="display text-[clamp(2rem,4vw,3rem)]">{t.account.addresses}</h1>
        {!editing && list.length < 10 && <Button size="sm" onClick={() => setEditing({ ...blank, fullName: user?.name ?? "", phone: user?.phone ?? "" })}><LuPlus className="size-4" />{t.account.addAddress}</Button>}
      </div>

      {editing && (
        <form onSubmit={save} noValidate className="mb-8 grid animate-[toastIn_.4s] gap-5 rounded-3xl border border-line bg-white p-6 sm:grid-cols-2">
          <TextInput id="label" label="Label" value={editing.label} onChange={on("label")} placeholder="Home / Office" />
          <TextInput id="fullName" label={t.checkout.fullName} value={editing.fullName} onChange={on("fullName")} error={errors.fullName} required />
          <TextInput id="phone" label={t.checkout.phone} value={editing.phone} onChange={on("phone")} error={errors.phone} inputMode="tel" required />
          <TextInput id="city" label={t.checkout.city} value={editing.city} onChange={on("city")} error={errors.city} required />
          <TextInput id="area" label={t.checkout.area} value={editing.area} onChange={on("area")} />
          <TextInput id="building" label={t.checkout.building} value={editing.building} onChange={on("building")} />
          <TextInput id="street" label={t.checkout.street} value={editing.street} onChange={on("street")} error={errors.street} className="sm:col-span-2" required />
          <Checkbox label={t.account.makeDefault} checked={editing.isDefault} onChange={(e) => setEditing({ ...editing, isDefault: e.target.checked })} />
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" loading={adding || updating}>{t.common.save}</Button>
            <Button type="button" variant="ghost" onClick={() => setEditing(null)}>{t.common.cancel}</Button>
          </div>
        </form>
      )}

      {list.length === 0 && !editing ? (
        <div className="flex flex-col items-center rounded-3xl border border-dashed border-line py-16 text-center"><LuMapPin className="size-10 text-mute" /><p className="mt-3 text-mute">{t.common.empty}</p></div>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {list.map((a) => (
            <li key={a.id} className="relative rounded-3xl border border-line bg-white p-6">
              <p className="font-semibold">{a.label} {a.isDefault && <span className="ms-2 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent">{t.account.default}</span>}</p>
              <p className="mt-2 text-sm">{a.fullName} · <span dir="ltr">{a.phone}</span></p>
              <p className="text-sm text-mute">{[a.building, a.street, a.area, a.city].filter(Boolean).join(", ")}</p>
              <div className="mt-4 flex gap-4 text-sm font-semibold">
                <button onClick={() => setEditing(a)} className="inline-flex items-center gap-1.5 text-fg/70 hover:text-fg"><LuPencil className="size-3.5" />{t.common.edit}</button>
                <button onClick={async () => { await remove(a.id).unwrap().catch(() => undefined); toast.info(t.common.delete); }} className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700"><LuTrash2 className="size-3.5" />{t.common.delete}</button>
                {!a.isDefault && <button onClick={() => update({ ...a, isDefault: true })} className="ms-auto text-accent hover:underline">{t.account.makeDefault}</button>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
