import type { Request } from "express";

export const clientMeta = (req: Request) => ({
  ip: req.ip ?? "unknown",
  userAgent: (req.get("user-agent") ?? "").slice(0, 300),
});
