import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";
import { ApiError } from "../utils/ApiError.js";
import { isProd } from "../config/env.js";

/** { "shippingAddress.phone": ["Enter a valid phone"] } — dotted paths so nested fields can be highlighted. */
function fieldErrors(err: ZodError) {
  const out: Record<string, string[]> = {};
  for (const i of err.issues) {
    const key = i.path.length ? i.path.join(".") : "_";
    (out[key] ??= []).push(i.message);
  }
  return out;
}

const send = (res: Response, status: number, code: string, message: string, details?: unknown) =>
  res.status(status).json({ success: false, error: { code, message, details } });

export function notFound(req: Request, res: Response) {
  send(res, 404, "NOT_FOUND", `Route ${req.method} ${req.originalUrl} not found`);
}

/** Central error handler — Express 5 forwards rejected async handlers here automatically. */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ApiError) return send(res, err.status, err.code, err.message, err.details);
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? "Image is too large" : err.code === "LIMIT_UNEXPECTED_FILE" ? "Send the image in a field named \"image\"" : err.message;
    return send(res, err.code === "LIMIT_FILE_SIZE" ? 413 : 400, "UPLOAD_ERROR", msg);
  }
  if (err instanceof ZodError) return send(res, 422, "VALIDATION_ERROR", "Please check the highlighted fields", fieldErrors(err));
  if (err instanceof mongoose.Error.CastError) return send(res, 400, "BAD_ID", "Invalid id");
  if (err instanceof SyntaxError && "body" in err) return send(res, 400, "BAD_JSON", "Request body must be valid JSON");
  if (typeof err === "object" && err && (err as { code?: number }).code === 11000) return send(res, 409, "DUPLICATE", "A record with this value already exists");

  console.error(`[api] ${req.method} ${req.originalUrl}`, err);
  return send(res, 500, "INTERNAL_ERROR", isProd ? "Something went wrong. Please try again." : String((err as Error)?.message ?? err));
}
