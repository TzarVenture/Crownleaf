"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const { cart, isDrawerOpen, closeCart, updateQuantity, removeItem, isLoading } = useCart();
  const drawerRef = useRef(null);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape" && isDrawerOpen) {
        closeCart();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen, closeCart]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  const hasItems = cart.items && cart.items.length > 0;
  const subtotalFormatted = (cart.totals?.subtotal || 0).toLocaleString("en-IN");
  const totalFormatted = (cart.totals?.total || 0).toLocaleString("en-IN");

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-all duration-300 ${
        isDrawerOpen ? "pointer-events-auto visible" : "pointer-events-none invisible"
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Cart"
    >
      {/* Darkened Backdrop Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
          isDrawerOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10">
        <div
          ref={drawerRef}
          className={`w-screen max-w-md bg-white border-l border-[#E2D9CF] shadow-2xl flex flex-col justify-between transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="px-5 py-4 sm:px-6 sm:py-5 border-b border-[#E2D9CF] bg-stone-50 flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold uppercase tracking-wider text-[#003108]">
              Shopping Bag
            </h2>

            <button
              type="button"
              onClick={closeCart}
              className="w-8 h-8 rounded-full border border-[#E2D9CF] bg-white text-slate-500 hover:text-slate-900 hover:border-slate-400 flex items-center justify-center transition-colors shadow-2xs"
              aria-label="Close cart drawer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Drawer Body: Line Items or Empty State */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {hasItems ? (
              <div className="divide-y divide-[#E2D9CF]/60">
                {cart.items.map((item) => {
                  const itemTotal = (item.total || item.price * item.quantity).toLocaleString("en-IN");
                  const unitPrice = (item.price || 0).toLocaleString("en-IN");

                  return (
                    <div key={item.key} className="py-4 first:pt-0 last:pb-0 flex gap-3.5 sm:gap-4 items-start">
                      {/* Product Thumbnail */}
                      <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-xl bg-stone-50 border border-[#E2D9CF] overflow-hidden flex-shrink-0 p-1">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="88px"
                            className="object-contain p-1"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-slate-400">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Info & Controls */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-xs sm:text-sm font-semibold text-[#003108] line-clamp-2 leading-snug">
                            {item.permalink ? (
                              <Link
                                href={item.permalink}
                                onClick={closeCart}
                                className="hover:text-[#A67D44] transition-colors"
                              >
                                {item.name}
                              </Link>
                            ) : (
                              item.name
                            )}
                          </h3>

                          {/* Remove Item Button */}
                          <button
                            type="button"
                            onClick={() => removeItem(item.key)}
                            className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                            aria-label={`Remove ${item.name} from bag`}
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>

                        {/* Selected Variants */}
                        {item.variation && item.variation.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1 text-[11px] text-slate-500">
                            {item.variation.map((v, i) => (
                              <span key={i} className="inline-block bg-stone-100 px-1.5 py-0.5 rounded text-[10px] text-slate-600">
                                {v.attribute || v.name}: <strong className="text-slate-800">{v.value || v.option}</strong>
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Price & Quantity Stepper */}
                        <div className="mt-3 flex items-center justify-between">
                          {/* Compact Quantity Stepper */}
                          <div className="inline-flex items-center justify-between border border-[#E2D9CF] rounded-lg bg-white px-2 h-8 w-24 shadow-2xs">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-[#003108] disabled:opacity-30 disabled:cursor-not-allowed text-xs font-bold"
                              aria-label="Decrease quantity"
                            >
                              &minus;
                            </button>
                            <span className="text-xs font-bold text-[#003108] px-1">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.key, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center text-slate-600 hover:text-[#003108] text-xs font-bold"
                              aria-label="Increase quantity"
                            >
                              +
                            </button>
                          </div>

                          {/* Line Total */}
                          <div className="text-right">
                            <span className="text-xs sm:text-sm font-bold text-[#003108]">
                              ₹{itemTotal}
                            </span>
                            {item.quantity > 1 && (
                              <span className="block text-[10px] text-slate-400">
                                ₹{unitPrice} each
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty Bag State */
              <div className="h-full flex flex-col items-center justify-center text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-stone-100 border border-[#E2D9CF] flex items-center justify-center text-slate-400 mb-4">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-[#003108] mb-1">
                  Your Shopping Bag is Empty
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mb-6 leading-relaxed">
                  Explore our premium corporate gifts, welcome hampers, and customized business collections.
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider bg-[#003108] text-white hover:bg-[#002205] transition-all shadow-xs"
                >
                  Explore Collections
                </button>
              </div>
            )}
          </div>

          {/* Drawer Footer (Summary & CTAs) */}
          {hasItems && (
            <div className="p-5 sm:p-6 border-t border-[#E2D9CF] bg-stone-50 space-y-3">
              {/* Order Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">₹{subtotalFormatted}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping &amp; Taxes</span>
                  <span className="text-slate-500">Calculated at checkout</span>
                </div>
                <div className="pt-2 border-t border-[#E2D9CF] flex justify-between text-sm sm:text-base font-bold text-[#003108]">
                  <span>Total</span>
                  <span>₹{totalFormatted}</span>
                </div>
              </div>

              {/* Checkout CTA Buttons */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3.5 px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white hover:bg-[#8E6935] active:scale-[0.99] transition-all text-center shadow-xs block"
                >
                  Proceed to Checkout &bull; ₹{totalFormatted}
                </Link>

                <button
                  type="button"
                  onClick={closeCart}
                  className="w-full py-2.5 px-6 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors text-center block"
                >
                  Continue Shopping
                </button>
              </div>

              {/* Trust Tagline */}
              <div className="text-center pt-1">
                <span className="text-[10px] text-slate-400">
                  Insured Pan-India transit &bull; Bulk GST invoices provided
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
