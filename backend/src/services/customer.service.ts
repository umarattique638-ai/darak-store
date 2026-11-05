import { Types } from "mongoose";
import { Order, Product, User } from "../models/index.js";
import { ApiError } from "../utils/ApiError.js";
import { toPublicProductDTO, toUserDTO } from "../dto/index.js";
import type { AddressInput } from "../validators/order.validator.js";

export const customerService = {
  async updateProfile(userId: string, input: { name: string; phone?: string; locale?: "en" | "ar" }) {
    const u = await User.findByIdAndUpdate(userId, { name: input.name, phone: input.phone ?? "", ...(input.locale ? { locale: input.locale } : {}) }, { returnDocument: "after" }).lean();
    if (!u) throw ApiError.notFound("User not found");
    return toUserDTO(u);
  },

  /* addresses */
  async addAddress(userId: string, a: AddressInput) {
    const u = await User.findById(userId);
    if (!u) throw ApiError.notFound("User not found");
    if (u.addresses.length >= 10) throw ApiError.badRequest("You can save up to 10 addresses");
    if (a.isDefault || u.addresses.length === 0) u.addresses.forEach((x) => (x.isDefault = false));
    u.addresses.push({ ...a, isDefault: a.isDefault || u.addresses.length === 0 });
    await u.save();
    return toUserDTO(u.toObject());
  },
  async updateAddress(userId: string, addressId: string, a: AddressInput) {
    const u = await User.findById(userId);
    const addr = u?.addresses.id(addressId);
    if (!u || !addr) throw ApiError.notFound("Address not found");
    if (a.isDefault) u.addresses.forEach((x) => (x.isDefault = false));
    addr.set(a);
    await u.save();
    return toUserDTO(u.toObject());
  },
  async deleteAddress(userId: string, addressId: string) {
    const u = await User.findById(userId);
    const addr = u?.addresses.id(addressId);
    if (!u || !addr) throw ApiError.notFound("Address not found");
    addr.deleteOne();
    if (u.addresses.length && !u.addresses.some((x) => x.isDefault)) u.addresses[0]!.isDefault = true;
    await u.save();
    return toUserDTO(u.toObject());
  },

  /* wishlist */
  async wishlist(userId: string) {
    const u = await User.findById(userId).select("wishlist").lean();
    const products = await Product.find({ _id: { $in: u?.wishlist ?? [] }, active: true }).populate("category", "name slug").lean();
    return products.map(toPublicProductDTO);
  },
  async toggleWishlist(userId: string, productId: string) {
    if (!(await Product.exists({ _id: productId, active: true }))) throw ApiError.notFound("Product not found");
    const u = await User.findById(userId).select("wishlist");
    if (!u) throw ApiError.unauthorized();
    const pid = new Types.ObjectId(productId);
    const has = u.wishlist.some((w) => w.equals(pid));
    await User.updateOne({ _id: userId }, has ? { $pull: { wishlist: pid } } : { $addToSet: { wishlist: pid } });
    const fresh = await User.findById(userId).select("wishlist").lean();
    return { inWishlist: !has, ids: (fresh?.wishlist ?? []).map(String) };
  },
  async wishlistIds(userId: string) {
    const u = await User.findById(userId).select("wishlist").lean();
    return (u?.wishlist ?? []).map(String);
  },

  /* admin */
  async list(q: { q?: string; role?: string; page?: number }) {
    const filter: Record<string, unknown> = {};
    if (q.role) filter.role = q.role;
    if (q.q) {
      const rx = new RegExp(q.q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").slice(0, 60), "i");
      filter.$or = [{ name: rx }, { email: rx }, { phone: rx }];
    }
    const page = Math.max(1, q.page ?? 1);
    const [users, total] = await Promise.all([User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * 30).limit(30).lean(), User.countDocuments(filter)]);
    const stats = await Order.aggregate<{ _id: Types.ObjectId; orders: number; spent: number }>([
      { $match: { user: { $in: users.map((u) => u._id) }, status: { $ne: "cancelled" } } },
      { $group: { _id: "$user", orders: { $sum: 1 }, spent: { $sum: "$total" } } },
    ]);
    const map = new Map(stats.map((s) => [String(s._id), s]));
    return {
      items: users.map((u) => ({ ...toUserDTO(u), orders: map.get(String(u._id))?.orders ?? 0, spent: map.get(String(u._id))?.spent ?? 0 })),
      total, page, pages: Math.max(1, Math.ceil(total / 30)),
    };
  },
  async adminUpdate(actorId: string, id: string, input: { blocked?: boolean; role?: "customer" | "staff" | "admin" }) {
    if (actorId === id) throw ApiError.badRequest("You can't change your own account here");
    const u = await User.findByIdAndUpdate(id, input, { returnDocument: "after" }).lean();
    if (!u) throw ApiError.notFound("User not found");
    return toUserDTO(u);
  },
};
