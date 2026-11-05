import { CustomDesign, Lead, Order, Product, User } from "../models/index.js";
import { toOrderDTO, toProductDTO } from "../dto/index.js";

export const dashboardService = {
  async stats() {
    const since = new Date(Date.now() - 30 * 86400_000);
    const [revenue, byStatus, last30, recentOrders, lowStock, customers, newDesigns, newLeads, topProducts] = await Promise.all([
      Order.aggregate<{ total: number; count: number }>([{ $match: { status: { $ne: "cancelled" } } }, { $group: { _id: null, total: { $sum: "$total" }, count: { $sum: 1 } } }]),
      Order.aggregate<{ _id: string; n: number }>([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
      Order.find({ createdAt: { $gte: since }, status: { $ne: "cancelled" } }).select("createdAt total").lean(),
      Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "name email").lean(),
      Product.find({ active: true, stock: { $lte: 50 } }).sort({ stock: 1 }).limit(60).populate("category", "name slug").lean(),
      User.countDocuments({ role: "customer" }),
      CustomDesign.countDocuments({ status: "new" }),
      Lead.countDocuments({ status: "new" }),
      Product.find({ sold: { $gt: 0 } }).sort({ sold: -1 }).limit(5).populate("category", "name slug").lean(),
    ]);
    // fill the 30-day series with zeros so the chart has no gaps
    const map = new Map<string, { revenue: number; orders: number }>();
    for (const o of last30) {
      const day = new Date(o.createdAt as Date).toISOString().slice(0, 10);
      const cur = map.get(day) ?? { revenue: 0, orders: 0 };
      map.set(day, { revenue: cur.revenue + o.total, orders: cur.orders + 1 });
    }
    const series = Array.from({ length: 30 }, (_, i) => {
      const day = new Date(Date.now() - (29 - i) * 86400_000).toISOString().slice(0, 10);
      return { date: day, revenue: map.get(day)?.revenue ?? 0, orders: map.get(day)?.orders ?? 0 };
    });
    return {
      revenue: revenue[0]?.total ?? 0,
      orders: await Order.countDocuments({ status: { $ne: "cancelled" } }),
      ordersByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.n])),
      customers,
      newDesigns,
      newLeads,
      products: await Product.countDocuments({ active: true }),
      series,
      recentOrders: recentOrders.map(toOrderDTO),
      lowStock: lowStock.filter((p) => p.stock <= (p.lowStockThreshold ?? 3)).slice(0, 8).map(toProductDTO),
      topProducts: topProducts.map(toProductDTO),
    };
  },
};
