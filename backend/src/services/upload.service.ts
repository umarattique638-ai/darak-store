import type { UploadApiResponse } from "cloudinary";
import { cloudinary } from "../config/cloudinary.js";
import { cloudinaryEnabled, env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

export interface UploadedImage {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/** Magic-byte check so a renamed .exe can't pass as an image just by its mimetype. */
function looksLikeImage(buf: Buffer) {
  const hex = buf.subarray(0, 12).toString("hex");
  return (
    hex.startsWith("ffd8ff") || // jpeg
    hex.startsWith("89504e47") || // png
    hex.startsWith("47494638") || // gif
    (hex.startsWith("52494646") && buf.subarray(8, 12).toString() === "WEBP") || // webp
    buf.subarray(4, 12).toString().startsWith("ftypavi") // avif
  );
}

function ensureEnabled() {
  if (!cloudinaryEnabled) throw ApiError.unavailable("Image uploads are not configured. Add your CLOUDINARY_* keys to backend/.env");
}

export const uploadService = {
  async uploadImage(file: Express.Multer.File | undefined, subfolder: "products" | "categories" | "designs" | "misc" = "misc"): Promise<UploadedImage> {
    ensureEnabled();
    if (!file) throw ApiError.badRequest("Choose an image to upload");
    if (!looksLikeImage(file.buffer)) throw ApiError.badRequest("That file is not a valid image");

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: `${env.CLOUDINARY_FOLDER}/${subfolder}`,
          resource_type: "image",
          // keep originals sane: max 2400px wide, no upscaling
          transformation: [{ width: 2400, crop: "limit" }],
          overwrite: false,
          unique_filename: true,
        },
        (err, res) => (err || !res ? reject(err ?? new Error("Upload failed")) : resolve(res)),
      );
      stream.end(file.buffer);
    }).catch((e: unknown) => {
      console.error("[cloudinary] upload failed", e);
      throw new ApiError(502, "Upload to Cloudinary failed — check your Cloudinary keys", "UPLOAD_FAILED");
    });

    return { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height, format: result.format, bytes: result.bytes };
  },

  /** Deletes an image we uploaded (only inside our own folder). */
  async deleteImage(publicId: string) {
    ensureEnabled();
    if (!publicId.startsWith(`${env.CLOUDINARY_FOLDER}/`)) throw ApiError.badRequest("Not one of our images");
    const res = (await cloudinary.uploader.destroy(publicId, { resource_type: "image" })) as { result: string };
    return { deleted: res.result === "ok" };
  },
};
