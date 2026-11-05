import { Types } from "mongoose";
import { env } from "../config/env.js";
import { Order, Product, StockMovement, User, type OrderStatus } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { makeReference, money } from "../utils/codes.js";
import { toOrderDTO, toTrackingDTO } from "../dto/index.js";
import { mailService } from "./mail.service.js";
import type { CartItemInput, CheckoutInput } from "../validators/order.validator.js";

/** Allowed status transitions (prevents e.g. delivered → pending). */
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "shipped", "cancelled"],
  processing: ["shipped", "cancelled"],
  shipped: ["delivered"],
  delivered: [],
  cancelled: [],
};

/** Prices always come from the database — never from the browser. */
async function priceCart(items: CartItemInput[]) {
  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: ids }, active: true }).lean();
  const byId = new Map(products.map((p) => [String(p._id), p]));
  const lines = [];
  const problems: { productId: string; message: string; available?: number }[] = [];
  for (const it of items) {
    const p = byId.get(it.productId);
    if (!p) { problems.push({ productId: it.productId, message: "This product is no longer available" }); continue; }
    const wanted = items.filter((x) => x.productId === it.productId).reduce((s, x) => s + x.quantity, 0);
    if (p.stock < wanted) problems.push({ productId: it.productId, message: p.stock === 0 ? "Out of stock" : `Only ${p.stock} left in stock`, available: p.stock });
    if (it.color && p.colors?.length && !p.colors.some((c) => c.name === it.color)) problems.push({ productId: it.productId, message: "Selected colour is not available" });
    lines.push({
      product: p._id, name: p.name.en, nameAr: p.name.ar || p.name.en, sku: p.sku, image: p.images?.[0]?.url ?? "", color: it.color,
      unitPrice: p.price, quantity: it.quantity, lineTotal: money(p.price * it.quantity), slug: p.slug, stock: p.stock,
    });
  }
  const subtotal = money(lines.reduce((s, l) => s + l.lineTotal, 0));
  const shippingFee = subtotal === 0 || subtotal >= env.FREE_SHIPPING_OVER ? 0 : env.SHIPPING_FLAT;
  return { lines, problems, subtotal, shippingFee, total: money(subtotal + shippingFee) };
}

/** Atomically reserves stock; rolls back already-reserved lines if any line fails. */
async function reserveStock(lines: { product: Types.ObjectId; quantity: number }[]) {
  const done: typeof lines = [];
  for (const l of lines) {
    const res = await Product.updateOne({ _id: l.product, active: true, stock: { $gte: l.quantity } }, { $inc: { stock: -l.quantity, sold: l.quantity } });
    if (res.modifiedCount !== 1) {
      for (const d of done) await Product.updateOne({ _id: d.product }, { $inc: { stock: d.quantity, sold: -d.quantity } });
      throw new ApiError(409, "Some items just went out of stock — please review your cart", "OUT_OF_STOCK");
    }
    done.push(l);
  }
}

async function logMovements(orderId: Types.ObjectId, lines: { product: Types.ObjectId; quantity: number }[], sign: 1 | -1, reason: "order" | "order_cancelled", by?: string) {
  const prods = await Product.find({ _id: { $in: lines.map((l) => l.product) } }).select("stock name sku lowStockThreshold").lean();
  const stock = new Map(prods.map((p) => [String(p._id), p]));
  await StockMovement.insertMany(lines.map((l) => ({ product: l.product, change: sign * l.quantity, stockAfter: stock.get(String(l.product))?.stock ?? 0, reason, order: orderId, by: by ?? null })));
  return prods;
}

