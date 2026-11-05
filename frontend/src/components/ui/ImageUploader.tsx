"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { LuImagePlus, LuX } from "react-icons/lu";
import { apiError, useUploadImageMutation } from "@/store/api";
import { toast } from "@/lib/toast";
import { cn, imageUrl } from "@/lib/utils";

const TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX = 5 * 1024 * 1024;

/** Uploads to Cloudinary through the API; returns https URLs. Drag & drop supported. */
export function ImageUploader({ value, onChange, folder, max = 6, label, hint }: { value: string[]; onChange: (v: string[]) => void; folder: "products" | "categories" | "designs" | "misc"; max?: number; label?: string; hint?: string }) {
  const input = useRef<HTMLInputElement>(null);
  const [upload] = useUploadImageMutation();
  const [busy, setBusy] = useState(0);
  const [drag, setDrag] = useState(false);

  const handle = async (files: FileList | null) => {
    if (!files) return;
    const room = max - value.length;
    const list = Array.from(files).slice(0, room);
    const urls: string[] = [];
    for (const f of list) {
      if (!TYPES.includes(f.type)) { toast.error(`${f.name}: JPG, PNG, WEBP or AVIF only`); continue; }
      if (f.size > MAX) { toast.error(`${f.name}: max 5 MB`); continue; }
      setBusy((n) => n + 1);
      try {
        const { image } = await upload({ file: f, folder }).unwrap();
        urls.push(image.url);
      } catch (e) {
        toast.error(apiError(e).message);
      } finally {
        setBusy((n) => n - 1);
      }
    }
    if (urls.length) onChange([...value, ...urls]);
    if (input.current) input.current.value = "";
  };

  return (
    <div>
      {label && <p className="mb-1.5 text-[13px] font-semibold text-fg/80">{label}</p>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-square overflow-hidden rounded-xl bg-surface animate-[fadeIn_.4s]">
            <Image src={imageUrl(url, 300)} alt="" fill unoptimized sizes="120px" className="object-cover" />
            {i === 0 && folder === "products" && <span className="absolute start-1.5 top-1.5 rounded-md bg-fg/80 px-1.5 py-0.5 text-[10px] font-bold text-page">Cover</span>}
            <button type="button" aria-label="Remove image" onClick={() => onChange(value.filter((u) => u !== url))} className="absolute end-1.5 top-1.5 grid size-7 place-items-center rounded-full bg-white/90 text-fg opacity-0 shadow transition-opacity group-hover:opacity-100 focus:opacity-100"><LuX className="size-4" /></button>
          </div>
        ))}
        {Array.from({ length: busy }, (_, i) => <div key={`b${i}`} className="skeleton aspect-square rounded-xl" />)}
        {value.length + busy < max && (
          <button
            type="button"
            onClick={() => input.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={(e) => { e.preventDefault(); setDrag(false); handle(e.dataTransfer.files); }}
            className={cn("grid aspect-square place-items-center rounded-xl border-2 border-dashed text-mute transition-colors", drag ? "border-accent bg-accent-soft text-accent" : "border-line hover:border-accent hover:text-accent")}
          >
            <LuImagePlus className="size-6" />
          </button>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-mute">{hint}</p>}
      <input ref={input} type="file" accept={TYPES.join(",")} multiple hidden onChange={(e) => handle(e.target.files)} />
    </div>
  );
}
