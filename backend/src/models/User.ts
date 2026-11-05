import { Schema, model, type InferSchemaType } from "mongoose";

export const ROLES = ["customer", "staff", "admin"] as const;
export type Role = (typeof ROLES)[number];

const addressSchema = new Schema(
  {
    label: { type: String, default: "Home", maxlength: 40 },
    fullName: { type: String, required: true, maxlength: 80 },
    phone: { type: String, required: true, maxlength: 30 },
    city: { type: String, required: true, maxlength: 60 },
    area: { type: String, default: "", maxlength: 80 },
    street: { type: String, required: true, maxlength: 160 },
    building: { type: String, default: "", maxlength: 60 },
    notes: { type: String, default: "", maxlength: 300 },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, default: "", maxlength: 30 },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: "customer", index: true },
    emailVerified: { type: Boolean, default: false },
    locale: { type: String, enum: ["en", "ar"], default: "en" },
    addresses: { type: [addressSchema], default: [] },
    wishlist: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    blocked: { type: Boolean, default: false },
    lastLoginAt: { type: Date },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true },
);

export type UserDoc = InferSchemaType<typeof userSchema>;
export const User = model<UserDoc>("User", userSchema);
