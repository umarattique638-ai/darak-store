import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from "@reduxjs/toolkit/query/react";
import type {
  Address, CategoryDTO, CustomerRow, DashboardStats, DesignDTO, LeadDTO, OrderDTO, Paginated, ProductDTO, ProductList,
  Quote, SessionDTO, StockMovementDTO, StoreSettings, TrackingDTO, UploadedImage, UserDTO,
} from "@/types/api";
import { loggedOut, setUser } from "./authSlice";

/** Same-origin `/api/*` is proxied by Next.js to Express (cookies included). */
const rawBaseQuery = fetchBaseQuery({ baseUrl: "/api", credentials: "same-origin" });

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  const result = await rawBaseQuery(args, api, extra);
  if (result.data && typeof result.data === "object" && "data" in result.data) return { ...result, data: (result.data as { data: unknown }).data };
  return result;
};

/** On 401: refresh once (shared between parallel requests), retry; otherwise mark signed out. */
let refreshing: Promise<boolean> | null = null;
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extra) => {
  let result = await baseQuery(args, api, extra);
  const url = typeof args === "string" ? args : args.url;
  if (result.error?.status === 401 && (!url.startsWith("/auth/") || url === "/auth/me" || url === "/auth/sessions")) {
    refreshing ??= Promise.resolve(baseQuery({ url: "/auth/refresh", method: "POST" }, api, extra))
      .then((r) => {
        if (r.data) api.dispatch(setUser((r.data as { user: UserDTO }).user));
        return !r.error;
      })
      .finally(() => setTimeout(() => (refreshing = null), 0));
    if (await refreshing) result = await baseQuery(args, api, extra);
    else api.dispatch(loggedOut());
  }
  return result;
};

