import type { Request, Response } from "express";
import { orderService } from "../services/order.service.js";
import { ok, created } from "../utils/response.js";

export const orderController = {
  /** POST /orders/quote — server-side prices, stock check and shipping for the cart. */
  async quote(req: Request, res: Response) {
    const q = await orderService.quote(req.body.items);
    ok(res, { ...q, lines: q.lines.map((l) => ({ ...l, product: String(l.product) })) });
  },
  async checkout(req: Request, res: Response) {
    created(res, { order: await orderService.checkout(req.auth!.userId, req.body) });
  },
  async mine(req: Request, res: Response) {
    ok(res, { orders: await orderService.listMine(req.auth!.userId) });
  },
  async mineOne(req: Request<{ number: string }>, res: Response) {
    ok(res, { order: await orderService.getMine(req.auth!.userId, req.params.number) });
  },
  async cancelMine(req: Request<{ number: string }>, res: Response) {
    ok(res, { order: await orderService.cancelMine(req.auth!.userId, req.params.number) });
  },
  async track(req: Request, res: Response) {
    ok(res, { order: await orderService.track(req.body.orderNumber, req.body.email) });
  },
  async list(req: Request, res: Response) {
    const s = (v: unknown) => (typeof v === "string" && v ? v : undefined);
    ok(res, await orderService.list({ status: s(req.query.status), q: s(req.query.q), page: Number(req.query.page) || 1 }));
  },
  async get(req: Request<{ id: string }>, res: Response) {
    ok(res, { order: await orderService.get(req.params.id) });
  },
  async setStatus(req: Request<{ id: string }>, res: Response) {
    ok(res, { order: await orderService.setStatus(req.params.id, req.body, req.auth!.userId) });
  },
};
