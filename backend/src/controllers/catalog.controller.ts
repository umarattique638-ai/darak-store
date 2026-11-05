import type { Request, Response } from "express";
import { catalogService } from "../services/catalog.service.js";
import { ok, created } from "../utils/response.js";

type IdReq = Request<{ id: string }>;
const s = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const n = (v: unknown) => (typeof v === "string" && v !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined);

export const catalogController = {
  async categories(req: Request, res: Response) {
    ok(res, { categories: await catalogService.listCategories(req.query.all === "1" && !!req.auth && req.auth.role !== "customer") });
  },
  async createCategory(req: Request, res: Response) {
    created(res, { category: await catalogService.createCategory(req.body) });
  },
  async updateCategory(req: IdReq, res: Response) {
    ok(res, { category: await catalogService.updateCategory(req.params.id, req.body) });
  },
  async deleteCategory(req: IdReq, res: Response) {
    await catalogService.deleteCategory(req.params.id);
    ok(res, { deleted: true });
  },

  /** Public listing (filters via query string). `admin=1` is honoured only for staff. */
  async products(req: Request, res: Response) {
    const admin = req.query.admin === "1" && !!req.auth && req.auth.role !== "customer";
    ok(res, await catalogService.listProducts({
      admin, q: s(req.query.q), category: s(req.query.category), material: s(req.query.material),
      minPrice: n(req.query.minPrice), maxPrice: n(req.query.maxPrice), inStock: req.query.inStock === "1",
      featured: req.query.featured === "1", onSale: req.query.onSale === "1", lowStock: admin && req.query.lowStock === "1",
      sort: s(req.query.sort), page: n(req.query.page), limit: n(req.query.limit),
    }));
  },
  async productBySlug(req: Request<{ slug: string }>, res: Response) {
    ok(res, await catalogService.getBySlug(req.params.slug));
  },
  async productById(req: IdReq, res: Response) {
    ok(res, { product: await catalogService.getById(req.params.id) });
  },
  async createProduct(req: Request, res: Response) {
    created(res, { product: await catalogService.createProduct(req.body, req.auth!.userId) });
  },
  async updateProduct(req: IdReq, res: Response) {
    ok(res, { product: await catalogService.updateProduct(req.params.id, req.body, req.auth!.userId) });
  },
  async deleteProduct(req: IdReq, res: Response) {
    await catalogService.deleteProduct(req.params.id);
    ok(res, { archived: true });
  },
  async adjustStock(req: IdReq, res: Response) {
    ok(res, { product: await catalogService.adjustStock(req.params.id, req.body.change, req.body.reason, req.body.note, req.auth!.userId) });
  },
  async stockHistory(req: IdReq, res: Response) {
    ok(res, { movements: await catalogService.stockHistory(req.params.id) });
  },
};
