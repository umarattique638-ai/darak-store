import { z } from "zod";

/** Validated environment — the process refuses to start with a bad config. */
const schema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().default(5000),
  MONGO_URL: z.string().min(1, "MONGO_URL is required"),
  MONGO_DB_NAME: z.string().default("darak_store"),

  JWT_ACCESS_SECRET: z.string().min(32, "JWT_ACCESS_SECRET must be at least 32 characters"),
  JWT_REFRESH_SECRET: z.string().min(32, "JWT_REFRESH_SECRET must be at least 32 characters"),
  ACCESS_TOKEN_TTL: z.coerce.number().int().positive().default(15 * 60),
  REFRESH_TOKEN_TTL: z.coerce.number().int().positive().default(7 * 24 * 60 * 60),
  /** Pepper mixed into OTP hashes (falls back to the refresh secret). */
  OTP_SECRET: z.string().optional().default(""),
  OTP_TTL_MINUTES: z.coerce.number().int().positive().max(60).default(10),

  /** Comma-separated browser origins allowed to call the API (the storefront). */
  CLIENT_URL: z.string().default("http://localhost:3000"),
  FRONTEND_REVALIDATE_URL: z.string().optional().default(""),
  REVALIDATE_SECRET: z.string().optional().default(""),

  SMTP_HOST: z.string().optional().default(""),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional().default(""),
  SMTP_PASS: z.string().optional().default(""),
  MAIL_FROM: z.string().default("Al Sharq Exhibition <no-reply@example.com>"),
  /** Who gets an instant email for new orders / leads / custom design requests. */
  LEAD_NOTIFY_EMAILS: z.string().optional().default(""),
  ORDER_NOTIFY_EMAILS: z.string().optional().default(""),

  CLOUDINARY_CLOUD_NAME: z.string().optional().default(""),
  CLOUDINARY_API_KEY: z.string().optional().default(""),
  CLOUDINARY_API_SECRET: z.string().optional().default(""),
  CLOUDINARY_FOLDER: z.string().default("darak_store"),
  UPLOAD_MAX_MB: z.coerce.number().positive().max(10).default(5),

  /** Store settings */
  CURRENCY: z.string().default("QAR"),
  SHIPPING_FLAT: z.coerce.number().nonnegative().default(50),
  FREE_SHIPPING_OVER: z.coerce.number().nonnegative().default(2000),
  /** Dummy bank details shown for "Bank transfer" orders — replace before going live. */
  BANK_NAME: z.string().default("XXX Bank"),
  BANK_ACCOUNT_NAME: z.string().default("Al Sharq Exhibition"),
  BANK_IBAN: z.string().default("QA00 XXXX 0000 0000 0000 0000 0000 0"),

  SEED_ADMIN_EMAIL: z.string().optional().default(""),
  SEED_ADMIN_PASSWORD: z.string().optional().default(""),
  SEED_SAMPLE_DATA: z.enum(["true", "false"]).default("true").transform((v) => v === "true"),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error("❌ Invalid environment variables:");
  for (const issue of parsed.error.issues) console.error(`   • ${issue.path.join(".")}: ${issue.message}`);
  process.exit(1);
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === "production";
export const cloudinaryEnabled = Boolean(env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET);
export const allowedOrigins = env.CLIENT_URL.split(",").map((s) => s.trim()).filter(Boolean);
const list = (s: string) => s.split(",").map((v) => v.trim()).filter(Boolean);
export const notifyEmails = () => list(env.ORDER_NOTIFY_EMAILS || env.LEAD_NOTIFY_EMAILS);
