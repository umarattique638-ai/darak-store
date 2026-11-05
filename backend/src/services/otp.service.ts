import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env.js";
import { Otp, type OtpPurpose } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { makeOtp } from "../utils/codes.js";

const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60_000;
const pepper = () => env.OTP_SECRET || env.JWT_REFRESH_SECRET;
const hash = (email: string, purpose: string, code: string) => createHmac("sha256", pepper()).update(`${email}|${purpose}|${code}`).digest("hex");

export const otpService = {
  /** Creates (or replaces) the code for this email+purpose. Enforces a resend cooldown. */
  async issue(email: string, purpose: OtpPurpose) {
    const existing = await Otp.findOne({ email, purpose }).lean();
    if (existing && Date.now() - new Date(existing.updatedAt as Date).getTime() < RESEND_COOLDOWN_MS) {
      throw new ApiError(429, "Please wait a minute before requesting a new code", "OTP_COOLDOWN");
    }
    const code = makeOtp();
    await Otp.updateOne(
      { email, purpose },
      { $set: { codeHash: hash(email, purpose, code), attempts: 0, expiresAt: new Date(Date.now() + env.OTP_TTL_MINUTES * 60_000) } },
      { upsert: true },
    );
    return code;
  },

  /** Single-use, time-limited, attempt-limited, constant-time comparison. */
  async consume(email: string, purpose: OtpPurpose, code: string) {
    const otp = await Otp.findOne({ email, purpose });
    if (!otp || otp.expiresAt < new Date()) throw new ApiError(400, "The code is invalid or has expired", "OTP_INVALID");
    if (otp.attempts >= MAX_ATTEMPTS) {
      await otp.deleteOne();
      throw new ApiError(429, "Too many wrong attempts — request a new code", "OTP_LOCKED");
    }
    const expected = Buffer.from(otp.codeHash, "hex");
    const given = Buffer.from(hash(email, purpose, String(code).trim()), "hex");
    if (expected.length !== given.length || !timingSafeEqual(expected, given)) {
      otp.attempts += 1;
      await otp.save();
      throw new ApiError(400, `Incorrect code — ${MAX_ATTEMPTS - otp.attempts} attempt(s) left`, "OTP_INVALID");
    }
    await otp.deleteOne();
  },
};