type Q = Record<string, string | number | boolean | undefined>;
const qs = (q: Q) => new URLSearchParams(Object.entries(q).filter(([, v]) => v !== undefined && v !== "" && v !== false).map(([k, v]) => [k, String(v)])).toString();

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me", "Session", "Category", "Product", "Order", "MyOrder", "Wishlist", "Design", "MyDesign", "Lead", "Customer", "Stats", "Stock"],
  endpoints: (b) => ({
    /* ── auth ── */
    me: b.query<{ user: UserDTO }, void>({ query: () => "/auth/me", providesTags: ["Me"] }),
    login: b.mutation<{ user: UserDTO }, { email: string; password: string }>({ query: (body) => ({ url: "/auth/login", method: "POST", body }), invalidatesTags: ["Me", "Wishlist", "MyOrder"] }),
    register: b.mutation<{ email: string; devCode?: string }, { name: string; email: string; phone?: string; password: string }>({ query: (body) => ({ url: "/auth/register", method: "POST", body }) }),
    verifyEmail: b.mutation<{ user: UserDTO }, { email: string; code: string }>({ query: (body) => ({ url: "/auth/verify-email", method: "POST", body }), invalidatesTags: ["Me"] }),
    resendVerification: b.mutation<{ devCode?: string }, { email: string }>({ query: (body) => ({ url: "/auth/resend-verification", method: "POST", body }) }),
    forgotPassword: b.mutation<{ devCode?: string }, { email: string }>({ query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }) }),
    resetPassword: b.mutation<{ message: string }, { email: string; code: string; password: string }>({ query: (body) => ({ url: "/auth/reset-password", method: "POST", body }) }),
    changePassword: b.mutation<{ message: string }, { currentPassword: string; newPassword: string }>({ query: (body) => ({ url: "/auth/change-password", method: "POST", body }), invalidatesTags: ["Session"] }),
    logout: b.mutation<void, void>({ query: () => ({ url: "/auth/logout", method: "POST" }) }),
    logoutAll: b.mutation<{ revoked: number }, void>({ query: () => ({ url: "/auth/logout-all", method: "POST" }) }),
    sessions: b.query<{ sessions: SessionDTO[] }, void>({ query: () => "/auth/sessions", providesTags: ["Session"] }),
    revokeSession: b.mutation<void, string>({ query: (id) => ({ url: `/auth/sessions/${id}`, method: "DELETE" }), invalidatesTags: ["Session"] }),

    /* ── catalog ── */
    settings: b.query<StoreSettings, void>({ query: () => "/settings" }),
    categories: b.query<{ categories: CategoryDTO[] }, { all?: boolean } | void>({ query: (a) => `/categories${a?.all ? "?all=1" : ""}`, providesTags: ["Category"] }),
    createCategory: b.mutation<{ category: CategoryDTO }, Partial<CategoryDTO>>({ query: (body) => ({ url: "/categories", method: "POST", body }), invalidatesTags: ["Category"] }),
    updateCategory: b.mutation<{ category: CategoryDTO }, { id: string; body: Partial<CategoryDTO> }>({ query: ({ id, body }) => ({ url: `/categories/${id}`, method: "PATCH", body }), invalidatesTags: ["Category", "Product"] }),
    deleteCategory: b.mutation<void, string>({ query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }), invalidatesTags: ["Category"] }),
    products: b.query<ProductList, Q>({ query: (q) => `/products?${qs(q)}`, providesTags: ["Product"] }),
    product: b.query<{ product: ProductDTO }, string>({ query: (id) => `/products/${id}`, providesTags: (_r, _e, id) => [{ type: "Product", id }] }),
    createProduct: b.mutation<{ product: ProductDTO }, Record<string, unknown>>({ query: (body) => ({ url: "/products", method: "POST", body }), invalidatesTags: ["Product", "Stats", "Category"] }),
    updateProduct: b.mutation<{ product: ProductDTO }, { id: string; body: Record<string, unknown> }>({ query: ({ id, body }) => ({ url: `/products/${id}`, method: "PATCH", body }), invalidatesTags: (_r, _e, a) => ["Product", { type: "Product", id: a.id }, "Stats", "Stock"] }),
    deleteProduct: b.mutation<void, string>({ query: (id) => ({ url: `/products/${id}`, method: "DELETE" }), invalidatesTags: ["Product", "Stats"] }),
    adjustStock: b.mutation<{ product: ProductDTO }, { id: string; change: number; reason: string; note?: string }>({ query: ({ id, ...body }) => ({ url: `/products/${id}/stock`, method: "POST", body }), invalidatesTags: ["Product", "Stats", "Stock"] }),
    stockHistory: b.query<{ movements: StockMovementDTO[] }, string>({ query: (id) => `/products/${id}/stock`, providesTags: ["Stock"] }),

    /* ── cart & orders ── */
    quote: b.mutation<Quote, { items: { productId: string; quantity: number; color: string }[] }>({ query: (body) => ({ url: "/orders/quote", method: "POST", body }) }),
    checkout: b.mutation<{ order: OrderDTO }, Record<string, unknown>>({ query: (body) => ({ url: "/orders", method: "POST", body }), invalidatesTags: ["MyOrder", "Me", "Product"] }),
    track: b.mutation<{ order: TrackingDTO }, { orderNumber: string; email: string }>({ query: (body) => ({ url: "/orders/track", method: "POST", body }) }),
    myOrders: b.query<{ orders: OrderDTO[] }, void>({ query: () => "/orders/mine", providesTags: ["MyOrder"] }),
    myOrder: b.query<{ order: OrderDTO }, string>({ query: (n) => `/orders/mine/${encodeURIComponent(n)}`, providesTags: ["MyOrder"] }),
    cancelMyOrder: b.mutation<{ order: OrderDTO }, string>({ query: (n) => ({ url: `/orders/mine/${encodeURIComponent(n)}/cancel`, method: "POST" }), invalidatesTags: ["MyOrder"] }),

    /* ── account ── */
    updateProfile: b.mutation<{ user: UserDTO }, { name: string; phone?: string; locale?: string }>({ query: (body) => ({ url: "/account/profile", method: "PATCH", body }), invalidatesTags: ["Me"] }),
    addAddress: b.mutation<{ user: UserDTO }, Omit<Address, "id">>({ query: (body) => ({ url: "/account/addresses", method: "POST", body }), invalidatesTags: ["Me"] }),
    updateAddress: b.mutation<{ user: UserDTO }, Address>({ query: ({ id, ...body }) => ({ url: `/account/addresses/${id}`, method: "PUT", body }), invalidatesTags: ["Me"] }),
    deleteAddress: b.mutation<{ user: UserDTO }, string>({ query: (id) => ({ url: `/account/addresses/${id}`, method: "DELETE" }), invalidatesTags: ["Me"] }),
    wishlist: b.query<{ products: ProductDTO[] }, void>({ query: () => "/account/wishlist", providesTags: ["Wishlist"] }),
    wishlistIds: b.query<{ ids: string[] }, void>({ query: () => "/account/wishlist/ids", providesTags: ["Wishlist"] }),
    toggleWishlist: b.mutation<{ inWishlist: boolean; ids: string[] }, string>({ query: (id) => ({ url: `/account/wishlist/${id}`, method: "POST" }), invalidatesTags: ["Wishlist"] }),
    myDesigns: b.query<{ designs: DesignDTO[] }, void>({ query: () => "/account/designs", providesTags: ["MyDesign"] }),
    createDesign: b.mutation<{ design: DesignDTO }, Record<string, unknown>>({ query: (body) => ({ url: "/account/designs", method: "POST", body }), invalidatesTags: ["MyDesign"] }),
    uploadImage: b.mutation<{ image: UploadedImage }, { file: File; folder: "products" | "categories" | "designs" | "misc" }>({
      query: ({ file, folder }) => {
        const body = new FormData();
        body.append("image", file);
        return { url: `/uploads/image?folder=${folder}`, method: "POST", body };
      },
    }),
    contact: b.mutation<{ received: boolean }, Record<string, string>>({ query: (body) => ({ url: "/contact", method: "POST", body }) }),

    /* ── admin ── */
    stats: b.query<DashboardStats, void>({ query: () => "/admin/stats", providesTags: ["Stats"] }),
    adminOrders: b.query<Paginated<OrderDTO>, Q>({ query: (q) => `/orders?${qs(q)}`, providesTags: ["Order"] }),
    adminOrder: b.query<{ order: OrderDTO }, string>({ query: (id) => `/orders/${id}`, providesTags: ["Order"] }),
    setOrderStatus: b.mutation<{ order: OrderDTO }, { id: string; status: string; note?: string; trackingNumber?: string; courier?: string; paymentStatus?: string }>({
      query: ({ id, ...body }) => ({ url: `/orders/${id}/status`, method: "PATCH", body }), invalidatesTags: ["Order", "Stats", "Product", "Stock"],
    }),
    customers: b.query<Paginated<CustomerRow>, Q>({ query: (q) => `/admin/customers?${qs(q)}`, providesTags: ["Customer"] }),
    updateCustomer: b.mutation<{ user: UserDTO }, { id: string; blocked?: boolean; role?: string }>({ query: ({ id, ...body }) => ({ url: `/admin/customers/${id}`, method: "PATCH", body }), invalidatesTags: ["Customer"] }),
    designs: b.query<{ designs: DesignDTO[] }, string | void>({ query: (s) => `/admin/designs${s ? `?status=${s}` : ""}`, providesTags: ["Design"] }),
    updateDesign: b.mutation<{ design: DesignDTO }, { id: string; status: string; quotedPrice?: number | null; adminNote: string; notify: boolean }>({ query: ({ id, ...body }) => ({ url: `/admin/designs/${id}`, method: "PATCH", body }), invalidatesTags: ["Design", "Stats"] }),
    leads: b.query<{ leads: LeadDTO[] }, string | void>({ query: (s) => `/admin/leads${s ? `?status=${s}` : ""}`, providesTags: ["Lead"] }),
    updateLead: b.mutation<{ lead: LeadDTO }, { id: string; status: string }>({ query: ({ id, ...body }) => ({ url: `/admin/leads/${id}`, method: "PATCH", body }), invalidatesTags: ["Lead", "Stats"] }),
    deleteLead: b.mutation<void, string>({ query: (id) => ({ url: `/admin/leads/${id}`, method: "DELETE" }), invalidatesTags: ["Lead", "Stats"] }),
  }),
});

