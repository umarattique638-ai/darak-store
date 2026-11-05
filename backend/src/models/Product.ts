import { Schema, model, type InferSchemaType } from "mongoose";
import { i18nText, imageSchema } from "./shared.js";

export const MATERIALS = ["wood", "fabric", "leather", "metal", "rattan", "marble", "glass", "velvet"] as const;

const productSchema = new Schema(
  {
    name: { type: i18nText, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    sku: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: i18nText, required: true },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true, index: true },
    price: { type: Number, required: true, min: 0 },
    /** Optional "was" price for sales */
    compareAtPrice: { type: Number, default: null, min: 0 },
    images: { type: [imageSchema], default: [] },
    materials: [{ type: String, enum: MATERIALS }],
    colors: [{ name: { type: String, required: true }, hex: { type: String, required: true } }],
    dimensions: {
      width: { type: Number, default: 0 },
      depth: { type: Number, default: 0 },
      height: { type: Number, default: 0 },
    },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, default: 3, min: 0 },
    featured: { type: Boolean, default: false, index: true },
    active: { type: Boolean, default: true, index: true },
    sold: { type: Number, default: 0 },
  },
  { timestamps: true },
);
productSchema.index({ "name.en": "text", "name.ar": "text", "description.en": "text", sku: "text" });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

export type ProductDoc = InferSchemaType<typeof productSchema>;
export const Product = model<ProductDoc>("Product", productSchema);
