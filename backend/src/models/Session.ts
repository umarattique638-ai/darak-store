import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * One document per login (device). The refresh token itself is never stored —
 * only a SHA-256 hash of its unique id (jti), which changes on every rotation.
 */
const sessionSchema = new Schema(
  {
    _id: { type: String, required: true }, // session id (sid) — random UUID
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    refreshTokenHash: { type: String, required: true },
    /** previous hash + rotation time → tolerate two tabs refreshing at the same moment */
    previousTokenHash: { type: String, default: null },
    rotatedAt: { type: Date, default: null },
    userAgent: { type: String, default: "" },
    ip: { type: String, default: "" },
    lastUsedAt: { type: Date, default: Date.now },
    revokedAt: { type: Date, default: null },
    revokedReason: { type: String, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);

// Mongo deletes the document automatically once the refresh token can no longer be used.
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type SessionDoc = InferSchemaType<typeof sessionSchema>;
export const Session = model<SessionDoc>("Session", sessionSchema);
