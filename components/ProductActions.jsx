"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function ProductActions({ product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedAttributes, setSelectedAttributes] = useState(() => {
    const initial = {};
    if (product.attributes && product.attributes.length > 0) {
      product.attributes.forEach((attr) => {
        const options = Array.isArray(attr.options) ? attr.options : [attr.options];
        if (options.length > 0) {
          initial[attr.name] = options[0];
        }
      });
    }
    return initial;
  });

  const [addedNotice, setAddedNotice] = useState(false);
  const { addToCart, openCart } = useCart();

  const isInStock = product.stock_status === "instock";
  const maxStock = product.stock_quantity || 999;

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleQuantityInputChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (isNaN(val) || val < 1) {
      setQuantity(1);
    } else if (val > maxStock) {
      setQuantity(maxStock);
    } else {
      setQuantity(val);
    }
  };

  const handleAddToCart = () => {
    if (!isInStock) return;
    setAddedNotice(true);
    addToCart(product, quantity, selectedAttributes);
    setTimeout(() => {
      setAddedNotice(false);
    }, 3500);
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    addToCart(product, quantity, selectedAttributes);
  };

  return (
    <div className="space-y-6">
      {/* Product Options & Variations (if configured in WooCommerce) */}
      {product.attributes && product.attributes.length > 0 && (
        <div className="space-y-4 pt-2">
          {product.attributes.map((attr) => {
            const options = Array.isArray(attr.options) ? attr.options : [attr.options];
            const currentSelected = selectedAttributes[attr.name] || options[0];

            return (
              <div key={attr.id || attr.name} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="uppercase tracking-wider font-bold text-[#003108]">
                    Select {attr.name}:
                  </span>
                  <span className="font-semibold text-[#A67D44]">{currentSelected}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {options.map((opt) => {
                    const isOptionSelected = currentSelected === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() =>
                          setSelectedAttributes((prev) => ({
                            ...prev,
                            [attr.name]: opt,
                          }))
                        }
                        className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                          isOptionSelected
                            ? "bg-[#003108] text-white border-[#003108] shadow-xs"
                            : "bg-white text-slate-700 border-[#E2D9CF] hover:border-slate-400"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quantity Stepper & Primary E-commerce Actions */}
      <div className="pt-2">
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wider font-bold text-[#003108]">
            Quantity
          </span>
        </div>

        <div className="space-y-3">
          {/* Row 1: Quantity Stepper on Left + Add to Cart on Right */}
          <div className="flex items-center gap-3">
            {/* Quantity Stepper Control */}
            <div className="inline-flex items-center justify-between border border-[#E2D9CF] rounded-lg bg-white px-2.5 h-12 w-32 sm:w-36 flex-shrink-0 shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={!isInStock || quantity <= 1}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#003108] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-base rounded hover:bg-stone-100"
                aria-label="Decrease quantity"
              >
                &minus;
              </button>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={quantity}
                onChange={handleQuantityInputChange}
                disabled={!isInStock}
                className="w-10 text-center text-sm font-bold text-[#003108] bg-transparent border-0 focus:outline-none"
                aria-label="Item quantity"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={!isInStock || quantity >= maxStock}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#003108] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-base rounded hover:bg-stone-100"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!isInStock}
              className="flex-1 h-12 px-4 sm:px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#003108] text-white hover:bg-[#002205] active:scale-[0.99] disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center text-center"
            >
              Add to Cart
            </button>
          </div>

          {/* Row 2: Buy Now Button on Bottom */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isInStock}
            className="w-full h-12 px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#A67D44] text-white hover:bg-[#8E6935] active:scale-[0.99] disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center text-center"
          >
            Buy Now
          </button>
        </div>

        {/* Temporary Banner Notification */}
        {addedNotice && (
          <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center justify-between">
            <span>
              Added <strong>{quantity} unit{quantity > 1 ? "s" : ""}</strong> of {product.name} to your bag.
            </span>
            <button
              type="button"
              onClick={openCart}
              className="text-[11px] text-emerald-900 underline font-bold uppercase tracking-wider ml-4 cursor-pointer"
            >
              View Bag
            </button>
          </div>
        )}
      </div>

      {/* Corporate B2B Bulk Quotation Callout */}
      <div className="p-4 rounded-xl bg-stone-50 border border-[#E2D9CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#003108] block">
            Corporate &amp; Bulk Orders
          </span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Volume pricing, corporate logo engraving, custom packaging, and sample kits available.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://crownleaf.co/bulk-enquiry/"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-[#A67D44] border border-[#A67D44] hover:bg-[#A67D44] hover:text-white transition-all text-center shadow-xs"
          >
            Bulk Enquiry
          </a>
          <a
            href="tel:+917760775875"
            className="whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold text-[#003108] border border-[#E2D9CF] bg-white hover:bg-stone-100 transition-colors"
          >
            +91 7760775875
          </a>
        </div>
      </div>

      {/* Trust & Executive Quality Indicators */}
      <div className="pt-4 border-t border-[#E2D9CF] grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="p-2.5 sm:p-3 bg-stone-50 rounded-lg border border-[#E2D9CF]/60 flex flex-col justify-center items-center">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#003108]">
            Quality Assured
          </div>
          <div className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
            Verified Materials
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-stone-50 rounded-lg border border-[#E2D9CF]/60 flex flex-col justify-center items-center">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#003108]">
            Custom Branding
          </div>
          <div className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
            Laser &amp; UV Print
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-stone-50 rounded-lg border border-[#E2D9CF]/60 flex flex-col justify-center items-center">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#003108]">
            Pan-India Dispatch
          </div>
          <div className="hidden sm:block text-[10px] text-slate-500 mt-0.5">
            Insured Transit
          </div>
        </div>
      </div>
    </div>
  );
}
