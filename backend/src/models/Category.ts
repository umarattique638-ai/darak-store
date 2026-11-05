import { Schema, model, type InferSchemaType } from "mongoose";
import { i18nText } from "./shared.js";

const categorySchema = new Schema(
  {
    name: { type: i18nText, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: i18nText, default: () => ({ en: "", ar: "" }) },
    image: { type: String, default: "" },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export type CategoryDoc = InferSchemaType<typeof categorySchema>;
export const Category = model<CategoryDoc>("Category", categorySchema);
