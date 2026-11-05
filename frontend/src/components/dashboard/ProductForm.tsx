"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuPlus, LuTrash2 } from "react-icons/lu";
import { apiError, useCategoriesQuery, useCreateProductMutation, useDeleteProductMutation, useUpdateProductMutation } from "@/store/api";
import { useCurrentUser } from "@/store/hooks";
import { pick } from "@/i18n/format";
import { Button } from "@/components/ui/Button";
import { Checkbox, Select, TextArea, TextInput, inputCls } from "@/components/ui/Field";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { Card } from "./ui";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { ProductDTO } from "@/types/api";

const MATERIALS = ["wood", "fabric", "leather", "metal", "rattan", "marble", "glass", "velvet"] as const;

type Form = {
  nameEn: string; nameAr: string; descEn: string; descAr: string; sku: string; slug: string; category: string;
  price: string; compareAtPrice: string; stock: string; lowStockThreshold: string; images: string[]; materials: string[];
  colors: { name: string; hex: string }[]; width: string; depth: string; height: string; featured: boolean; active: boolean;
};

const fromProduct = (p?: ProductDTO): Form => ({
  nameEn: p?.name.en ?? "", nameAr: p?.name.ar ?? "", descEn: p?.description.en ?? "", descAr: p?.description.ar ?? "", sku: p?.sku ?? "", slug: p?.slug ?? "",
  category: p?.category.id ?? "", price: p ? String(p.price) : "", compareAtPrice: p?.compareAtPrice ? String(p.compareAtPrice) : "", stock: p ? String(p.stock) : "0",
  lowStockThreshold: String(p?.lowStockThreshold ?? 3), images: p?.images.map((i) => i.url) ?? [], materials: p?.materials ?? [], colors: p?.colors ?? [],
  width: String(p?.dimensions.width ?? ""), depth: String(p?.dimensions.depth ?? ""), height: String(p?.dimensions.height ?? ""), featured: p?.featured ?? false, active: p?.active ?? true,
});

