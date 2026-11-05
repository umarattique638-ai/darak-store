/** Shapes returned by the Express API (mirrors backend/src/dto). */
export type Locale = "en" | "ar";
export interface I18nText { en: string; ar: string }
export type Role = "customer" | "staff" | "admin";

export interface Address {
  id: string; label: string; fullName: string; phone: string; city: string; area: string; street: string; building: string; notes: string; isDefault: boolean;
}
export interface UserDTO {
  id: string; name: string; email: string; phone: string; role: Role; emailVerified: boolean; locale: Locale;
  addresses: Address[]; wishlistCount: number; blocked: boolean; createdAt: string | null; lastLoginAt: string | null;
}
export interface CustomerRow extends UserDTO { orders: number; spent: number }
export interface SessionDTO { id: string; userAgent: string; ip: string; createdAt: string | null; lastUsedAt: string | null; current: boolean }

export interface CategoryDTO { id: string; name: I18nText; slug: string; description: I18nText; image: string; order: number; active: boolean; productCount?: number }

export interface ProductDTO {
  id: string; name: I18nText; slug: string; sku: string; description: I18nText;
  category: { id: string; slug: string; name: I18nText };
  price: number; compareAtPrice: number | null; images: { url: string; alt: string }[];
  materials: string[]; colors: { name: string; hex: string }[];
  dimensions: { width: number; depth: number; height: number };
  stock: number; inStock: boolean; lowStock: boolean; lowStockThreshold?: number; featured: boolean; active: boolean; sold?: number;
  createdAt: string | null; updatedAt: string | null;
}
export interface ProductList { items: ProductDTO[]; total: number; page: number; pages: number; priceRange: { min: number; max: number } }

export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentMethod = "cod" | "bank_transfer";
export type PaymentStatus = "unpaid" | "awaiting_transfer" | "paid" | "refunded";
export interface OrderItem { product: string; name: string; nameAr: string; sku: string; image: string; color: string; unitPrice: number; quantity: number; lineTotal: number }
export interface ShippingAddress { fullName: string; phone: string; city: string; area: string; street: string; building: string; notes: string }
export interface OrderDTO {
  id: string; orderNumber: string; email: string; customer: { id: string; name: string; email: string } | null;
  items: OrderItem[]; shippingAddress: ShippingAddress; currency: string; subtotal: number; shippingFee: number; total: number;
  paymentMethod: PaymentMethod; paymentStatus: PaymentStatus; status: OrderStatus;
  timeline: { status: OrderStatus; note: string; at: string | null }[]; trackingNumber: string; courier: string; customerNote: string;
  createdAt: string | null; updatedAt: string | null;
}
export interface TrackingDTO {
  orderNumber: string; status: OrderStatus; paymentMethod: PaymentMethod; paymentStatus: PaymentStatus; total: number; currency: string;
  timeline: { status: OrderStatus; note: string; at: string | null }[]; trackingNumber: string; courier: string; city: string; createdAt: string | null;
  items: { name: string; nameAr: string; image: string; quantity: number }[];
}
export interface QuoteLine { product: string; name: string; nameAr: string; sku: string; image: string; color: string; unitPrice: number; quantity: number; lineTotal: number; slug: string; stock: number }
export interface Quote { lines: QuoteLine[]; problems: { productId: string; message: string; available?: number }[]; subtotal: number; shippingFee: number; total: number }

export type DesignStatus = "new" | "reviewing" | "quoted" | "in_production" | "completed" | "declined";
export interface DesignDTO {
  id: string; requestNumber: string; name: string; email: string; phone: string; furnitureType: string;
  dimensions: { width?: number; depth?: number; height?: number }; material: string; color: string; quantity: number; budget: number;
  deadline: string | null; description: string; referenceImages: string[]; status: DesignStatus; quotedPrice: number | null; adminNote: string;
  createdAt: string | null; updatedAt: string | null;
}
export interface LeadDTO { id: string; name: string; email: string; phone: string; subject: string; message: string; status: "new" | "contacted" | "closed"; createdAt: string | null }
export interface StockMovementDTO { id: string; change: number; stockAfter: number; reason: string; note: string; by: string; orderNumber: string; createdAt: string | null }
export interface StoreSettings { currency: string; shippingFlat: number; freeShippingOver: number; bank: { name: string; accountName: string; iban: string } }
export interface DashboardStats {
  revenue: number; orders: number; ordersByStatus: Partial<Record<OrderStatus, number>>; customers: number; newDesigns: number; newLeads: number; products: number;
  series: { date: string; revenue: number; orders: number }[]; recentOrders: OrderDTO[]; lowStock: ProductDTO[]; topProducts: ProductDTO[];
}
export interface Paginated<T> { items: T[]; total: number; page: number; pages: number }
export interface UploadedImage { url: string; publicId: string; width: number; height: number; format: string; bytes: number }
