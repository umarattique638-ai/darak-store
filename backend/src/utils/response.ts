import type { Response } from "express";

/** Consistent JSON envelope: { success: true, data } */
export const ok = <T>(res: Response, data: T, status = 200) => res.status(status).json({ success: true, data });
export const created = <T>(res: Response, data: T) => ok(res, data, 201);
