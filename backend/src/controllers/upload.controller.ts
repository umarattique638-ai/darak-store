import type { Request, Response } from "express";
import { uploadService } from "../services/upload.service.js";
import { created, ok } from "../utils/response.js";
import { ApiError } from "../utils/ApiError.js";

const FOLDERS = ["products", "categories", "designs", "misc"] as const;
type Folder = (typeof FOLDERS)[number];

export const uploadController = {
  /** POST /uploads/image  (multipart, field "image", optional ?folder=posts|services) */
  async image(req: Request, res: Response) {
    const folder = (FOLDERS as readonly string[]).includes(String(req.query.folder)) ? (req.query.folder as Folder) : "misc";
    const image = await uploadService.uploadImage(req.file, folder);
    created(res, { image });
  },

  /** DELETE /uploads/image  { publicId } */
  async remove(req: Request, res: Response) {
    const publicId = typeof req.body?.publicId === "string" ? req.body.publicId : "";
    if (!publicId) throw ApiError.badRequest("publicId is required");
    ok(res, await uploadService.deleteImage(publicId));
  },
};
