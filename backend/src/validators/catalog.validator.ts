import { z } from "zod";
import { MATERIALS } from "../models/Product.js";

const i18n = (max: number, required = true) =>
  z.object({
    en: required ? z.string().trim().min(1, "English text is required").max(max) : z.string().trim().max(max).default(""),
    ar: z.string().trim().max(max).default(""),
  });
const slug = z.string().trim().toLowerCase().regex(/^[a-z0-9-]*$/, "Use lowercase letters, numbers and dashes").max(96);
/** https URL (Cloudinary etc.) or one of the storefront's own bundled images (/images/...). */
const imageUrl = z
  .string()
  .trim()
  .max(500)
  .refine((u) => /^\/images\/[\w\-/]+\.(webp|jpe?g|png|avif)$/.test(u) || /^https:\/\/[^\s]+$/.test(u), "Image must be an https URL");

export const categorySchema = z.object({
  name: i18n(80),
  slug: slug.optional().default(""),
  description: i18n(400, false).optional().default({ en: "", ar: "" }),
  image: imageUrl.or(z.literal("")).default(""),
  order: z.coerce.number().int().min(0).max(999).default(0),
  active: z.boolean().default(true),
});

export const productSchema = z.object({
  name: i18n(120),
  slug: slug.optional().default(""),
  sku: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,32}$/, "3–32 letters, numbers or dashes"),
  description: i18n(5000),
  category: z.string().regex(/^[a-f0-9]{24}$/, "Choose a category"),
  price: z.coerce.number().positive("Price must be more than 0").max(1_000_000),
  compareAtPrice: z.coerce.number().positive().max(1_000_000).nullable().optional().default(null),
  images: z.array(z.object({ url: imageUrl, alt: z.string().trim().max(160).default("") })).max(10).default([]),
  materials: z.array(z.enum(MATERIALS)).max(8).default([]),
  colors: z.array(z.object({ name: z.string().trim().min(1).max(30), hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a #RRGGBB colour") })).max(12).default([]),
  dimensions: z.object({ width: z.coerce.number().min(0).max(1000), depth: z.coerce.number().min(0).max(1000), height: z.coerce.number().min(0).max(1000) }).default({ width: 0, depth: 0, height: 0 }),
  stock: z.coerce.number().int().min(0).max(100000),
  lowStockThreshold: z.coerce.number().int().min(0).max(1000).default(3),
  featured: z.boolean().default(false),
  active: z.boolean().default(true),
});
export const productUpdateSchema = productSchema.partial();

export const stockAdjustSchema = z.object({
  change: z.coerce.number().int().refine((v) => v !== 0, "Change cannot be 0").refine((v) => Math.abs(v) <= 10000, "Too large"),
  reason: z.enum(["restock", "adjustment", "return"]),
  note: z.string().trim().max(200).default(""),
});

export type CategoryInput = z.infer<typeof categorySchema>;
export type ProductInput = z.infer<typeof productSchema>;
