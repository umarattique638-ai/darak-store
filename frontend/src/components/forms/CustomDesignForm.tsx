"use client";

import { useState } from "react";
import { LuLock } from "react-icons/lu";
import { useI18n } from "@/i18n/client";
import { useCurrentUser } from "@/store/hooks";
import { apiError, useCreateDesignMutation } from "@/store/api";
import { Button, ButtonLink } from "@/components/ui/Button";
import { TextArea, TextInput } from "@/components/ui/Field";
import { ImageUploader } from "@/components/ui/ImageUploader";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";

const TYPES = ["sofa", "chair", "bed", "table", "wardrobe", "cabinet", "majlis", "other"] as const;
const init = { furnitureType: "sofa", width: "", depth: "", height: "", material: "", color: "", quantity: "1", budget: "", deadline: "", description: "", phone: "" };

export function CustomDesignForm() {
  const { t } = useI18n();
  const user = useCurrentUser();
  const [edits, setF] = useState<Partial<typeof init>>({});
  const f = { ...init, phone: user?.phone ?? "", ...edits };
  const [images, setImages] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [create, { isLoading }] = useCreateDesignMutation();
  const [done, setDone] = useState<string | null>(null);

  if (!user)
    return (
      <div className="flex flex-col items-center rounded-3xl border border-line bg-white p-12 text-center">
        <span className="grid size-16 place-items-center rounded-2xl bg-accent-soft text-accent"><LuLock className="size-7" /></span>
        <p className="mt-5 max-w-sm font-display text-2xl">{t.custom.signIn}</p>
        <div className="mt-7 flex gap-3">
          <ButtonLink href="/login?next=/custom-design">{t.nav.login}</ButtonLink>
          <ButtonLink href="/register?next=/custom-design" variant="outline">{t.auth.createAccount}</ButtonLink>
        </div>
      </div>
    );

  if (done)
    return (
      <div className="animate-[fadeIn_.5s] rounded-3xl bg-accent p-12 text-center text-white">
        <p className="eyebrow text-white/70">{done}</p>
        <p className="display mt-4 text-3xl">{t.custom.sent}</p>
        <div className="mt-8 flex justify-center gap-3">
          <ButtonLink href="/account/designs" variant="light">{t.custom.mine}</ButtonLink>
          <Button variant="ghost" className="text-white hover:bg-white/10" onClick={() => { setDone(null); setF({ phone: f.phone }); setImages([]); }}>+</Button>
        </div>
      </div>
    );

  const on = (k: keyof typeof init) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF((s) => ({ ...s, [k]: e.target.value }));
  const num = (v: string) => (v ? Number(v) : undefined);

  return (
    <form
      noValidate
      className="space-y-8 rounded-3xl border border-line bg-white p-6 md:p-10"
      onSubmit={async (e) => {
        e.preventDefault();
        setErrors({});
        try {
          const { design } = await create({
            phone: f.phone, furnitureType: f.furnitureType, material: f.material, color: f.color, description: f.description,
            dimensions: { width: num(f.width), depth: num(f.depth), height: num(f.height) },
            quantity: Number(f.quantity) || 1, budget: Number(f.budget) || 0, deadline: f.deadline || null, referenceImages: images,
          }).unwrap();
          setDone(design.requestNumber);
          toast.success(t.custom.sent);
        } catch (e2) {
          const a = apiError(e2);
          setErrors(a.fields);
          toast.error(a.message);
        }
      }}
    >
      <fieldset>
        <legend className="mb-3 text-[13px] font-semibold text-fg/80">{t.custom.type}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {TYPES.map((k) => (
            <button type="button" key={k} onClick={() => setF((s) => ({ ...s, furnitureType: k }))} aria-pressed={f.furnitureType === k} className={cn("rounded-xl border-2 px-3 py-3 text-sm font-semibold transition-all", f.furnitureType === k ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-fg/30")}>
              {t.custom.types[k]}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-5 sm:grid-cols-3">
        <TextInput id="w" label={t.custom.width} inputMode="numeric" value={f.width} onChange={on("width")} optional={t.common.optional} />
        <TextInput id="d" label={t.custom.depth} inputMode="numeric" value={f.depth} onChange={on("depth")} optional={t.common.optional} />
        <TextInput id="h" label={t.custom.height} inputMode="numeric" value={f.height} onChange={on("height")} optional={t.common.optional} />
        <TextInput id="mat" label={t.custom.material} value={f.material} onChange={on("material")} optional={t.common.optional} />
        <TextInput id="col" label={t.custom.color} value={f.color} onChange={on("color")} optional={t.common.optional} />
        <TextInput id="qty" label={t.custom.qty} type="number" min={1} max={100} value={f.quantity} onChange={on("quantity")} error={errors.quantity} />
        <TextInput id="budget" label={t.custom.budget} inputMode="numeric" value={f.budget} onChange={on("budget")} optional={t.common.optional} error={errors.budget} />
        <TextInput id="deadline" label={t.custom.deadline} type="date" value={f.deadline} onChange={on("deadline")} optional={t.common.optional} />
        <TextInput id="phone" label={t.custom.phone} inputMode="tel" value={f.phone} onChange={on("phone")} error={errors.phone} placeholder="+974 5555 1234" required />
      </div>
      <TextArea id="desc" label={t.custom.description} placeholder={t.custom.descriptionPh} rows={5} value={f.description} onChange={on("description")} error={errors.description} maxLength={3000} required />
      <ImageUploader folder="designs" value={images} onChange={setImages} label={t.custom.images} hint={t.custom.imagesHint} />
      <Button type="submit" size="lg" loading={isLoading} className="w-full sm:w-auto">{t.custom.submit}</Button>
    </form>
  );
}
