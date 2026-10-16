"use client";

import { useState } from "react";
import Image from "next/image";

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

  const [drawerOpen, setDrawerOpen] = useState(null); // 'cart' | 'checkout' | null
  const [addedNotice, setAddedNotice] = useState(false);

  const isInStock = product.stock_status === "instock";
  const maxStock = product.stock_quantity || 999;
  const unitPrice = parseFloat(product.price || 0);
  const totalPrice = (unitPrice * quantity).toLocaleString("en-IN");
  const productImage = product.images?.[0]?.src || null;

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
    setDrawerOpen("cart");
    setTimeout(() => {
      setAddedNotice(false);
    }, 3000);
  };

  const handleBuyNow = () => {
    if (!isInStock) return;
    setDrawerOpen("checkout");
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
                  <span className="uppercase tracking-wider font-bold text-[#17472F]">
                    Select {attr.name}:
                  </span>
                  <span className="font-semibold text-[#A47A3C]">{currentSelected}</span>
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
                            ? "bg-[#17472F] text-white border-[#17472F] shadow-xs"
                            : "bg-[#FAF7F0] text-stone-700 border-[#E4DCCF] hover:border-stone-400"
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
          <span className="text-xs uppercase tracking-wider font-bold text-[#17472F]">
            Quantity
          </span>
        </div>

        <div className="space-y-3">
          {/* Row 1: Quantity Stepper on Left + Add to Cart on Right */}
          <div className="flex items-center gap-3">
            {/* Quantity Stepper Control */}
            <div className="inline-flex items-center justify-between border border-[#E4DCCF] rounded-lg bg-[#FAF7F0] px-2.5 h-12 w-32 sm:w-36 flex-shrink-0 shadow-xs">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={!isInStock || quantity <= 1}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-[#17472F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-base rounded hover:bg-stone-200/50"
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
                className="w-10 text-center text-sm font-bold text-[#17472F] bg-transparent border-0 focus:outline-none"
                aria-label="Item quantity"
              />
              <button
                type="button"
                onClick={handleIncrement}
                disabled={!isInStock || quantity >= maxStock}
                className="w-8 h-8 flex items-center justify-center text-stone-600 hover:text-[#17472F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-base rounded hover:bg-stone-200/50"
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
              className="flex-1 h-12 px-4 sm:px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#17472F] text-white hover:bg-[#123825] active:scale-[0.99] disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center text-center"
            >
              Add to Cart
            </button>
          </div>

          {/* Row 2: Buy Now Button on Bottom */}
          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!isInStock}
            className="w-full h-12 px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#A47A3C] text-white hover:bg-[#8E6935] active:scale-[0.99] disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center text-center"
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
              onClick={() => setDrawerOpen("cart")}
              className="text-[11px] text-emerald-900 underline font-bold uppercase tracking-wider ml-4"
            >
              View Bag
            </button>
          </div>
        )}
      </div>

      {/* Corporate B2B Bulk Quotation Callout */}
      <div className="p-4 rounded-xl bg-[#FAF7F0] border border-[#E4DCCF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#17472F] block">
            Corporate &amp; Bulk Orders
          </span>
          <span className="text-[11px] text-stone-500 block mt-0.5">
            Volume pricing, corporate logo engraving, custom packaging, and sample kits available.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://crownleaf.co/bulk-enquiry/"
            target="_blank"
            rel="noopener noreferrer"
            className="whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#FAF7F0] text-[#A47A3C] border border-[#A47A3C] hover:bg-[#A47A3C] hover:text-white transition-all text-center shadow-xs"
          >
            Bulk Enquiry
          </a>
          <a
            href="tel:+917760775875"
            className="whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold text-[#17472F] border border-[#E4DCCF] bg-[#FAF7F0] hover:bg-stone-200/50 transition-colors"
          >
            +91 7760775875
          </a>
        </div>
      </div>

      {/* Trust & Executive Quality Indicators */}
      <div className="pt-4 border-t border-[#E4DCCF] grid grid-cols-3 gap-2 sm:gap-3 text-center">
        <div className="p-2.5 sm:p-3 bg-[#FAF7F0] rounded-lg border border-[#E4DCCF] flex flex-col justify-center items-center">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#17472F]">
            Quality Assured
          </div>
          <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">
            Verified Materials
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-[#FAF7F0] rounded-lg border border-[#E4DCCF] flex flex-col justify-center items-center">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#17472F]">
            Custom Branding
          </div>
          <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">
            Laser &amp; UV Print
          </div>
        </div>

        <div className="p-2.5 sm:p-3 bg-[#FAF7F0] rounded-lg border border-[#E4DCCF] flex flex-col justify-center items-center">
          <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#17472F]">
            Pan-India Dispatch
          </div>
          <div className="hidden sm:block text-[10px] text-stone-500 mt-0.5">
            Insured Transit
          </div>
        </div>
      </div>

      {/* Slide-over Drawer for Cart & Instant Checkout Preview */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay backdrop */}
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setDrawerOpen(null)}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#FAF7F0] border-l border-[#E4DCCF] shadow-2xl flex flex-col justify-between">
              {/* Drawer Header */}
              <div className="p-6 border-b border-[#E4DCCF] flex items-center justify-between bg-[#FAF7F0]">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#17472F]">
                    {drawerOpen === "cart" ? "Shopping Bag" : "Instant Checkout Preview"}
                  </h3>
                  <span className="text-[11px] text-stone-500">
                    {drawerOpen === "cart" ? "1 Item in your order" : "Review your direct order"}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(null)}
                  className="w-8 h-8 rounded-full border border-[#E4DCCF] bg-white text-stone-500 hover:text-stone-800 flex items-center justify-center text-sm font-bold"
                  aria-label="Close panel"
                >
                  &times;
                </button>
              </div>

              {/* Drawer Content Body */}
              <div className="p-6 overflow-y-auto flex-1 space-y-6">
                {/* Product summary card */}
                <div className="flex gap-4 p-4 rounded-xl border border-[#E4DCCF] bg-white">
                  {productImage ? (
                    <div className="relative w-20 h-20 rounded-lg bg-[#FAF7F0] border border-[#E4DCCF] overflow-hidden flex-shrink-0">
                      <Image
                        src={productImage}
                        alt={product.name}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-stone-100 flex items-center justify-center text-[10px] text-stone-400">
                      No Image
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-[#17472F] line-clamp-2">
                      {product.name}
                    </h4>

                    {/* Display chosen attributes */}
                    {Object.keys(selectedAttributes).length > 0 && (
                      <div className="mt-1 text-[11px] text-stone-500">
                        {Object.entries(selectedAttributes).map(([k, v]) => (
                          <span key={k} className="mr-2">
                            {k}: <strong className="text-stone-700">{v}</strong>
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-500">
                        Qty: <strong className="text-[#17472F]">{quantity}</strong>
                      </span>
                      <span className="text-xs font-bold text-[#17472F]">
                        ₹{totalPrice}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staged Checkout / Order Summary */}
                <div className="space-y-3 pt-4 border-t border-[#E4DCCF]">
                  <span className="text-xs uppercase tracking-wider font-bold text-[#17472F] block">
                    Order Summary
                  </span>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Unit Price</span>
                    <span>₹{unitPrice.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Quantity</span>
                    <span>&times; {quantity}</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Pan-India Delivery</span>
                    <span className="text-emerald-700 font-semibold">Free Express</span>
                  </div>
                  <div className="flex justify-between text-xs text-stone-600">
                    <span>Taxes &amp; GST</span>
                    <span>Included</span>
                  </div>
                  <div className="pt-3 border-t border-[#E4DCCF] flex justify-between text-sm font-bold text-[#17472F]">
                    <span>Total Amount</span>
                    <span>₹{totalPrice}</span>
                  </div>
                </div>

                {/* Information Callout */}
                <div className="p-4 rounded-lg bg-amber-50/60 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                  <span className="font-bold block mb-1">
                    Storefront Notice:
                  </span>
                  Payment gateway and multi-item cart storage are scheduled for the next phase. The quantity increment/decrement, variant selection, and buy actions are operating on the frontend.
                </div>
              </div>

              {/* Drawer Footer Actions */}
              <div className="p-6 border-t border-[#E4DCCF] bg-[#FAF7F0] space-y-3">
                {drawerOpen === "cart" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setDrawerOpen("checkout")}
                      className="w-full py-3.5 px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#17472F] text-white hover:bg-[#123825] transition-all text-center shadow-xs"
                    >
                      Proceed to Checkout (₹{totalPrice})
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(null)}
                      className="w-full py-2.5 px-6 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors text-center"
                    >
                      Continue Shopping
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        alert(
                          `Order intent recorded for ${quantity} unit(s) of "${product.name}". Total: ₹${totalPrice}. Payment gateway will be connected in next phase.`
                        );
                        setDrawerOpen(null);
                      }}
                      className="w-full py-3.5 px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#A47A3C] text-white hover:bg-[#8E6935] transition-all text-center shadow-xs"
                    >
                      Place Order (Staged)
                    </button>
                    <button
                      type="button"
                      onClick={() => setDrawerOpen(null)}
                      className="w-full py-2.5 px-6 rounded-lg text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors text-center"
                    >
                      Back to Product
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
