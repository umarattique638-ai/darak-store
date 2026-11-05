import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { getCategories, getProducts } from "@/lib/server/api";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url;
  const [cats, prods] = await Promise.all([getCategories(), getProducts("limit=60")]);
  const pages = ["", "/shop", "/custom-design", "/about", "/contact", "/track"].map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p ? 0.7 : 1 }));
  return [
    ...pages,
    ...cats.map((c) => ({ url: `${base}/shop?category=${c.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...prods.items.map((p) => ({ url: `${base}/shop/${p.slug}`, lastModified: p.updatedAt ?? undefined, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
