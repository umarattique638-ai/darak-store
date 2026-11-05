import { Schema } from "mongoose";

/** Bilingual text: English is required, Arabic falls back to English when empty. */
export const i18nText = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, default: "", trim: true },
  },
  { _id: false },
);

export const imageSchema = new Schema(
  {
    url: { type: String, required: true },
    alt: { type: String, default: "" },
  },
  { _id: false },
);
