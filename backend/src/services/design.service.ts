import { CustomDesign, User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { makeReference } from "../utils/codes.js";
import { toDesignDTO } from "../dto/index.js";
import { mailService } from "./mail.service.js";
import type { DesignInput } from "../validators/misc.validator.js";

export const designService = {
  async create(userId: string, input: DesignInput) {
    const user = await User.findById(userId).lean();
    if (!user) throw ApiError.unauthorized();
    const d = await CustomDesign.create({ ...input, requestNumber: makeReference("CD"), user: user._id, name: user.name, email: user.email });
    const dto = toDesignDTO(d.toObject());
    await mailService.designRequested(dto);
    return dto;
  },
  async listMine(userId: string) {
    return (await CustomDesign.find({ user: userId }).sort({ createdAt: -1 }).lean()).map(toDesignDTO);
  },
  async list(status?: string) {
    return (await CustomDesign.find(status ? { status: status as never } : {}).sort({ createdAt: -1 }).limit(200).lean()).map(toDesignDTO);
  },
  async update(id: string, input: { status: string; quotedPrice?: number | null; adminNote: string; notify: boolean }) {
    const { notify, ...rest } = input;
    const d = await CustomDesign.findByIdAndUpdate(id, rest, { returnDocument: "after", runValidators: true }).lean();
    if (!d) throw ApiError.notFound("Request not found");
    const dto = toDesignDTO(d);
    if (notify) await mailService.designUpdated(dto);
    return dto;
  },
};
