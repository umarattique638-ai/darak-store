import { Schema, model, type InferSchemaType } from "mongoose";

export const ORDER_STATUS = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUS)[number];
export const PAYMENT_METHODS = ["cod", "bank_transfer"] as const;
export const PAYMENT_STATUS = ["unpaid", "awaiting_transfer", "paid", "refunded"] as const;

/** Snapshot of the product at purchase time — later product edits never change an order. */
const itemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    name: { type: String, required: true },
    nameAr: { type: String, default: "" },
    sku: { type: String, required: true },
    image: { type: String, default: "" },
    color: { type: String, default: "" },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    lineTotal: { type: Number, required: true },
  },
  { _id: false },
);

const timelineSchema = new Schema(
  {
    status: { type: String, enum: ORDER_STATUS, required: true },
    note: { type: String, default: "" },
    at: { type: Date, default: Date.now },
    by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false },
);

const orderSchema = new Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    email: { type: String, required: true, lowercase: true },
    items: { type: [itemSchema], required: true },
    shippingAddress: {
      fullName: String,
      phone: String,
      city: String,
      area: String,
      street: String,
      building: String,
      notes: String,
    },
    currency: { type: String, default: "QAR" },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true },
    total: { type: Number, required: true },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, required: true },
    paymentStatus: { type: String, enum: PAYMENT_STATUS, default: "unpaid" },
    status: { type: String, enum: ORDER_STATUS, default: "pending", index: true },
    timeline: { type: [timelineSchema], default: [] },
    trackingNumber: { type: String, default: "" },
    courier: { type: String, default: "" },
    customerNote: { type: String, default: "", maxlength: 500 },
    stockRestored: { type: Boolean, default: false },
  },
  { timestamps: true },
);
orderSchema.index({ createdAt: -1 });

export type OrderDoc = InferSchemaType<typeof orderSchema>;
export const Order = model<OrderDoc>("Order", orderSchema);