export const {
  useMeQuery, useLoginMutation, useRegisterMutation, useVerifyEmailMutation, useResendVerificationMutation, useForgotPasswordMutation, useResetPasswordMutation,
  useChangePasswordMutation, useLogoutMutation, useLogoutAllMutation, useSessionsQuery, useRevokeSessionMutation,
  useSettingsQuery, useCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation,
  useProductsQuery, useProductQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useAdjustStockMutation, useStockHistoryQuery,
  useQuoteMutation, useCheckoutMutation, useTrackMutation, useMyOrdersQuery, useMyOrderQuery, useCancelMyOrderMutation,
  useUpdateProfileMutation, useAddAddressMutation, useUpdateAddressMutation, useDeleteAddressMutation,
  useWishlistQuery, useWishlistIdsQuery, useToggleWishlistMutation, useMyDesignsQuery, useCreateDesignMutation, useUploadImageMutation, useContactMutation,
  useStatsQuery, useAdminOrdersQuery, useAdminOrderQuery, useSetOrderStatusMutation, useCustomersQuery, useUpdateCustomerMutation,
  useDesignsQuery, useUpdateDesignMutation, useLeadsQuery, useUpdateLeadMutation, useDeleteLeadMutation,
} = api;

/** Readable message + field errors from an RTK Query error. */
export function apiError(err: unknown): { message: string; code?: string; fields: Record<string, string>; details?: unknown } {
  const e = err as { status?: number | string; data?: { error?: { code?: string; message?: string; details?: unknown } }; error?: string };
  const details = e?.data?.error?.details;
  const fields: Record<string, string> = {};
  if (details && typeof details === "object" && !Array.isArray(details)) {
    for (const [k, v] of Object.entries(details as Record<string, unknown>)) if (Array.isArray(v) && typeof v[0] === "string") fields[k] = v[0];
  }
  const message = e?.data?.error?.message ?? (e?.status === "FETCH_ERROR" ? "Can't reach the server — check your connection" : (e?.error ?? "Something went wrong"));
  return { message, code: e?.data?.error?.code, fields, details };
}