export const orderService = {
  quote: priceCart,

  async checkout(userId: string, input: CheckoutInput) {
    const user = await User.findById(userId);
    if (!user) throw ApiError.unauthorized();
    if (!user.emailVerified) throw ApiError.forbidden("Please verify your email before ordering");

    const cart = await priceCart(input.items);
    if (cart.problems.length) throw new ApiError(409, cart.problems[0]!.message, "CART_INVALID", cart.problems);

    // merge identical product lines for stock reservation
    const qty = new Map<string, { product: Types.ObjectId; quantity: number }>();
    for (const l of cart.lines) {
      const k = String(l.product);
      qty.set(k, { product: l.product as Types.ObjectId, quantity: (qty.get(k)?.quantity ?? 0) + l.quantity });
    }
    const reserve = [...qty.values()];
    await reserveStock(reserve);

    let order;
    try {
      order = await Order.create({
        orderNumber: makeReference("DRK"),
        user: user._id,
        email: user.email,
        items: cart.lines.map(({ slug: _s, stock: _st, ...l }) => l),
        shippingAddress: input.shippingAddress,
        currency: env.CURRENCY,
        subtotal: cart.subtotal,
        shippingFee: cart.shippingFee,
        total: cart.total,
        paymentMethod: input.paymentMethod,
        paymentStatus: input.paymentMethod === "bank_transfer" ? "awaiting_transfer" : "unpaid",
        status: "pending",
        timeline: [{ status: "pending", note: "Order placed" }],
        customerNote: input.customerNote,
      });
    } catch (e) {
      for (const r of reserve) await Product.updateOne({ _id: r.product }, { $inc: { stock: r.quantity, sold: -r.quantity } });
      throw e;
    }

    const prods = await logMovements(order._id, reserve, -1, "order");
    if (input.saveAddress && !user.addresses.some((a) => a.street === input.shippingAddress.street && a.city === input.shippingAddress.city)) {
      user.addresses.push({ ...input.shippingAddress, label: "Home", isDefault: user.addresses.length === 0 });
      await user.save();
    }

    const dto = toOrderDTO(order.toObject());
    await Promise.allSettled([
      mailService.orderPlaced(dto, user.name),
      mailService.lowStock(prods.filter((p) => p.stock <= (p.lowStockThreshold ?? 3)).map((p) => ({ name: p.name.en, sku: p.sku, stock: p.stock }))),
    ]);
    return dto;
  },

  async listMine(userId: string) {
    const orders = await Order.find({ user: userId }).sort({ createdAt: -1 }).limit(100).lean();
    return orders.map(toOrderDTO);
  },

  async getMine(userId: string, orderNumber: string) {
    const o = await Order.findOne({ user: userId, orderNumber }).lean();
    if (!o) throw ApiError.notFound("Order not found");
    return toOrderDTO(o);
  },

  /** Customer may cancel only while the order is still pending. */
  async cancelMine(userId: string, orderNumber: string) {
    const o = await Order.findOne({ user: userId, orderNumber });
    if (!o) throw ApiError.notFound("Order not found");
    if (o.status !== "pending") throw ApiError.badRequest("This order can no longer be cancelled — please contact us");
    return this.setStatus(String(o._id), { status: "cancelled", note: "Cancelled by customer" });
  },

  /** Public tracking needs both order number AND the email used — no enumeration. */
  async track(orderNumber: string, email: string) {
    const o = await Order.findOne({ orderNumber, email }).lean();
    if (!o) throw ApiError.notFound("We couldn't find an order with that number and email");
    return toTrackingDTO(o);
  },

  /* ───────── admin ───────── */
  async list(q: { status?: string; q?: string; page?: number; limit?: number }) {
    const filter: Record<string, unknown> = {};
    if (q.status) filter.status = q.status;
    if (q.q) {
      const rx = new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60), "i");
      filter.$or = [{ orderNumber: rx }, { email: rx }, { "shippingAddress.fullName": rx }, { "shippingAddress.phone": rx }];
    }
    const limit = Math.min(100, q.limit ?? 20);
    const page = Math.max(1, q.page ?? 1);
    const [items, total] = await Promise.all([
      Order.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate("user", "name email").lean(),
      Order.countDocuments(filter),
    ]);
    return { items: items.map(toOrderDTO), total, page, pages: Math.max(1, Math.ceil(total / limit)) };
  },

  async get(id: string) {
    const o = await Order.findById(id).populate("user", "name email").lean();
    if (!o) throw ApiError.notFound("Order not found");
    return toOrderDTO(o);
  },

  async setStatus(id: string, input: { status: OrderStatus; note?: string; trackingNumber?: string; courier?: string; paymentStatus?: string }, by?: string) {
    const o = await Order.findById(id);
    if (!o) throw ApiError.notFound("Order not found");
    const statusChanged = input.status !== o.status;
    if (statusChanged && !NEXT[o.status as OrderStatus].includes(input.status)) {
      throw ApiError.badRequest(`Can't change an order from "${o.status}" to "${input.status}"`);
    }
    if (input.trackingNumber !== undefined) o.trackingNumber = input.trackingNumber;
    if (input.courier !== undefined) o.courier = input.courier;
    if (input.paymentStatus) o.paymentStatus = input.paymentStatus as typeof o.paymentStatus;
    if (statusChanged) {
      o.status = input.status;
      o.timeline.push({ status: input.status, note: input.note ?? "", at: new Date(), by: by ? new Types.ObjectId(by) : null });
      if (input.status === "delivered" && o.paymentMethod === "cod") o.paymentStatus = "paid";
      // cancelled orders give their stock back (once)
      if (input.status === "cancelled" && !o.stockRestored) {
        const lines = o.items.map((i) => ({ product: i.product as Types.ObjectId, quantity: i.quantity }));
        for (const l of lines) await Product.updateOne({ _id: l.product }, { $inc: { stock: l.quantity, sold: -l.quantity } });
        await logMovements(o._id, lines, 1, "order_cancelled", by);
        o.stockRestored = true;
      }
    }
    await o.save();
    const dto = toOrderDTO((await Order.findById(id).populate("user", "name email").lean())!);
    if (statusChanged) {
      const user = await User.findById(o.user).select("name").lean();
      await mailService.orderStatus(dto, user?.name ?? "there").catch(() => undefined);
    }
    return dto;
  },
};
