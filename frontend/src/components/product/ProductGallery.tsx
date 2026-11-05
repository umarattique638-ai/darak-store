"use client";

import { useState } from "react";
import Image from "next/image";
import { cn, imageUrl } from "@/lib/utils";

/** Main image with cross-fade + zoom-on-hover following the cursor; thumbnails below. */
export function ProductGallery({ images, name }: { images: { url: string; alt: string }[]; name: string }) {
  const [active, setActive] = useState(0);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoom, setZoom] = useState(false);
  if (!images.length) return <div className="aspect-square rounded-3xl bg-surface" />;
  return (
    <div className="flex flex-col gap-4 lg:flex-row-reverse">
      <div
        className="relative aspect-square flex-1 cursor-zoom-in overflow-hidden rounded-3xl bg-surface"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          setOrigin(`${((e.clientX - r.left) / r.width) * 100}% ${((e.clientY - r.top) / r.height) * 100}%`);
        }}
      >
        {images.map((img, i) => (
          <Image
            key={img.url}
            src={imageUrl(img.url, 1400)}
            alt={img.alt || name}
            fill
            unoptimized
            priority={i === 0}
            sizes="(max-width:1024px) 100vw, 55vw"
            style={{ transformOrigin: origin }}
            className={cn("object-cover transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]", i === active ? "opacity-100" : "opacity-0", i === active && zoom && "scale-[1.7]")}
          />
        ))}
      </div>
      {images.length > 1 && (
        <div className="flex gap-3 lg:w-20 lg:flex-col">
          {images.map((img, i) => (
            <button key={img.url} onClick={() => setActive(i)} aria-label={`${name} ${i + 1}`} aria-current={i === active} className={cn("relative aspect-square w-20 overflow-hidden rounded-xl border-2 transition-all", i === active ? "border-accent" : "border-transparent opacity-60 hover:opacity-100")}>
              <Image src={imageUrl(img.url, 200)} alt="" fill unoptimized sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
