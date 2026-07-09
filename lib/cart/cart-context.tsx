"use client";

import * as React from "react";
import { clampBags } from "./pricing";

// Re-exported so client consumers can pull everything from one module.
export { PRICE_PER_BAG_TZS, formatTzs } from "./pricing";

const STORAGE_KEY = "camel-cart";

/** Cart state: product slug -> quantity in 50 kg bags. */
type CartState = Record<string, number>;

export interface CartItem {
  slug: string;
  qty: number;
}

interface CartSnapshot {
  /** True once the cart has been hydrated from localStorage on the client. */
  ready: boolean;
  items: CartItem[];
  totalBags: number;
}

export interface CartContextValue extends CartSnapshot {
  addBags: (slug: string, n?: number) => void;
  /** Sets the exact quantity (clamped 0..100000). Setting 0 removes the item. */
  setBags: (slug: string, n: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

/* ── Module-level store (hydration-safe via useSyncExternalStore) ── */

const SERVER_SNAPSHOT: CartSnapshot = { ready: false, items: [], totalBags: 0 };

let cart: CartState = {};
let ready = false;
let snapshot: CartSnapshot = SERVER_SNAPSHOT;
let initialized = false;
const listeners = new Set<() => void>();

function readStoredCart(): CartState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed))
      return {};
    const next: CartState = {};
    for (const [slug, qty] of Object.entries(parsed)) {
      const clamped = clampBags(typeof qty === "number" ? qty : Number(qty));
      if (clamped > 0) next[slug] = clamped;
    }
    return next;
  } catch {
    return {};
  }
}

function writeStoredCart(state: CartState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage full or blocked — the in-memory cart still works.
  }
}

function computeSnapshot() {
  const items = Object.entries(cart).map(([slug, qty]) => ({ slug, qty }));
  const totalBags = items.reduce((sum, item) => sum + item.qty, 0);
  snapshot = { ready, items, totalBags };
}

function emit() {
  for (const listener of listeners) listener();
}

/**
 * Loads the persisted cart the first time the store is touched on the
 * client. Server renders (and the hydration pass) always see the empty
 * SERVER_SNAPSHOT, so there is never a hydration mismatch — counts appear
 * right after mount, once `ready` flips to true.
 */
function initStore() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;
  cart = readStoredCart();
  ready = true;
  computeSnapshot();
  // Keep tabs in sync.
  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY || event.key === null) {
      cart = readStoredCart();
      computeSnapshot();
      emit();
    }
  });
}

function subscribe(listener: () => void) {
  initStore();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): CartSnapshot {
  return snapshot;
}

function getServerSnapshot(): CartSnapshot {
  return SERVER_SNAPSHOT;
}

function setCart(next: CartState) {
  cart = next;
  computeSnapshot();
  writeStoredCart(cart);
  emit();
}

function applyQty(slug: string, updater: (current: number) => number) {
  initStore();
  const current = cart[slug] ?? 0;
  const next = clampBags(updater(current));
  if (next === current) return;
  const nextCart = { ...cart };
  if (next === 0) {
    delete nextCart[slug];
  } else {
    nextCart[slug] = next;
  }
  setCart(nextCart);
}

const actions = {
  addBags(slug: string, n = 1) {
    applyQty(slug, (current) => current + n);
  },
  setBags(slug: string, n: number) {
    applyQty(slug, () => n);
  },
  remove(slug: string) {
    applyQty(slug, () => 0);
  },
  clear() {
    initStore();
    setCart({});
  },
};

/* ── React bindings ─────────────────────────────────────────── */

/**
 * Cart provider. The cart is backed by a shared client-side store, so the
 * provider is a thin wrapper — mount it once near the root (site layout) so
 * the whole tree shares one subscription boundary.
 */
export function CartProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/** Cart hook: live cart state plus mutation helpers. */
export function useCart(): CartContextValue {
  const snap = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );
  return React.useMemo(() => ({ ...snap, ...actions }), [snap]);
}
