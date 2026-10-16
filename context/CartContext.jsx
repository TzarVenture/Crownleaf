"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

const CartContext = createContext(null);

const LOCAL_STORAGE_KEY = "crownleaf_cart_cache";

// Normalizes and compares variations across array format [{attribute, value}] and object format {[key]: value}
function areVariationsEqual(varA, varB) {
  const mapA = {};
  if (Array.isArray(varA)) {
    varA.forEach((v) => {
      const key = (v.attribute || v.name || "").toLowerCase().trim();
      const val = (v.value || v.option || "").toLowerCase().trim();
      if (key) mapA[key] = val;
    });
  } else if (varA && typeof varA === "object") {
    Object.entries(varA).forEach(([k, v]) => {
      const key = k.toLowerCase().trim();
      const val = String(v || "").toLowerCase().trim();
      if (key) mapA[key] = val;
    });
  }

  const mapB = {};
  if (Array.isArray(varB)) {
    varB.forEach((v) => {
      const key = (v.attribute || v.name || "").toLowerCase().trim();
      const val = (v.value || v.option || "").toLowerCase().trim();
      if (key) mapB[key] = val;
    });
  } else if (varB && typeof varB === "object") {
    Object.entries(varB).forEach(([k, v]) => {
      const key = k.toLowerCase().trim();
      const val = String(v || "").toLowerCase().trim();
      if (key) mapB[key] = val;
    });
  }

  const keysA = Object.keys(mapA);
  const keysB = Object.keys(mapB);

  // If neither has variations, they are equal
  if (keysA.length === 0 && keysB.length === 0) return true;
  if (keysA.length !== keysB.length) return false;

  return keysA.every((k) => mapA[k] === mapB[k]);
}

