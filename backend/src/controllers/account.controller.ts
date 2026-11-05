import type { Request, Response } from "express";
import { customerService } from "../services/customer.service.js";
import { designService } from "../services/design.service.js";
import { ok, created } from "../utils/response.js";

type P = Request<{ id: string }>;

export const accountController = {
  async updateProfile(req: Request, res: Response) {
    ok(res, { user: await customerService.updateProfile(req.auth!.userId, req.body) });
  },
  async addAddress(req: Request, res: Response) {
    created(res, { user: await customerService.addAddress(req.auth!.userId, req.body) });
  },
  async updateAddress(req: P, res: Response) {
    ok(res, { user: await customerService.updateAddress(req.auth!.userId, req.params.id, req.body) });
  },
  async deleteAddress(req: P, res: Response) {
    ok(res, { user: await customerService.deleteAddress(req.auth!.userId, req.params.id) });
  },
  async wishlist(req: Request, res: Response) {
    ok(res, { products: await customerService.wishlist(req.auth!.userId) });
  },
  async wishlistIds(req: Request, res: Response) {
    ok(res, { ids: await customerService.wishlistIds(req.auth!.userId) });
  },
  async toggleWishlist(req: P, res: Response) {
    ok(res, await customerService.toggleWishlist(req.auth!.userId, req.params.id));
  },
  async createDesign(req: Request, res: Response) {
    created(res, { design: await designService.create(req.auth!.userId, req.body) });
  },
  async myDesigns(req: Request, res: Response) {
    ok(res, { designs: await designService.listMine(req.auth!.userId) });
  },
};
