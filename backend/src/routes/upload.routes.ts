import { Router, type NextFunction, type Request, type Response } from "express";
import { uploadController as c } from "../controllers/upload.controller.js";
import { requireAdmin, requireAuth } from "../middlewares/auth.middleware.js";
import { imageUpload } from "../middlewares/upload.middleware.js";
import { uploadLimiter } from "../middlewares/security.middleware.js";

/** Customers may only upload design reference images; staff may upload to any folder. */
const scopeFolder = (req: Request, _res: Response, next: NextFunction) => {
  if (req.auth?.role === "customer") req.query.folder = "designs";
  next();
};

const r = Router();
// auth runs BEFORE multer, so anonymous requests are rejected without reading the file
r.post("/image", requireAuth, uploadLimiter, scopeFolder, imageUpload, c.image);
r.delete("/image", ...requireAdmin, c.remove);
export default r;
