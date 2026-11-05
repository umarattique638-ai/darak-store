import { Types } from "mongoose";
import { Category, Product, StockMovement, type CategoryDoc } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { slugify } from "../utils/slugify.js";
import { escapeRegex } from "../utils/codes.js";
import { toCategoryDTO, toProductDTO, toPublicProductDTO } from "../dto/index.js";
import type { CategoryInput, ProductInput } from "../validators/catalog.validator.js";

const SORTS: Record<string, Record<string, 1 | -1>> = {
  newest: { createdAt: -1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  popular: { sold: -1, createdAt: -1 },
};

export interface ProductQuery {
  q?: string;
  category?: string;
  material?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  admin?: boolean;
  lowStock?: boolean;
}

async function uniqueSlug(model: typeof Product | typeof Category, base: string, excludeId?: string) {
  const root = slugify(base) || "item";
  let slug = root;
  for (let i = 2; await (model as typeof Product).exists({ slug, ...(excludeId ? { _id: { $ne: new Types.ObjectId(excludeId) } } : {}) }); i++) slug = `${root}-${i}`;
  return slug;
}

export const catalogService = {
  /* ───────── categories ───────── */
  async listCategories(includeInactive = false) {
    const cats = await Category.find(includeInactive ? {} : { active: true }).sort({ order: 1, "name.en": 1 }).lean();
    const counts = await Product.aggregate<{ _id: Types.ObjectId; n: number }>([
      { $match: includeInactive ? {} : { active: true } },
      { $group: { _id: "$category", n: { $sum: 1 } } },
    ]);
    const map = new Map(counts.map((c) => [String(c._id), c.n]));
    return cats.map((c) => toCategoryDTO({ ...c, productCount: map.get(String(c._id)) ?? 0 }));
  },

  async createCategory(input: CategoryInput) {
    const slug = await uniqueSlug(Category, input.slug || input.name.en);
    return toCategoryDTO(await Category.create({ ...input, slug }));
  },

  async updateCategory(id: string, input: Partial<CategoryInput>) {
    const update: Partial<CategoryDoc> & Record<string, unknown> = { ...input };
    if (input.slug !== undefined || input.name) update.slug = await uniqueSlug(Category, input.slug || input.name?.en || "", id);
    const cat = await Category.findByIdAndUpdate(id, update, { returnDocument: "after", runValidators: true }).lean();
    if (!cat) throw ApiError.notFound("Category not found");
    return toCategoryDTO(cat);
  },

  async deleteCategory(id: string) {
    if (await Product.exists({ category: new Types.ObjectId(id) })) throw ApiError.conflict("Move or delete this category's products first");
    const res = await Category.findByIdAndDelete(id);
    if (!res) throw ApiError.notFound("Category not found");
  },

  /* ───────── products ───────── */
  async listProducts(q: ProductQuery) {
    const filter: Record<string, unknown> = {};
    if (!q.admin) filter.active = true;
    if (q.q) {
      const rx = new RegExp(escapeRegex(q.q.slice(0, 60)), "i");
      filter.$or = [{ "name.en": rx }, { "name.ar": rx }, { sku: rx }];
    }
    if (q.category) {
      const cat = /^[a-f0-9]{24}$/.test(q.category) ? { _id: q.category } : { slug: q.category };
      const c = await Category.findOne(cat).select("_id").lean();
      filter.category = c?._id ?? new Types.ObjectId();
    }
    if (q.material) filter.materials = q.material;
    if (q.minPrice != null || q.maxPrice != null) filter.price = { ...(q.minPrice != null ? { $gte: q.minPrice } : {}), ...(q.maxPrice != null ? { $lte: q.maxPrice } : {}) };
    if (q.inStock) filter.stock = { $gt: 0 };
    if (q.featured) filter.featured = true;
    if (q.onSale) filter.compareAtPrice = { $ne: null };
    if (q.lowStock) {
      // portable "stock <= lowStockThreshold" (no $expr needed)
      const low = await Product.find({ stock: { $lte: 1000 } }).select("stock lowStockThreshold").lean();
      filter._id = { $in: low.filter((p) => p.stock <= (p.lowStockThreshold ?? 3)).map((p) => p._id) };
    }

    const limit = Math.min(60, Math.max(1, q.limit ?? 12));
    const page = Math.max(1, q.page ?? 1);
    const [items, total, priceRange] = await Promise.all([
      Product.find(filter).sort(SORTS[q.sort ?? "newest"] ?? SORTS.newest!).skip((page - 1) * limit).limit(limit).populate("category", "name slug").lean(),
      Product.countDocuments(filter),
      Promise.all([
        Product.findOne(q.admin ? {} : { active: true }).sort({ price: 1 }).select("price").lean(),
        Product.findOne(q.admin ? {} : { active: true }).sort({ price: -1 }).select("price").lean(),
      ]),
    ]);
    return { items: items.map((p) => (q.admin ? toProductDTO(p) : toPublicProductDTO(p))), total, page, pages: Math.max(1, Math.ceil(total / limit)), priceRange: { min: priceRange[0]?.price ?? 0, max: priceRange[1]?.price ?? 0 } };
  },

  async getBySlug(slug: string) {
    const p = await Product.findOne({ slug, active: true }).populate("category", "name slug").lean();
    if (!p) throw ApiError.notFound("Product not found");
    const related = await Product.find({ category: p.category, _id: { $ne: p._id }, active: true }).sort({ sold: -1 }).limit(4).populate("category", "name slug").lean();
    return { product: toPublicProductDTO(p), related: related.map(toPublicProductDTO) };
  },

  async getById(id: string) {
    const p = await Product.findById(id).populate("category", "name slug").lean();
    if (!p) throw ApiError.notFound("Product not found");
    return toProductDTO(p);
  },

  async createProduct(input: ProductInput, by: string) {
    if (!(await Category.exists({ _id: input.category }))) throw ApiError.badRequest("Category not found");
    if (await Product.exists({ sku: input.sku })) throw ApiError.conflict("A product with this SKU already exists");
    const slug = await uniqueSlug(Product, input.slug || input.name.en);
    const p = await Product.create({ ...input, slug });
    if (input.stock > 0) await StockMovement.create({ product: p._id, change: input.stock, stockAfter: input.stock, reason: "restock", note: "Initial stock", by });
    return this.getById(String(p._id));
  },

  async updateProduct(id: string, input: Partial<ProductInput>, by: string) {
    const current = await Product.findById(id);
    if (!current) throw ApiError.notFound("Product not found");
    if (input.category && !(await Category.exists({ _id: input.category }))) throw ApiError.badRequest("Category not found");
    if (input.sku && input.sku !== current.sku && (await Product.exists({ sku: input.sku }))) throw ApiError.conflict("A product with this SKU already exists");
    const update: Record<string, unknown> = { ...input };
    if (input.slug !== undefined || input.name) update.slug = await uniqueSlug(Product, input.slug || input.name?.en || current.name.en, id);
    // stock changes from the edit form are logged as adjustments
    if (input.stock !== undefined && input.stock !== current.stock) {
      await StockMovement.create({ product: current._id, change: input.stock - current.stock, stockAfter: input.stock, reason: "adjustment", note: "Edited in product form", by });
    }
    await Product.updateOne({ _id: id }, update, { runValidators: true });
    return this.getById(id);
  },

  async deleteProduct(id: string) {
    // soft delete keeps historic orders/links intact
    const res = await Product.findByIdAndUpdate(id, { active: false, featured: false });
    if (!res) throw ApiError.notFound("Product not found");
  },

  async adjustStock(id: string, change: number, reason: "restock" | "adjustment" | "return", note: string, by: string) {
    const p = await Product.findOneAndUpdate(
      { _id: id, ...(change < 0 ? { stock: { $gte: -change } } : {}) },
      { $inc: { stock: change } },
      { returnDocument: "after" },
    );
    if (!p) throw ApiError.badRequest("Stock can't go below zero");
    await StockMovement.create({ product: p._id, change, stockAfter: p.stock, reason, note, by });
    return toProductDTO(await Product.findById(id).populate("category", "name slug").lean());
  },

  async stockHistory(id: string) {
    const rows = await StockMovement.find({ product: id }).sort({ createdAt: -1 }).limit(50).populate("by", "name").populate("order", "orderNumber").lean();
    return rows.map((r) => ({
      id: String(r._id), change: r.change, stockAfter: r.stockAfter, reason: r.reason, note: r.note,
      by: (r.by as unknown as { name?: string })?.name ?? "", orderNumber: (r.order as unknown as { orderNumber?: string })?.orderNumber ?? "",
      createdAt: r.createdAt ? new Date(r.createdAt).toISOString() : null,
    }));
  },
};
