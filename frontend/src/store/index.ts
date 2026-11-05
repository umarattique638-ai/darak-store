import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import authReducer from "./authSlice";
import cartReducer, { CART_STORAGE_KEY } from "./cartSlice";
import { api } from "./api";
import type { UserDTO } from "@/types/api";

/** One store per browser session (created in StoreProvider — never a server singleton). */
export function makeStore(user: UserDTO | null = null) {
  const store = configureStore({
    reducer: { auth: authReducer, cart: cartReducer, [api.reducerPath]: api.reducer },
    preloadedState: { auth: { user } },
    middleware: (getDefault) => getDefault().concat(api.middleware),
  });
  setupListeners(store.dispatch);
  // persist the cart (only after it has been hydrated from storage)
  if (typeof window !== "undefined") {
    let last = "";
    store.subscribe(() => {
      const { items, hydrated } = store.getState().cart;
      if (!hydrated) return;
      const next = JSON.stringify(items);
      if (next !== last) {
        last = next;
        try { localStorage.setItem(CART_STORAGE_KEY, next); } catch { /* storage full / private mode */ }
      }
    });
  }
  return store;
}

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
