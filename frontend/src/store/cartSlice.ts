import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { I18nText } from "@/types/api";

export interface CartItem {
  key: string; // productId + colour
  productId: string;
  slug: string;
  name: I18nText;
  image: string;
  price: number;
  color: string;
  quantity: number;
  maxQty: number;
}

interface CartState { items: CartItem[]; open: boolean; hydrated: boolean }
const initialState: CartState = { items: [], open: false, hydrated: false };
export const CART_STORAGE_KEY = "darak_cart_v1";
const MAX_LINE_QTY = 20;

/** Cart lives in the browser (prices are re-checked by the server at checkout). */
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    hydrate(state, action: PayloadAction<CartItem[]>) {
      state.items = action.payload.filter((i) => i && typeof i.productId === "string").slice(0, 50);
      state.hydrated = true;
    },
    addItem(state, action: PayloadAction<Omit<CartItem, "key" | "quantity"> & { quantity?: number }>) {
      const key = `${action.payload.productId}:${action.payload.color}`;
      const existing = state.items.find((i) => i.key === key);
      const qty = action.payload.quantity ?? 1;
      const cap = Math.min(MAX_LINE_QTY, action.payload.maxQty);
      if (existing) existing.quantity = Math.min(cap, existing.quantity + qty);
      else state.items.push({ ...action.payload, key, quantity: Math.min(cap, qty) });
      state.open = true;
    },
    setQuantity(state, action: PayloadAction<{ key: string; quantity: number }>) {
      const it = state.items.find((i) => i.key === action.payload.key);
      if (it) it.quantity = Math.max(1, Math.min(Math.min(MAX_LINE_QTY, it.maxQty), action.payload.quantity));
    },
    removeItem(state, action: PayloadAction<string>) {
      state.items = state.items.filter((i) => i.key !== action.payload);
    },
    /** After a server quote: correct prices / stock caps. */
    syncFromQuote(state, action: PayloadAction<{ productId: string; unitPrice: number; stock: number }[]>) {
      for (const l of action.payload) {
        for (const it of state.items.filter((i) => i.productId === l.productId)) {
          it.price = l.unitPrice;
          it.maxQty = l.stock;
          if (it.quantity > l.stock && l.stock > 0) it.quantity = l.stock;
        }
      }
    },
    clearCart(state) {
      state.items = [];
    },
    setCartOpen(state, action: PayloadAction<boolean>) {
      state.open = action.payload;
    },
  },
});

export const { hydrate, addItem, setQuantity, removeItem, syncFromQuote, clearCart, setCartOpen } = cartSlice.actions;
export default cartSlice.reducer;
