/* eslint-disable @typescript-eslint/no-explicit-any */
/** Maps Mongo documents to the JSON the API returns (never leaks internal fields). */
const id = (d: any) => String(d?._id ?? d?.id ?? "");
const iso = (d: any) => (d ? new Date(d).toISOString() : null);
const t = (v: any) => ({ en: v?.en ?? "", ar: v?.ar || v?.en || "" });

export const toUserDTO = (u: any) => ({
  id: id(u),
  name: u.name,
  email: u.email,
  phone: u.phone ?? "",
  role: u.role,
  emailVerified: !!u.emailVerified,
  locale: u.locale ?? "en",
  addresses: (u.addresses ?? []).map((a: any) => ({ ...a, id: id(a), _id: undefined })),
  wishlistCount: (u.wishlist ?? []).length,
  blocked: !!u.blocked,
  createdAt: iso(u.createdAt),
  lastLoginAt: iso(u.lastLoginAt),
});
export type UserDTO = ReturnType<typeof toUserDTO>;

export const toSessionDTO = (s: any, currentSid?: string) => ({
  id: String(s._id), userAgent: s.userAgent, ip: s.ip, createdAt: iso(s.createdAt), lastUsedAt: iso(s.lastUsedAt), current: s._id === currentSid,
});

export const toCategoryDTO = (c: any) => ({
  id: id(c), name: t(c.name), slug: c.slug, description: t(c.description), image: c.image ?? "", order: c.order ?? 0, active: c.active !== false,
  productCount: c.productCount ?? undefined,
});
export type CategoryDTO = ReturnType<typeof toCategoryDTO>;

export const toProductDTO = (p: any) => {
  const cat = p.category && typeof p.category === "object" && "slug" in p.category ? p.category : null;
  return {
    id: id(p),
    name: t(p.name),
    slug: p.slug,
    sku: p.sku,
    description: t(p.description),
    category: cat ? { id: id(cat), slug: cat.slug, name: t(cat.name) } : { id: String(p.category ?? ""), slug: "", name: { en: "", ar: "" } },
    price: p.price,
    compareAtPrice: p.compareAtPrice ?? null,
    images: (p.images ?? []).map((i: any) => ({ url: i.url, alt: i.alt ?? "" })),
    materials: p.materials ?? [],
    colors: (p.colors ?? []).map((c: any) => ({ name: c.name, hex: c.hex })),
    dimensions: { width: p.dimensions?.width ?? 0, depth: p.dimensions?.depth ?? 0, height: p.dimensions?.height ?? 0 },
    stock: p.stock,
    inStock: p.stock > 0,
    lowStock: p.stock > 0 && p.stock <= (p.lowStockThreshold ?? 3),
    lowStockThreshold: p.lowStockThreshold ?? 3,
    featured: !!p.featured,
    active: p.active !== false,
    sold: p.sold ?? 0,
    createdAt: iso(p.createdAt),
    updatedAt: iso(p.updatedAt),
  };
};
export type ProductDTO = ReturnType<typeof toProductDTO>;

/** Public storefront view hides exact stock and internal counters. */
export const toPublicProductDTO = (p: any) => {
  const { sold: _s, lowStockThreshold: _l, stock, ...rest } = toProductDTO(p);
  return { ...rest, stock: Math.min(stock, 10) };
};

export const toOrderDTO = (o: any) => ({
  id: id(o),
  orderNumber: o.orderNumber,
  email: o.email,
  customer: o.user && typeof o.user === "object" && "email" in o.user ? { id: id(o.user), name: o.user.name, email: o.user.email } : null,
  items: (o.items ?? []).map((i: any) => ({ ...i, product: String(i.product) })),
  shippingAddress: o.shippingAddress ?? {},
  currency: o.currency,
  subtotal: o.subtotal,
  shippingFee: o.shippingFee,
  total: o.total,
  paymentMethod: o.paymentMethod,
  paymentStatus: o.paymentStatus,
  status: o.status,
  timeline: (o.timeline ?? []).map((x: any) => ({ status: x.status, note: x.note ?? "", at: iso(x.at) })),
  trackingNumber: o.trackingNumber ?? "",
  courier: o.courier ?? "",
  customerNote: o.customerNote ?? "",
  createdAt: iso(o.createdAt),
  updatedAt: iso(o.updatedAt),
});
export type OrderDTO = ReturnType<typeof toOrderDTO>;

/** Public tracking: no email/address details beyond the city. */
export const toTrackingDTO = (o: any) => {
  const d = toOrderDTO(o);
  return {
    orderNumber: d.orderNumber, status: d.status, paymentMethod: d.paymentMethod, paymentStatus: d.paymentStatus, total: d.total, currency: d.currency,
    timeline: d.timeline, trackingNumber: d.trackingNumber, courier: d.courier, city: d.shippingAddress?.city ?? "", createdAt: d.createdAt,
    items: d.items.map((i: any) => ({ name: i.name, nameAr: i.nameAr, image: i.image, quantity: i.quantity })),
  };
};

export const toDesignDTO = (d: any) => ({
  id: id(d), requestNumber: d.requestNumber, name: d.name, email: d.email, phone: d.phone, furnitureType: d.furnitureType,
  dimensions: d.dimensions ?? {}, material: d.material, color: d.color, quantity: d.quantity, budget: d.budget, deadline: iso(d.deadline),
  description: d.description, referenceImages: d.referenceImages ?? [], status: d.status, quotedPrice: d.quotedPrice ?? null,
  adminNote: d.adminNote ?? "", createdAt: iso(d.createdAt), updatedAt: iso(d.updatedAt),
});
export type DesignDTO = ReturnType<typeof toDesignDTO>;

export const toLeadDTO = (l: any) => ({
  id: id(l), name: l.name, email: l.email, phone: l.phone ?? "", subject: l.subject ?? "", message: l.message, status: l.status, createdAt: iso(l.createdAt),
});
export type LeadDTO = ReturnType<typeof toLeadDTO>;
