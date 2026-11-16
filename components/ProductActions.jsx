"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { formatINR, SALES_PHONE_DISPLAY, SALES_PHONE_TEL, whatsappLink } from "@/lib/site";

const sameOption = (a, b) => String(a || "").trim().toLowerCase() === String(b || "").trim().toLowerCase();

export const DIRECT_CHECKOUT_KEY = "crownleaf_direct_checkout";

/**
 * Add to cart / Buy now / quote request for one product.
 * - Simple products: quantity + add to cart.
 * - Variable products (e.g. colour): the shopper's choice is matched to a WooCommerce variation,
 *   and that variation (price, stock) is what is added to the cart.
 * - Products without an online price (not purchasable): a quote request instead of buy buttons.
 */
export default function ProductActions({ product, variations = [] }) {
  const router = useRouter();
  const { addToCart, openCart, isLoading } = useCart();

  const isVariable = product.type === "variable";
  const variationAttributes = (product.attributes || []).filter((attr) => attr.variation);

  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState(() => {
    const initial = {};
    variationAttributes.forEach((attr) => {
      if (attr.options?.length) initial[attr.name] = attr.options[0];
    });
    return initial;
  });
  const [addedNotice, setAddedNotice] = useState(false);

  // The variation that matches the shopper's current choices
  const selectedVariation = isVariable
    ? variations.find((v) =>
        variationAttributes.every((attr) => {
          const va = (v.attributes || []).find((x) => sameOption(x.name, attr.name));
          // A blank option on a variation means "any value"
          return !va || !va.option || sameOption(va.option, selected[attr.name]);
        })
      ) || null
    : null;

  const unitPrice = Number.parseFloat(isVariable ? selectedVariation?.price : product.price);
  const hasOnlinePrice = isVariable ? variations.length > 0 : Number.isFinite(unitPrice) && unitPrice > 0;
  const isInStock = isVariable
    ? selectedVariation?.stock_status !== "outofstock" && product.stock_status === "instock"
    : product.stock_status === "instock";
  const canBuyOnline = product.purchasable !== false && hasOnlinePrice;
  const optionMissing = isVariable && !selectedVariation;
  const canOrder = canBuyOnline && isInStock && !optionMissing;
  const maxStock = selectedVariation?.stock_quantity || product.stock_quantity || 9999;

  const variationPayload = Object.entries(selected).map(([attribute, value]) => ({ attribute, value }));

  const setClamped = (value) => {
    const n = Number.parseInt(value, 10);
    if (Number.isNaN(n) || n < 1) setQuantity(1);
    else setQuantity(Math.min(n, maxStock));
  };

  const handleAddToCart = async () => {
    if (!canOrder) return;
    const ok = await addToCart(product, quantity, {
      variationId: selectedVariation?.id,
      variation: variationPayload,
    });
    if (ok) {
      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3500);
    }
  };

  const handleBuyNow = () => {
    if (!canOrder) return;
    try {
      sessionStorage.setItem(
        DIRECT_CHECKOUT_KEY,
        JSON.stringify({
          product: {
            id: product.id,
            name: product.name,
            slug: product.slug,
            sku: product.sku,
            image: product.images?.[0]?.src || null,
          },
          quantity,
          variationId: selectedVariation?.id || 0,
          variation: variationPayload,
          unitPrice,
        })
      );
    } catch (err) {
      console.warn("Direct checkout storage notice:", err);
    }
    router.push("/checkout?direct=1");
  };

  // ---- Products that cannot be bought online: request a quote ------------------------------
  if (!canBuyOnline) {
    const quoteText = `Hi Crownleaf, I would like a quote for "${product.name}". Quantity: ____ . Branding required: ____ .`;
    return (
      <div className="space-y-5">
        <div className="p-5 bg-white border border-[#E2D9CF]">
          <span className="block text-xs uppercase tracking-wider font-bold text-[#003108]">Available on request</span>
          <p className="mt-1.5 text-sm text-stone-600 leading-relaxed">
            This item is quoted per order, based on quantity and branding. Tell us what you need and we will reply with
            pricing.
          </p>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <a
              href={whatsappLink(quoteText)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Request Quote on WhatsApp
            </a>
            <Link
              href="/#enquiry"
              className="inline-flex items-center justify-center px-6 py-3 bg-white border border-[#003108] text-[#003108] hover:bg-[#003108] hover:text-white text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Send an Enquiry
            </Link>
          </div>
          <p className="mt-3 text-xs text-stone-600">
            Or call{" "}
            <a href={`tel:${SALES_PHONE_TEL}`} className="font-semibold text-[#003108] underline underline-offset-2">
              {SALES_PHONE_DISPLAY}
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Options (colour etc.) for variable products */}
      {isVariable && variationAttributes.length > 0 && (
        <div className="space-y-4 pt-2">
          {variationAttributes.map((attr) => (
            <div key={attr.id || attr.name} className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider font-bold text-[#003108]">Select {attr.name}:</span>
                <span className="font-semibold text-[#8E6935]">{selected[attr.name]}</span>
              </div>
              <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={attr.name}>
                {(attr.options || []).map((opt) => {
                  const isSelected = sameOption(selected[attr.name], opt);
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelected((prev) => ({ ...prev, [attr.name]: opt }))}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-all ${
                        isSelected
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
          ))}

          <p className="text-sm text-stone-700" aria-live="polite">
            {selectedVariation ? (
              <>
                Selected option: <strong className="text-[#003108]">{formatINR(selectedVariation.price)}</strong>
                {!isInStock && <span className="ml-2 text-rose-700">Out of stock</span>}
              </>
            ) : (
              <span className="text-rose-700">This combination is not available. Please choose another option.</span>
            )}
          </p>
        </div>
      )}

      {/* Quantity & primary actions */}
      <div className="pt-2">
        <div className="mb-2">
          <span className="text-xs uppercase tracking-wider font-bold text-[#003108]">Quantity</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center justify-between border border-[#E2D9CF] rounded-lg bg-white px-2.5 h-12 w-32 sm:w-36 flex-shrink-0 shadow-xs">
              <button
                type="button"
                onClick={() => setClamped(quantity - 1)}
                disabled={!canOrder || quantity <= 1}
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
                onChange={(e) => setClamped(e.target.value)}
                disabled={!canOrder}
                className="w-10 text-center text-sm font-bold text-[#003108] bg-transparent border-0 focus:outline-none"
                aria-label="Item quantity"
              />
              <button
                type="button"
                onClick={() => setClamped(quantity + 1)}
                disabled={!canOrder || quantity >= maxStock}
                className="w-8 h-8 flex items-center justify-center text-slate-600 hover:text-[#003108] disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-bold text-base rounded hover:bg-stone-100"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!canOrder || isLoading}
              className="flex-1 h-12 px-4 sm:px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#003108] text-white hover:bg-[#002205] active:scale-[0.99] disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center text-center"
            >
              {isLoading ? "Adding..." : isInStock ? "Add to Cart" : "Out of Stock"}
            </button>
          </div>

          <button
            type="button"
            onClick={handleBuyNow}
            disabled={!canOrder}
            className="w-full h-12 px-6 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#8E6935] text-white hover:bg-[#7A5A2D] active:scale-[0.99] disabled:bg-stone-300 disabled:cursor-not-allowed transition-all shadow-xs flex items-center justify-center text-center"
          >
            Buy Now
          </button>
        </div>

        {addedNotice && (
          <div
            role="status"
            className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-800 flex items-center justify-between"
          >
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

      {/* Corporate B2B bulk quotation callout */}
      <div className="p-4 rounded-xl bg-stone-50 border border-[#E2D9CF] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold text-[#003108] block">Corporate &amp; Bulk Orders</span>
          <span className="text-[11px] text-slate-500 block mt-0.5">
            Volume pricing, corporate logo engraving, custom packaging, and sample kits available.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/#enquiry"
            className="whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-white text-[#8E6935] border border-[#8E6935] hover:bg-[#7A5A2D] hover:text-white transition-all text-center shadow-xs"
          >
            Bulk Enquiry
          </Link>
          <a
            href={`tel:${SALES_PHONE_TEL}`}
            className="whitespace-nowrap px-3 py-2 rounded-lg text-xs font-bold text-[#003108] border border-[#E2D9CF] bg-white hover:bg-stone-100 transition-colors"
          >
            {SALES_PHONE_DISPLAY}
          </a>
        </div>
      </div>

      {/* Trust & executive quality indicators */}
      <div className="pt-4 border-t border-[#E2D9CF] grid grid-cols-3 gap-2 sm:gap-3 text-center">
        {[
          ["Quality Assured", "Verified Materials"],
          ["Custom Branding", "Laser & UV Print"],
          ["Pan-India Dispatch", "Insured Transit"],
        ].map(([title, sub]) => (
          <div
            key={title}
            className="p-2.5 sm:p-3 bg-stone-50 rounded-lg border border-[#E2D9CF]/60 flex flex-col justify-center items-center"
          >
            <div className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#003108]">{title}</div>
            <div className="hidden sm:block text-[10px] text-slate-500 mt-0.5">{sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
