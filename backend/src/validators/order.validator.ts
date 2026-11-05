import { z } from "zod";
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from "../models/Order.js";
import { phoneField } from "./auth.validator.js";

const objectId = z.string().regex(/^[a-f0-9]{24}$/, "Invalid id");

export const addressSchema = z.object({
  label: z.string().trim().max(40).default("Home"),
  fullName: z.string().trim().min(2, "Enter the full name").max(80),
  phone: phoneField,
  city: z.string().trim().min(2, "Enter the city").max(60),
  area: z.string().trim().max(80).default(""),
  street: z.string().trim().min(2, "Enter the street / zone").max(160),
  building: z.string().trim().max(60).default(""),
  notes: z.string().trim().max(300).default(""),
  isDefault: z.boolean().default(false),
});

export const cartItemsSchema = z
  .array(z.object({ productId: objectId, quantity: z.coerce.number().int().min(1).max(20), color: z.string().trim().max(30).default("") }))
  .min(1, "Your cart is empty")
  .max(50);

export const quoteSchema = z.object({ items: cartItemsSchema });

export const checkoutSchema = z.object({
  items: cartItemsSchema,
  shippingAddress: addressSchema.omit({ label: true, isDefault: true }),
  paymentMethod: z.enum(PAYMENT_METHODS),
  customerNote: z.string().trim().max(500).default(""),
  saveAddress: z.boolean().default(false),
});

export const orderStatusSchema = z.object({
  status: z.enum(ORDER_STATUS),
  note: z.string().trim().max(300).default(""),
  trackingNumber: z.string().trim().max(60).optional(),
  courier: z.string().trim().max(60).optional(),
  paymentStatus: z.enum(PAYMENT_STATUS).optional(),
});

export const trackSchema = z.object({
  orderNumber: z.string().trim().toUpperCase().regex(/^DRK-\d{6}-\d{6}$/, "Enter a valid order number"),
  email: z.email().transform((v) => v.toLowerCase().trim()),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type AddressInput = z.infer<typeof addressSchema>;
export type CartItemInput = z.infer<typeof cartItemsSchema>[number];