/** Bilingual create/edit form. Stock edits here are logged as "adjustment" movements by the API. */
export function ProductForm({ product }: { product?: ProductDTO }) {
  const router = useRouter();
  const user = useCurrentUser();
  const [f, setF] = useState<Form>(() => fromProduct(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { data: cats } = useCategoriesQuery({ all: true });
  const [create, { isLoading: creating }] = useCreateProductMutation();
  const [update, { isLoading: updating }] = useUpdateProductMutation();
  const [archive, { isLoading: archiving }] = useDeleteProductMutation();
  const on = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const err = (k: string) => errors[k];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const body = {
      name: { en: f.nameEn, ar: f.nameAr }, description: { en: f.descEn, ar: f.descAr }, sku: f.sku, slug: f.slug, category: f.category,
      price: Number(f.price), compareAtPrice: f.compareAtPrice ? Number(f.compareAtPrice) : null, stock: Number(f.stock || 0), lowStockThreshold: Number(f.lowStockThreshold || 0),
      images: f.images.map((url) => ({ url, alt: f.nameEn })), materials: f.materials, colors: f.colors.filter((c) => c.name.trim()),
      dimensions: { width: Number(f.width || 0), depth: Number(f.depth || 0), height: Number(f.height || 0) }, featured: f.featured, active: f.active,
    };
    try {
      if (product) {
        await update({ id: product.id, body }).unwrap();
        toast.success("Product saved");
      } else {
        const r = await create(body).unwrap();
        toast.success("Product created");
        router.replace(`/dashboard/products/${r.product.id}`);
      }
    } catch (e2) {
      const a = apiError(e2);
      const flat: Record<string, string> = {};
      for (const [k, v] of Object.entries(a.fields)) flat[k] = v;
      const d = a.details as Record<string, unknown> | undefined;
      if (d && typeof d === "object") for (const [k, v] of Object.entries(d)) if (Array.isArray(v) && typeof v[0] === "string") flat[k] = v[0];
      setErrors(flat);
      toast.error(a.message);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <Card title="Details">
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput id="nameEn" label="Name (English)" value={f.nameEn} onChange={on("nameEn")} error={err("name.en") ?? err("name")} required />
            <TextInput id="nameAr" dir="rtl" label="الاسم (عربي)" value={f.nameAr} onChange={on("nameAr")} error={err("name.ar")} />
            <TextArea id="descEn" label="Description (English)" rows={6} value={f.descEn} onChange={on("descEn")} error={err("description.en") ?? err("description")} />
            <TextArea id="descAr" dir="rtl" label="الوصف (عربي)" rows={6} value={f.descAr} onChange={on("descAr")} error={err("description.ar")} />
          </div>
        </Card>
        <Card title="Images">
          <ImageUploader folder="products" max={10} value={f.images} onChange={(images) => setF((s) => ({ ...s, images }))} hint="First image is the cover. Drag & drop or click · max 5 MB each" />
        </Card>
        <Card title="Options">
          <p className="mb-2 text-[13px] font-semibold text-fg/80">Materials</p>
          <div className="mb-6 flex flex-wrap gap-2">
            {MATERIALS.map((m) => {
              const on2 = f.materials.includes(m);
              return <button type="button" key={m} onClick={() => setF((s) => ({ ...s, materials: on2 ? s.materials.filter((x) => x !== m) : [...s.materials, m] }))} className={cn("rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors", on2 ? "border-fg bg-fg text-page" : "border-line hover:border-fg/40")}>{m}</button>;
            })}
          </div>
          <p className="mb-2 text-[13px] font-semibold text-fg/80">Colours</p>
          <div className="space-y-2">
            {f.colors.map((c, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="color" aria-label="Colour" value={c.hex} onChange={(e) => setF((s) => ({ ...s, colors: s.colors.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)) }))} className="h-11 w-14 cursor-pointer rounded-lg border border-line bg-white p-1" />
                <input aria-label="Colour name" value={c.name} placeholder="e.g. Sand" onChange={(e) => setF((s) => ({ ...s, colors: s.colors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)) }))} className={cn(inputCls, "h-11")} />
                <button type="button" aria-label="Remove colour" onClick={() => setF((s) => ({ ...s, colors: s.colors.filter((_, j) => j !== i) }))} className="grid size-11 shrink-0 place-items-center rounded-lg text-mute hover:bg-red-50 hover:text-red-600"><LuTrash2 className="size-4" /></button>
              </div>
            ))}
            {f.colors.length < 12 && <button type="button" onClick={() => setF((s) => ({ ...s, colors: [...s.colors, { name: "", hex: "#c8b8a2" }] }))} className="inline-flex items-center gap-1.5 text-sm font-semibold text-accent"><LuPlus className="size-4" /> Add colour</button>}
          </div>
          <p className="mt-6 mb-2 text-[13px] font-semibold text-fg/80">Dimensions (cm)</p>
          <div className="grid grid-cols-3 gap-3">
            <TextInput id="w" label="Width" inputMode="numeric" value={f.width} onChange={on("width")} />
            <TextInput id="d" label="Depth" inputMode="numeric" value={f.depth} onChange={on("depth")} />
            <TextInput id="h" label="Height" inputMode="numeric" value={f.height} onChange={on("height")} />
          </div>
        </Card>
      </div>

      <div className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
        <Card title="Organisation">
          <div className="space-y-4">
            <Select id="cat" label="Category" value={f.category} onChange={on("category")} error={err("category")}>
              <option value="">Choose…</option>
              {cats?.categories.map((c) => <option key={c.id} value={c.id}>{pick(c.name, "en")}</option>)}
            </Select>
            <TextInput id="sku" label="SKU" value={f.sku} onChange={on("sku")} error={err("sku")} placeholder="SOF-001" required />
            <TextInput id="slug" label="URL slug" value={f.slug} onChange={on("slug")} error={err("slug")} optional="auto" hint="Leave empty to generate from the name" />
          </div>
        </Card>
        <Card title="Pricing & stock">
          <div className="grid grid-cols-2 gap-4">
            <TextInput id="price" label="Price (QAR)" inputMode="decimal" value={f.price} onChange={on("price")} error={err("price")} required />
            <TextInput id="cmp" label="Compare at" inputMode="decimal" value={f.compareAtPrice} onChange={on("compareAtPrice")} error={err("compareAtPrice")} optional="sale" />
            <TextInput id="stock" label="Stock" inputMode="numeric" value={f.stock} onChange={on("stock")} error={err("stock")} />
            <TextInput id="low" label="Low-stock alert at" inputMode="numeric" value={f.lowStockThreshold} onChange={on("lowStockThreshold")} />
          </div>
          <div className="mt-5 space-y-3">
            <Checkbox label="Featured on home page" checked={f.featured} onChange={(e) => setF((s) => ({ ...s, featured: e.target.checked }))} />
            <Checkbox label="Visible in store (active)" checked={f.active} onChange={(e) => setF((s) => ({ ...s, active: e.target.checked }))} />
          </div>
        </Card>
        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" className="flex-1" loading={creating || updating}>{product ? "Save changes" : "Create product"}</Button>
          {product && product.active && user?.role === "admin" && (
            <Button type="button" variant="outline" size="lg" loading={archiving} onClick={async () => { await archive(product.id).unwrap().catch((e) => toast.error(apiError(e).message)); toast.info("Product archived"); router.push("/dashboard/products"); }}>Archive</Button>
          )}
        </div>
      </div>
    </form>
  );
}
