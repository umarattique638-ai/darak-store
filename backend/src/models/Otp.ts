import { Schema, model, type InferSchemaType } from "mongoose";

export const OTP_PURPOSES = ["verify_email", "reset_password"] as const;
export type OtpPurpose = (typeof OTP_PURPOSES)[number];

/**
 * One-time codes. Only an HMAC of the code is stored; attempts are capped and
 * the TTL index deletes the document once it expires.
 */
const otpSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, index: true },
    purpose: { type: String, enum: OTP_PURPOSES, required: true },
    codeHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true },
);
otpSchema.index({ email: 1, purpose: 1 }, { unique: true });
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type OtpDoc = InferSchemaType<typeof otpSchema>;
export const Otp = model<OtpDoc>("Otp", otpSchema);
