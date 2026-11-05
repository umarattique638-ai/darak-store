import { Lead, LEAD_STATUS } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { toLeadDTO } from "../dto/index.js";
import { mailService } from "./mail.service.js";

export const leadService = {
  async create(input: { name: string; email: string; phone?: string; subject?: string; message: string }, ip: string) {
    const lead = await Lead.create({ ...input, ip });
    const dto = toLeadDTO(lead.toObject());
    await mailService.leadReceived(dto);
    return dto;
  },
  async list(status?: (typeof LEAD_STATUS)[number]) {
    return (await Lead.find(status ? { status } : {}).sort({ createdAt: -1 }).limit(200).lean()).map(toLeadDTO);
  },
  async setStatus(id: string, status: (typeof LEAD_STATUS)[number]) {
    const l = await Lead.findByIdAndUpdate(id, { status }, { returnDocument: "after" }).lean();
    if (!l) throw ApiError.notFound("Message not found");
    return toLeadDTO(l);
  },
  async remove(id: string) {
    if (!(await Lead.findByIdAndDelete(id))) throw ApiError.notFound("Message not found");
  },
};
