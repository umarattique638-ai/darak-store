import type { Request, Response } from "express";
import { customerService } from "../services/customer.service.js";
import { designService } from "../services/design.service.js";
import { leadService } from "../services/lead.service.js";
import { dashboardService } from "../services/dashboard.service.js";
import { ok } from "../utils/response.js";
import { clientMeta } from "../utils/request.js";
import { created } from "../utils/response.js";

type P = Request<{ id: string }>;
const s = (v: unknown) => (typeof v === "string" && v ? v : undefined);

export const adminController = {
  async stats(_req: Request, res: Response) {
    ok(res, await dashboardService.stats());
  },
  async customers(req: Request, res: Response) {
    ok(res, await customerService.list({ q: s(req.query.q), role: s(req.query.role), page: Number(req.query.page) || 1 }));
  },
  async updateCustomer(req: P, res: Response) {
    ok(res, { user: await customerService.adminUpdate(req.auth!.userId, req.params.id, req.body) });
  },
  async designs(req: Request, res: Response) {
    ok(res, { designs: await designService.list(s(req.query.status)) });
  },
  async updateDesign(req: P, res: Response) {
    ok(res, { design: await designService.update(req.params.id, req.body) });
  },
  async leads(req: Request, res: Response) {
    ok(res, { leads: await leadService.list(s(req.query.status) as never) });
  },
  async updateLead(req: P, res: Response) {
    ok(res, { lead: await leadService.setStatus(req.params.id, req.body.status) });
  },
  async deleteLead(req: P, res: Response) {
    await leadService.remove(req.params.id);
    ok(res, { deleted: true });
  },
  /** public: POST /contact */
  async contact(req: Request, res: Response) {
    const { website: _hp, ...input } = req.body;
    await leadService.create(input, clientMeta(req).ip);
    created(res, { received: true });
  },
};