const initialCartState = {
  items: [],
  itemsCount: 0,
  totals: {
    subtotal: 0,
    total: 0,
    shipping: 0,
    currency: "₹",
  },
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(initialCartState);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [updatingKey, setUpdatingKey] = useState(null);
  const [errorNotice, setErrorNotice] = useState(null);
  const updateTimersRef = useRef({});

  // Load cached cart on initial mount for instant rendering
  useEffect(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && Array.isArray(parsed.items)) {
          setCart(parsed);
        }
      }
    } catch {
      // Ignore localStorage errors
    }

    // Sync with WooCommerce Store API
    refreshCart();
  }, []);

  // Sync state to localStorage whenever cart changes
  const saveCartToStorage = useCallback((newCart) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newCart));
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  // Fetch latest cart data from API
  const refreshCart = useCallback(async () => {
    try {
      const res = await fetch("/api/cart", { method: "GET" });
      if (res.ok) {
        const data = await res.json();
        setCart(data);
        saveCartToStorage(data);
      }
    } catch (err) {
      console.warn("Background cart refresh failed:", err);
    }
  }, [saveCartToStorage]);

  const openCart = useCallback(() => setIsDrawerOpen(true), []);
  const closeCart = useCallback(() => setIsDrawerOpen(false), []);
  const toggleCart = useCallback(() => setIsDrawerOpen((prev) => !prev), []);

  // Add Item to Cart (Instant In-Place Increment + Server Sync)
  const addToCart = useCallback(
    async (product, quantity = 1, selectedAttributes = {}) => {
      if (!product || !product.id) return;

      const qty = parseInt(quantity, 10) || 1;
      const unitPrice = parseFloat(product.price || 0);

      // 1. Instant Optimistic Update with Accurate Variation Matching
      setCart((prev) => {
        const existingIndex = prev.items.findIndex(
          (it) => it.id === product.id && areVariationsEqual(it.variation, selectedAttributes)
        );

        let newItems;
        if (existingIndex > -1) {
          newItems = [...prev.items];
          const existing = newItems[existingIndex];
          const newQty = existing.quantity + qty;
          newItems[existingIndex] = {
            ...existing,
            quantity: newQty,
            total: newQty * (existing.price || unitPrice),
          };
        } else {
          const newItem = {
            key: `temp-${Date.now()}-${product.id}`,
            id: product.id,
            name: product.name,
            quantity: qty,
            price: unitPrice,
            total: qty * unitPrice,
            currency: "₹",
            image: product.images?.[0]?.src || null,
            variation: Object.entries(selectedAttributes).map(([attribute, value]) => ({ attribute, value })),
            permalink: `/product/${product.slug}`,
            sku: product.sku || "",
          };
          newItems = [newItem, ...prev.items];
        }

        const newItemsCount = newItems.reduce((acc, it) => acc + it.quantity, 0);
        const newSubtotal = newItems.reduce((acc, it) => acc + (it.total || it.price * it.quantity), 0);

        const updated = {
          items: newItems,
          itemsCount: newItemsCount,
          totals: {
            ...prev.totals,
            subtotal: newSubtotal,
            total: newSubtotal,
          },
        };

        saveCartToStorage(updated);
        return updated;
      });

      // Open side drawer immediately
      openCart();
      setIsLoading(true);

      // 2. Server Sync with WooCommerce Store API
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "add",
            id: product.id,
            quantity: qty,
          }),
        });

        if (res.ok) {
          const serverData = await res.json();
          setCart(serverData);
          saveCartToStorage(serverData);
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn("WooCommerce add-item returned non-200:", errData);
        }
      } catch (err) {
        console.error("Cart API add-item error:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [openCart, saveCartToStorage]
  );

  // Update Item Quantity (Instant UI + Debounced Server Sync)
  const updateQuantity = useCallback(
    async (itemKey, newQuantity) => {
      const qty = parseInt(newQuantity, 10);
      if (isNaN(qty) || qty < 1) {
        return removeItem(itemKey);
      }

      setUpdatingKey(itemKey);

      // 1. Instant Optimistic State Update
      setCart((prev) => {
        const newItems = prev.items.map((it) => {
          if (it.key === itemKey) {
            return {
              ...it,
              quantity: qty,
              total: qty * it.price,
            };
          }
          return it;
        });

        const newItemsCount = newItems.reduce((acc, it) => acc + it.quantity, 0);
        const newSubtotal = newItems.reduce((acc, it) => acc + it.total, 0);

        const updated = {
          items: newItems,
          itemsCount: newItemsCount,
          totals: {
            ...prev.totals,
            subtotal: newSubtotal,
            total: newSubtotal,
          },
        };

        saveCartToStorage(updated);
        return updated;
      });

      // 2. Debounced Server Sync to prevent race conditions during rapid clicking
      if (updateTimersRef.current[itemKey]) {
        clearTimeout(updateTimersRef.current[itemKey]);
      }

      updateTimersRef.current[itemKey] = setTimeout(async () => {
        try {
          const res = await fetch("/api/cart", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              action: "update",
              key: itemKey,
              quantity: qty,
            }),
          });

          if (res.ok) {
            const serverData = await res.json();
            setCart(serverData);
            saveCartToStorage(serverData);
          }
        } catch (err) {
          console.error("Cart update quantity error:", err);
        } finally {
          setUpdatingKey(null);
          delete updateTimersRef.current[itemKey];
        }
      }, 350);
    },
    [saveCartToStorage]
  );

  // Remove Item from Cart
  const removeItem = useCallback(
    async (itemKey) => {
      setUpdatingKey(itemKey);

      // 1. Optimistic Removal
      setCart((prev) => {
        const newItems = prev.items.filter((it) => it.key !== itemKey);
        const newItemsCount = newItems.reduce((acc, it) => acc + it.quantity, 0);
        const newSubtotal = newItems.reduce((acc, it) => acc + it.total, 0);

        const updated = {
          items: newItems,
          itemsCount: newItemsCount,
          totals: {
            ...prev.totals,
            subtotal: newSubtotal,
            total: newSubtotal,
          },
        };

        saveCartToStorage(updated);
        return updated;
      });

      // 2. Server Sync
      try {
        const res = await fetch("/api/cart", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "remove",
            key: itemKey,
          }),
        });

        if (res.ok) {
          const serverData = await res.json();
          setCart(serverData);
          saveCartToStorage(serverData);
        }
      } catch (err) {
        console.error("Cart remove error:", err);
      } finally {
        setUpdatingKey(null);
      }
    },
    [saveCartToStorage]
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        isDrawerOpen,
        isLoading,
        updatingKey,
        errorNotice,
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
