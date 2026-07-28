"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type CartItem = {
  templateId: string;
  slug: string;
  title: string;
  basePrice: number;
  coverImage: string;
  notes: string;
  hostingPlanId: string;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: CartItem) => void;
  remove: (templateId: string) => void;
  update: (templateId: string, patch: Partial<CartItem>) => void;
  clear: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "zenox_cart_v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add = useCallback((item: CartItem) => {
    setItems((prev) =>
      prev.some((i) => i.templateId === item.templateId) ? prev : [...prev, item],
    );
  }, []);

  const remove = useCallback((templateId: string) => {
    setItems((prev) => prev.filter((i) => i.templateId !== templateId));
  }, []);

  const update = useCallback((templateId: string, patch: Partial<CartItem>) => {
    setItems((prev) => prev.map((i) => (i.templateId === templateId ? { ...i, ...patch } : i)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({ items, add, remove, update, clear, ready }),
    [items, add, remove, update, clear, ready],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
