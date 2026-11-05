import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Cloudinary/Unsplash URLs get resized by their CDN; anything else is returned as-is. */
export function imageUrl(src: string, width: number) {
  if (!src) return "";
  if (src.startsWith("https://images.unsplash.com")) {
    const u = new URL(src);
    u.searchParams.set("auto", "format");
    u.searchParams.set("fit", "crop");
    u.searchParams.set("w", String(width));
    u.searchParams.set("q", "75");
    return u.toString();
  }
  if (/^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\//.test(src)) return src.replace("/image/upload/", `/image/upload/f_auto,q_auto,c_limit,w_${width}/`);
  return src;
}
