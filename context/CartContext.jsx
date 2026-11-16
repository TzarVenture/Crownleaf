"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const CartContext = createContext(null);

const emptyCart = {
  items: [],
  itemsCount: 0,
  totals: { subtotal: 0, total: 0, shipping: 0, currency: "₹" },
};

// The WooCommerce cart (kept by the server session) is the single source of truth.
// Quantity changes are shown instantly and then reconciled with the server response.
async function cartRequest(payload) {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data.error || "We could not update your cart. Please try again.");
    error.status = res.status;
    throw error;
  }
  return data;
}

async function fetchCart() {
  try {
    const res = await fetch("/api/cart", { cache: "no-store" });
    return res.ok ? await res.json() : null;
  } catch (err) {
    console.warn("Cart refresh failed:", err);
    return null;
  }
}

function withTotals(items, previousTotals) {
  const subtotal = items.reduce((acc, it) => acc + (it.total ?? it.price * it.quantity), 0);
  return {
    items,
    itemsCount: items.reduce((acc, it) => acc + it.quantity, 0),
    totals: { ...previousTotals, subtotal, total: subtotal },
  };
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(emptyCart);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingKey, setUpdatingKey] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const [cartReady, setCartReady] = useState(false); // true once the first cart load has finished
  const updateTimersRef = useRef({});

  // Fetch the latest cart from the server
  const refreshCart = useCallback(async () => {
    const data = await fetchCart();
    if (data) setCart(data);
    setCartReady(true);
  }, []);

  // Load the cart once on mount (and drop the old client-side cache from earlier versions)
  useEffect(() => {
    let ignore = false;
    try {
      localStorage.removeItem("crownleaf_cart_cache");
    } catch {
      // Storage may be unavailable; nothing to clean up.
    }
    fetchCart().then((data) => {
      if (ignore) return;
      if (data) setCart(data);
      setCartReady(true);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const openCart = useCallback(() => setIsDrawerOpen(true), []);
  const closeCart = useCallback(() => setIsDrawerOpen(false), []);
  const toggleCart = useCallback(() => setIsDrawerOpen((prev) => !prev), []);
  const clearError = useCallback(() => setErrorNotice(null), []);

  /**
   * Add a product to the cart.
   * options: { variationId?: number, variation?: [{ attribute, value }] }
   * Resolves to true on success, false if WooCommerce rejected it (the reason is in errorNotice).
   */
  const addToCart = useCallback(
    async (product, quantity = 1, options = {}) => {
      if (!product?.id) return false;
      setErrorNotice(null);
      setIsLoading(true);
      try {
        const data = await cartRequest({
          action: "add",
          id: product.id,
          variationId: options.variationId || 0,
          variation: options.variation || [],
          quantity: Number.parseInt(quantity, 10) || 1,
        });
        setCart(data);
        setIsDrawerOpen(true);
        return true;
      } catch (err) {
        console.error("Add to cart failed:", err);
        setErrorNotice(err.message);
        setIsDrawerOpen(true);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Remove an item
  const removeItem = useCallback(async (itemKey) => {
    clearTimeout(updateTimersRef.current[itemKey]);
    delete updateTimersRef.current[itemKey];
    setUpdatingKey(itemKey);
    setErrorNotice(null);
    setCart((prev) =>
      withTotals(
        prev.items.filter((it) => it.key !== itemKey),
        prev.totals
      )
    );
    try {
      setCart(await cartRequest({ action: "remove", key: itemKey }));
    } catch (err) {
      setErrorNotice(err.message);
      await refreshCart();
    } finally {
      setUpdatingKey(null);
    }
  }, [refreshCart]);

  // Change a quantity (instant on screen, then synced; rapid clicks are debounced)
  const updateQuantity = useCallback(
    (itemKey, newQuantity) => {
      const qty = Number.parseInt(newQuantity, 10);
      if (Number.isNaN(qty) || qty < 1) return removeItem(itemKey);

      setUpdatingKey(itemKey);
      setErrorNotice(null);
      setCart((prev) =>
        withTotals(
          prev.items.map((it) => (it.key === itemKey ? { ...it, quantity: qty, total: qty * it.price } : it)),
          prev.totals
        )
      );

      clearTimeout(updateTimersRef.current[itemKey]);
      updateTimersRef.current[itemKey] = setTimeout(async () => {
        try {
          setCart(await cartRequest({ action: "update", key: itemKey, quantity: qty }));
        } catch (err) {
          setErrorNotice(err.message);
          await refreshCart();
        } finally {
          setUpdatingKey(null);
          delete updateTimersRef.current[itemKey];
        }
      }, 350);
      return undefined;
    },
    [removeItem, refreshCart]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartReady,
        isDrawerOpen,
        isLoading,
        updatingKey,
        errorNotice,
        clearError,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeItem,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
