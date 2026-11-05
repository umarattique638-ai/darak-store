import "server-only";
import { cookies } from "next/headers";
import type { CategoryDTO, ProductDTO, ProductList, StoreSettings, UserDTO } from "@/types/api";

export const BACKEND_URL = (process.env.BACKEND_URL ?? "http://localhost:5000").replace(/\/+$/, "");

async function get<T>(path: string, init?: RequestInit & { revalidate?: number }): Promise<T | null> {
  try {
    const res = await fetch(`${BACKEND_URL}/api${path}`, {
      ...init,
      next: init?.revalidate !== undefined ? { revalidate: init.revalidate } : undefined,
      cache: init?.revalidate === undefined ? "no-store" : undefined,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    return (await res.json()).data as T;
  } catch {
    return null;
  }
}

export const getCategories = async () => (await get<{ categories: CategoryDTO[] }>("/categories", { revalidate: 60 }))?.categories ?? [];
export const getProducts = async (qs: string) => (await get<ProductList>(`/products?${qs}`, { revalidate: 30 })) ?? { items: [], total: 0, page: 1, pages: 1, priceRange: { min: 0, max: 0 } };
export const getProduct = (slug: string) => get<{ product: ProductDTO; related: ProductDTO[] }>(`/products/slug/${encodeURIComponent(slug)}`, { revalidate: 30 });
export const getSettings = async () =>
  (await get<StoreSettings>("/settings", { revalidate: 300 })) ?? { currency: "QAR", shippingFlat: 50, freeShippingOver: 2000, bank: { name: "XXX Bank", accountName: "Al Sharq Exhibition", iban: "QA00 XXXX" } };

/**
 * Signed-in user for protected layouts; "unreachable" when the API is down
 * (so we show an error instead of bouncing between refresh and login).
 */
export async function getSessionUser(): Promise<UserDTO | null | "unreachable"> {
  const cookie = (await cookies()).toString();
  if (!cookie) return null;
  try {
    const res = await fetch(`${BACKEND_URL}/api/auth/me`, { headers: { cookie }, cache: "no-store", signal: AbortSignal.timeout(8000) });
    if (res.status === 401 || res.status === 403) return null;
    if (!res.ok) return "unreachable";
    return (await res.json()).data.user as UserDTO;
  } catch {
    return "unreachable";
  }
}
