import { Schema, model, type InferSchemaType } from "mongoose";

/**
 * Revoked access tokens (by jti). Kept only until the token would have expired anyway —
 * the TTL index removes them, so the collection never grows unbounded.
 */
const blacklistSchema = new Schema(
  {
    jti: { type: String, required: true, unique: true },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    reason: { type: String, default: "logout" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

blacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type BlacklistDoc = InferSchemaType<typeof blacklistSchema>;
export const TokenBlacklist = model<BlacklistDoc>("TokenBlacklist", blacklistSchema);
