import type { NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { allowedOrigins } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

/** CSRF defence in depth (cookies are SameSite too): mutations must come from our origin. */
export function originCheck(req: Request, _res: Response, next: NextFunction) {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  const origin = req.get("origin");
  if (origin && !allowedOrigins.includes(origin)) throw ApiError.forbidden("Cross-origin request blocked");
  next();
}

/** Strips keys starting with "$" or containing "." from bodies/queries (NoSQL operator injection). */
export function sanitize(req: Request, _res: Response, next: NextFunction) {
  const clean = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(clean);
    if (v && typeof v === "object") {
      for (const k of Object.keys(v)) {
        if (k.startsWith("$") || k.includes(".")) delete (v as Record<string, unknown>)[k];
        else (v as Record<string, unknown>)[k] = clean((v as Record<string, unknown>)[k]);
      }
    }
    return v;
  };
  if (req.body) clean(req.body);
  if (req.params) clean(req.params);
  next();
}

const limiter = (windowMs: number, limit: number, message: string) =>
  rateLimit({
    windowMs, limit, standardHeaders: "draft-8", legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ success: false, error: { code: "RATE_LIMITED", message } }),
  });

export const apiLimiter = limiter(60_000, 400, "Too many requests, slow down a little.");
export const loginLimiter = limiter(15 * 60_000, 10, "Too many login attempts. Try again in 15 minutes.");
export const registerLimiter = limiter(60 * 60_000, 10, "Too many sign-ups from this network.");
export const otpLimiter = limiter(15 * 60_000, 15, "Too many code requests. Please wait a few minutes.");
export const contactLimiter = limiter(60_000, 5, "Too many messages. Please wait a minute.");
export const orderLimiter = limiter(10 * 60_000, 10, "Too many orders in a short time. Please wait a few minutes.");
export const trackLimiter = limiter(60_000, 20, "Too many tracking requests. Please wait a minute.");
export const uploadLimiter = limiter(60 * 60_000, 80, "Upload limit reached. Please try again later.");
