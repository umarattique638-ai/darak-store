import { z } from "zod";
import { DESIGN_STATUS, FURNITURE_TYPES } from "../models/CustomDesign.js";
import { LEAD_STATUS } from "../models/Lead.js";
import { emailField, phoneField } from "./auth.validator.js";

export const contactSchema = z.object({
  name: z.string().trim().min(2, "Please tell us your name").max(80),
  email: emailField,
  phone: phoneField.optional().or(z.literal("")),
  subject: z.string().trim().max(120).default(""),
  message: z.string().trim().min(10, "A few more words, please").max(3000),
  website: z.string().max(0).optional(), // honeypot
});

const dim = z.coerce.number().min(0).max(1000).optional();
export const designSchema = z.object({
  phone: phoneField,
  furnitureType: z.enum(FURNITURE_TYPES),
  dimensions: z.object({ width: dim, depth: dim, height: dim }).default({}),
  material: z.string().trim().max(60).default(""),
  color: z.string().trim().max(60).default(""),
  quantity: z.coerce.number().int().min(1).max(100).default(1),
  budget: z.coerce.number().min(0).max(10_000_000).default(0),
  deadline: z.coerce.date().optional().nullable(),
  description: z.string().trim().min(15, "Describe your idea in a little more detail").max(3000),
  referenceImages: z.array(z.string().url().refine((u) => u.startsWith("https://"))).max(6).default([]),
});

export const designUpdateSchema = z.object({
  status: z.enum(DESIGN_STATUS),
  quotedPrice: z.coerce.number().min(0).max(10_000_000).nullable().optional(),
  adminNote: z.string().trim().max(2000).default(""),
  notify: z.boolean().default(true),
});

export const leadStatusSchema = z.object({ status: z.enum(LEAD_STATUS) });
export const profileSchema = z.object({
  name: z.string().trim().min(2).max(80),
  phone: phoneField.optional().or(z.literal("")),
  locale: z.enum(["en", "ar"]).optional(),
});
export const customerUpdateSchema = z.object({ blocked: z.boolean().optional(), role: z.enum(["customer", "staff", "admin"]).optional() });

export type DesignInput = z.infer<typeof designSchema>;
