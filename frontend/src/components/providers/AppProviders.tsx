"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { CART_STORAGE_KEY, hydrate } from "@/store/cartSlice";
import { setUser } from "@/store/authSlice";
import { useMeQuery } from "@/store/api";
import { I18nProvider } from "@/i18n/client";
import type { Locale } from "@/i18n/config";
import { Toaster } from "@/components/ui/Toaster";

/** Loads the cart from localStorage and keeps the signed-in user (if any) in the store. */
function Bootstrap({ store }: { store: ReturnType<typeof makeStore> }) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      store.dispatch(hydrate(raw ? JSON.parse(raw) : []));
    } catch {
      store.dispatch(hydrate([]));
    }
  }, [store]);
  // Keep the signed-in user in sync (re-fetched whenever a mutation invalidates "Me").
  const { data } = useMeQuery();
  useEffect(() => {
    if (data?.user) store.dispatch(setUser(data.user));
  }, [data, store]);
  return null;
}

export function AppProviders({ locale, children }: { locale: Locale; children: ReactNode }) {
  const [store] = useState(() => makeStore(null));
  return (
    <Provider store={store}>
      <I18nProvider locale={locale}>
        <Bootstrap store={store} />
        {children}
        <Toaster />
      </I18nProvider>
    </Provider>
  );
}
