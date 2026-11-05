import { Schema, model, type InferSchemaType } from "mongoose";

export const DESIGN_STATUS = ["new", "reviewing", "quoted", "in_production", "completed", "declined"] as const;
export const FURNITURE_TYPES = ["sofa", "chair", "bed", "table", "wardrobe", "cabinet", "majlis", "other"] as const;

/** A customer's made-to-order furniture request. */
const customDesignSchema = new Schema(
  {
    requestNumber: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    phone: { type: String, required: true },
    furnitureType: { type: String, enum: FURNITURE_TYPES, required: true },
    dimensions: { width: Number, depth: Number, height: Number },
    material: { type: String, default: "" },
    color: { type: String, default: "" },
    quantity: { type: Number, default: 1, min: 1 },
    budget: { type: Number, default: 0 },
    deadline: { type: Date, default: null },
    description: { type: String, required: true, maxlength: 3000 },
    referenceImages: [{ type: String }],
    status: { type: String, enum: DESIGN_STATUS, default: "new", index: true },
    quotedPrice: { type: Number, default: null },
    adminNote: { type: String, default: "" },
  },
  { timestamps: true },
);

export type CustomDesignDoc = InferSchemaType<typeof customDesignSchema>;
export const CustomDesign = model<CustomDesignDoc>("CustomDesign", customDesignSchema);
