import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

/** Validates & replaces req.body with the parsed (trimmed, defaulted) value. */
export const validateBody =
  (schema: ZodType) =>
  (req: Request, _res: Response, next: NextFunction) => {
    req.body = schema.parse(req.body ?? {});
    next();
  };
