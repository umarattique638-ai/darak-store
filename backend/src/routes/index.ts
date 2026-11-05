import { Router } from "express";
import mongoose from "mongoose";
import { cloudinaryEnabled, env } from "../config/env.js";
import authRoutes from "./auth.routes.js";
import catalogRoutes from "./catalog.routes.js";
import orderRoutes from "./order.routes.js";
import accountRoutes from "./account.routes.js";
import adminRoutes from "./admin.routes.js";
import uploadRoutes from "./upload.routes.js";
import { adminController } from "../controllers/admin.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { contactLimiter } from "../middlewares/security.middleware.js";
import { contactSchema } from "../validators/misc.validator.js";

const api = Router();
api.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", db: mongoose.connection.readyState === 1 ? "up" : "down", uploads: cloudinaryEnabled ? "cloudinary" : "disabled", mail: env.SMTP_HOST ? "smtp" : "console" } });
});
/** Public store settings the checkout needs. */
api.get("/settings", (_req, res) => {
  res.json({ success: true, data: {
    currency: env.CURRENCY, shippingFlat: env.SHIPPING_FLAT, freeShippingOver: env.FREE_SHIPPING_OVER,
    bank: { name: env.BANK_NAME, accountName: env.BANK_ACCOUNT_NAME, iban: env.BANK_IBAN },
  } });
});
api.use("/auth", authRoutes);
api.use("/", catalogRoutes);
api.use("/orders", orderRoutes);
api.use("/account", accountRoutes);
api.use("/admin", adminRoutes);
api.use("/uploads", uploadRoutes);
api.post("/contact", contactLimiter, validateBody(contactSchema), adminController.contact);
export default api;
