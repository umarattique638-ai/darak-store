"use client";

import { useState } from "react";
import Image from "next/image";
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { apiError, useCategoriesQuery, useCreateCategoryMutation, useDeleteCategoryMutation, useUpdateCategoryMutation } from "@/store/api";
import { useCurrentUser } from "@/store/hooks";
import { DashHeader, Modal } from "@/components/dashboard/ui";
import { Button } from "@/components/ui/Button";
import { Checkbox, TextArea, TextInput } from "@/components/ui/Field";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Pill } from "@/components/order/StatusBadge";
import { Skeleton } from "@/components/ui/Skeleton";
import { toast } from "@/lib/toast";
import { imageUrl } from "@/lib/utils";
import type { CategoryDTO } from "@/types/api";

type F = { id?: string; nameEn: string; nameAr: string; descEn: string; descAr: string; slug: string; image: string; order: string; active: boolean };
const blank: F = { nameEn: "", nameAr: "", descEn: "", descAr: "", slug: "", image: "", order: "0", active: true };
const toF = (c: CategoryDTO): F => ({ id: c.id, nameEn: c.name.en, nameAr: c.name.ar, descEn: c.description.en, descAr: c.description.ar, slug: c.slug, image: c.image, order: String(c.order), active: c.active });

export default function CategoriesAdmin() {
  const user = useCurrentUser();
  const { data, isLoading } = useCategoriesQuery({ all: true });
  const [form, setForm] = useState<F | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [create, { isLoading: c1 }] = useCreateCategoryMutation();
  const [update, { isLoading: c2 }] = useUpdateCategoryMutation();
  const [remove] = useDeleteCategoryMutation();

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setErrors({});
    const body = { name: { en: form.nameEn, ar: form.nameAr }, description: { en: form.descEn, ar: form.descAr }, slug: form.slug, image: form.image, order: Number(form.order || 0), active: form.active };
    try {
      if (form.id) await update({ id: form.id, body }).unwrap();
      else await create(body).unwrap();
      toast.success("Category saved");
      setForm(null);
    } catch (e2) {
      const a = apiError(e2);
      setErrors(a.fields);
      toast.error(a.message);
    }
  };
  const on = (k: keyof F) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setForm((s) => (s ? { ...s, [k]: e.target.value } : s));

  return (
    <>
      <DashHeader title="Categories" action={<Button onClick={() => { setErrors({}); setForm(blank); }}><LuPlus className="size-4" /> Add category</Button>} />
      {isLoading ? (
        <Skeleton className="h-64" />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.categories.map((c, i) => (
            <li key={c.id} style={{ animationDelay: `${i * 50}ms` }} className="group animate-[toastIn_.5s_both] overflow-hidden rounded-2xl border border-line bg-white">
              <div className="relative h-36 bg-surface">{c.image && <Image src={imageUrl(c.image, 600)} alt="" fill unoptimized sizes="33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />}</div>
              <div className="flex items-start justify-between gap-3 p-4">
                <div>
                  <p className="font-semibold">{c.name.en} <span dir="rtl" className="text-mute">· {c.name.ar}</span></p>
                  <p className="text-xs text-mute">/{c.slug} · {c.productCount ?? 0} products · order {c.order}</p>
                </div>
                {!c.active && <Pill>Hidden</Pill>}
              </div>
              <div className="flex gap-2 border-t border-line px-4 py-2.5 text-sm font-semibold">
                <button onClick={() => { setErrors({}); setForm(toF(c)); }} className="inline-flex items-center gap-1.5 text-fg/70 hover:text-fg"><LuPencil className="size-3.5" /> Edit</button>
                {user?.role === "admin" && (
                  <button onClick={async () => { try { await remove(c.id).unwrap(); toast.info("Category deleted"); } catch (e) { toast.error(apiError(e).message); } }} className="ms-auto inline-flex items-center gap-1.5 text-red-600"><LuTrash2 className="size-3.5" /> Delete</button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!form} onClose={() => setForm(null)} title={form?.id ? "Edit category" : "New category"} wide>
        {form && (
          <form onSubmit={save} noValidate className="grid gap-4 sm:grid-cols-2">
            <TextInput id="ne" label="Name (English)" value={form.nameEn} onChange={on("nameEn")} error={errors["name.en"]} />
            <TextInput id="na" dir="rtl" label="الاسم (عربي)" value={form.nameAr} onChange={on("nameAr")} />
            <TextArea id="de" label="Description (English)" rows={3} value={form.descEn} onChange={on("descEn")} />
            <TextArea id="da" dir="rtl" label="الوصف (عربي)" rows={3} value={form.descAr} onChange={on("descAr")} />
            <TextInput id="slug" label="Slug" value={form.slug} onChange={on("slug")} error={errors.slug} optional="auto" />
            <TextInput id="order" label="Sort order" inputMode="numeric" value={form.order} onChange={on("order")} />
            <div className="sm:col-span-2"><ImageUploader folder="categories" max={1} value={form.image ? [form.image] : []} onChange={(v) => setForm({ ...form, image: v[0] ?? "" })} label="Cover image" /></div>
            <Checkbox label="Visible in store" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <div className="flex justify-end gap-2 sm:col-span-2"><Button type="button" variant="ghost" onClick={() => setForm(null)}>Cancel</Button><Button type="submit" loading={c1 || c2}>Save</Button></div>
          </form>
        )}
      </Modal>
    </>
  );
}
