import { Schema, model, type InferSchemaType } from "mongoose";

export const STOCK_REASONS = ["order", "order_cancelled", "restock", "adjustment", "return"] as const;

/** Audit log of every stock change (who, why, how much). */
const stockMovementSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    change: { type: Number, required: true },
    stockAfter: { type: Number, required: true },
    reason: { type: String, enum: STOCK_REASONS, required: true },
    note: { type: String, default: "" },
    order: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export type StockMovementDoc = InferSchemaType<typeof stockMovementSchema>;
export const StockMovement = model<StockMovementDoc>("StockMovement", stockMovementSchema);
