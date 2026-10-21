"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { INDIAN_STATES } from "@/lib/states";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDirect = searchParams.get("direct") === "1" || searchParams.get("direct") === "true";

  const { cart, refreshCart } = useCart();

  // Direct checkout item stored when clicking "Buy Now"
  const [directItem, setDirectItem] = useState(null);
  const [directLoading, setDirectLoading] = useState(isDirect);

  // Form State
  const [formData, setFormData] = useState({
    email: "",
    createAccount: false,
    country: "India",
    firstName: "",
    lastName: "",
    address: "",
    apartment: "",
    showApartment: false,
    city: "",
    state: "MH",
    pinCode: "",
    phone: "",
    useSameBilling: true,
    addNote: false,
    customerNote: "",
  });

  // Shipping Method: standard (₹80) or express (₹250)
  const [shippingOption, setShippingOption] = useState("standard");

  // Coupons Accordion State
  const [showCouponAccordion, setShowCouponAccordion] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [orderConfirmation, setOrderConfirmation] = useState(null);

  // Load Direct Item from SessionStorage if in direct mode
  useEffect(() => {
    if (isDirect) {
      try {
        const stored = sessionStorage.getItem("crownleaf_direct_checkout");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.product) {
            setDirectItem(parsed);
          }
        }
      } catch (err) {
        console.error("Failed to load direct checkout item:", err);
      } finally {
        setDirectLoading(false);
      }
    } else {
      setDirectLoading(false);
    }
  }, [isDirect]);

  // Compute Items List
  const checkoutItems = useMemo(() => {
    if (isDirect && directItem) {
      const p = directItem.product;
      const unitPrice = parseFloat(p.price || 0);
      const qty = parseInt(directItem.quantity, 10) || 1;

      let variationArray = [];
      if (directItem.selectedAttributes) {
        variationArray = Object.entries(directItem.selectedAttributes).map(([k, v]) => ({
          attribute: k,
          value: v,
        }));
      }

      return [
        {
          key: `direct_${p.id}`,
          id: p.id,
          name: p.name,
          quantity: qty,
          price: unitPrice,
          total: unitPrice * qty,
          image: p.images?.[0]?.src || null,
          variation: variationArray,
          sku: p.sku || "",
        },
      ];
    }

    return (cart.items || []).map((it) => ({
      ...it,
    }));
  }, [isDirect, directItem, cart.items]);

  // Pricing Calculations
  const subtotal = useMemo(() => {
    return checkoutItems.reduce((acc, it) => acc + (it.total || it.price * it.quantity), 0);
  }, [checkoutItems]);

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percent") {
      return (subtotal * appliedCoupon.amount) / 100;
    }
    return Math.min(appliedCoupon.amount, subtotal);
  }, [appliedCoupon, subtotal]);

  // Shipping cost: standard ₹80, express ₹250
  const shippingCost = shippingOption === "express" ? 250 : 80;

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount + (checkoutItems.length > 0 ? shippingCost : 0));
  }, [subtotal, discountAmount, shippingCost, checkoutItems.length]);

  // Format Currency matching crownleaf.co (e.g. ₹899.00)
  const formatPrice = (val) => {
    return `₹${Number(val || 0).toFixed(2)}`;
  };

  // Apply Coupon via WooCommerce API
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setCouponLoading(true);
    setCouponError(null);

    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Invalid coupon code.");
      }

      setAppliedCoupon(data);
      setCouponCode("");
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponError(null);
  };

  // Submit Order to WooCommerce REST API
  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Validation
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setFormError("Please enter a valid email address.");
      window.scrollTo({ top: 180, behavior: "smooth" });
      return;
    }
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError("Please provide your first and last name.");
      window.scrollTo({ top: 240, behavior: "smooth" });
      return;
    }
    if (!formData.address.trim()) {
      setFormError("Please enter your delivery street address.");
      window.scrollTo({ top: 320, behavior: "smooth" });
      return;
    }
    if (!formData.city.trim() || !formData.pinCode.trim()) {
      setFormError("Please provide your city and PIN Code.");
      window.scrollTo({ top: 380, behavior: "smooth" });
      return;
    }

    if (checkoutItems.length === 0) {
      setFormError("Your order has no items to process.");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        mode: isDirect ? "direct" : "cart",
        billing: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || "0000000000",
          company: "",
          address1: formData.address.trim(),
          address2: formData.apartment.trim(),
          city: formData.city.trim(),
          state: formData.state,
          postcode: formData.pinCode.trim(),
          country: "IN",
        },
        shipping: {
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          company: "",
          address1: formData.address.trim(),
          address2: formData.apartment.trim(),
          city: formData.city.trim(),
          state: formData.state,
          postcode: formData.pinCode.trim(),
          country: "IN",
        },
        items: checkoutItems.map((it) => ({
          product_id: it.id,
          id: it.id,
          quantity: it.quantity,
          name: it.name,
          price: it.price,
          variation: it.variation || [],
        })),
        line_items: checkoutItems.map((it) => ({
          product_id: it.id,
          id: it.id,
          quantity: it.quantity,
          name: it.name,
          price: it.price,
          variation: it.variation || [],
        })),
        shippingOption,
        paymentMethod: "razorpay",
        paymentMethodTitle: "Razorpay (Cards, UPI, NetBanking)",
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        gstin: "",
        customerNote: formData.addNote ? formData.customerNote.trim() : "",
      };

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || "Unable to place your order with WooCommerce.");
      }

      if (isDirect) {
        sessionStorage.removeItem("crownleaf_direct_checkout");
      } else {
        refreshCart();
      }

      setOrderConfirmation(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setFormError(err.message);
      window.scrollTo({ top: 180, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Order Confirmation Success Screen
  // -------------------------------------------------------------
  if (orderConfirmation) {
    return (
      <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="border border-stone-200 rounded-lg p-8 sm:p-12 shadow-xs">
            <div className="w-14 h-14 bg-[#17472F]/10 text-[#17472F] rounded-full flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1 className="text-2xl font-serif text-stone-900 mb-2">Thank you for your order!</h1>
            <p className="text-xs text-stone-600 mb-6">
              An order confirmation email has been sent to{" "}
              <span className="font-semibold text-stone-900">{formData.email}</span>.
            </p>

            <div className="bg-[#FAF9F7] border border-stone-200 rounded p-5 text-left text-xs space-y-3 mb-8">
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Order Number</span>
                <span className="font-bold text-stone-900">#{orderConfirmation.orderNumber || orderConfirmation.orderId}</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Payment Option</span>
                <span className="font-medium text-stone-900">Razorpay</span>
              </div>
              <div className="flex justify-between border-b border-stone-200 pb-2">
                <span className="text-stone-500">Delivery Status</span>
                <span className="font-medium text-amber-700 uppercase">Processing</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total Paid</span>
                <span className="font-bold text-stone-900">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            <Link
              href="/"
              className="inline-block px-8 py-3 bg-[#A67D44] hover:bg-[#8E6935] text-white text-xs font-semibold rounded transition"
            >
              Continue Shopping
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // -------------------------------------------------------------
  // Empty Bag Guard
  // -------------------------------------------------------------
  if (!directLoading && checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-20 text-center">
          <div className="border border-stone-200 rounded-lg p-10">
            <h2 className="text-2xl font-serif text-stone-900 mb-2">Your cart is empty</h2>
            <p className="text-xs text-stone-500 mb-8">
              You haven&apos;t added any items to your shopping cart yet.
            </p>
            <Link
              href="/"
              className="inline-block px-8 py-3 bg-[#A67D44] hover:bg-[#8E6935] text-white text-xs font-semibold rounded transition"
            >
              Return to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full">
        {/* Page Title & Breadcrumb (Centered, matching crownleaf.co) */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-serif font-normal text-stone-900 tracking-tight">
            Checkout
          </h1>
          <div className="text-xs text-stone-500 mt-2 flex items-center justify-center gap-1.5">
            <Link href="/" className="hover:underline text-stone-600">
              Home
            </Link>
            <span>&gt;</span>
            <span className="text-stone-400">Checkout</span>
          </div>
        </div>

        {/* Global Error Banner */}
        {formError && (
          <div className="max-w-4xl mx-auto mb-8 p-3.5 bg-red-50 border border-red-200 rounded text-xs text-red-700 flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Checkout Form Sections                      */}
          {/* ======================================================== */}
          <div className="lg:col-span-7 space-y-8">
            {/* 1. Contact Information */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-semibold text-stone-900">Contact information</h2>
                <Link href="/account" className="text-xs text-stone-600 hover:text-stone-900 underline">
                  Log in
                </Link>
              </div>

              <div>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />
              </div>

              <p className="text-[11px] text-stone-500 mt-2">
                You are currently checking out as a guest.
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <input
                  type="checkbox"
                  id="create-account"
                  checked={formData.createAccount}
                  onChange={(e) => setFormData({ ...formData, createAccount: e.target.checked })}
                  className="w-3.5 h-3.5 text-stone-800 border-stone-300 rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="create-account" className="text-xs text-stone-700 select-none cursor-pointer">
                  Create an account with Crown Leaf
                </label>
              </div>
            </div>

            {/* 2. Shipping Address */}
            <div className="space-y-3.5 pt-2">
              <h2 className="text-base font-semibold text-stone-900">Shipping address</h2>

              {/* Country / Region */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider mb-1">
                  Country/region
                </label>
                <div className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-800 bg-white">
                  India
                </div>
              </div>

              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />
                <input
                  type="text"
                  required
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />
              </div>

              {/* Street Address */}
              <div>
                <input
                  type="text"
                  required
                  placeholder="Address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />
              </div>

              {/* Optional Apartment link/toggle */}
              {!formData.showApartment ? (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, showApartment: true })}
                  className="text-xs text-stone-600 hover:text-stone-900 underline block pt-0.5"
                >
                  + Add apartment, suite, etc.
                </button>
              ) : (
                <input
                  type="text"
                  placeholder="Apartment, suite, etc. (optional)"
                  value={formData.apartment}
                  onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition animate-fade-in"
                />
              )}

              {/* City & State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="City"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />

                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 bg-white focus:outline-none focus:border-stone-800 transition"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s.code} value={s.code}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* PIN Code & Phone (optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  required
                  placeholder="PIN Code"
                  value={formData.pinCode}
                  onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />

                <input
                  type="tel"
                  placeholder="Phone (optional)"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />
              </div>

              {/* Checkbox: Use same address for billing */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="same-billing"
                  checked={formData.useSameBilling}
                  onChange={(e) => setFormData({ ...formData, useSameBilling: e.target.checked })}
                  className="w-3.5 h-3.5 text-stone-800 border-stone-300 rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="same-billing" className="text-xs text-stone-800 select-none cursor-pointer">
                  Use same address for billing
                </label>
              </div>
            </div>

            {/* 3. Shipping Options */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-semibold text-stone-900">Shipping options</h2>

              <div className="border border-stone-300 rounded overflow-hidden divide-y divide-stone-200">
                {/* Standard Shipping */}
                <label
                  onClick={() => setShippingOption("standard")}
                  className={`flex items-center justify-between p-3.5 text-xs cursor-pointer transition ${
                    shippingOption === "standard" ? "bg-stone-50/60" : "bg-white hover:bg-stone-50/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={shippingOption === "standard"}
                      onChange={() => setShippingOption("standard")}
                      className="w-3.5 h-3.5 text-stone-900 border-stone-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-stone-900 font-normal">Standard Shipping</span>
                  </div>
                  <span className="text-stone-900 font-medium">₹80.00</span>
                </label>

                {/* Express Shipping */}
                <label
                  onClick={() => setShippingOption("express")}
                  className={`flex items-center justify-between p-3.5 text-xs cursor-pointer transition ${
                    shippingOption === "express" ? "bg-stone-50/60" : "bg-white hover:bg-stone-50/30"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="shipping_method"
                      checked={shippingOption === "express"}
                      onChange={() => setShippingOption("express")}
                      className="w-3.5 h-3.5 text-stone-900 border-stone-300 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-stone-900 font-normal">Express Shipping</span>
                  </div>
                  <span className="text-stone-900 font-medium">₹250.00</span>
                </label>
              </div>
            </div>

            {/* 4. Payment Options */}
            <div className="space-y-3 pt-2">
              <h2 className="text-base font-semibold text-stone-900">Payment options</h2>

              <div className="border border-stone-300 rounded p-4 bg-white">
                <div className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name="payment_option"
                    checked
                    readOnly
                    className="w-3.5 h-3.5 text-stone-900 border-stone-300 mt-0.5 focus:ring-0"
                  />
                  <div>
                    <span className="text-xs font-semibold text-stone-900 block">
                      Pay by Razorpay
                    </span>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      Pay securely by Credit or Debit card or Internet Banking through Razorpay.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 5. Order Note & Footer Action */}
            <div className="space-y-4 pt-2">
              {/* Add a note to your order */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add-note"
                  checked={formData.addNote}
                  onChange={(e) => setFormData({ ...formData, addNote: e.target.checked })}
                  className="w-3.5 h-3.5 text-stone-800 border-stone-300 rounded focus:ring-0 cursor-pointer"
                />
                <label htmlFor="add-note" className="text-xs text-stone-700 select-none cursor-pointer">
                  Add a note to your order
                </label>
              </div>

              {formData.addNote && (
                <textarea
                  rows={3}
                  placeholder="Special instructions for gift delivery or branding..."
                  value={formData.customerNote}
                  onChange={(e) => setFormData({ ...formData, customerNote: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition"
                />
              )}

              {/* Terms disclaimer */}
              <p className="text-[11px] text-stone-500 leading-normal">
                By proceeding with your purchase you agree to our{" "}
                <Link href="https://crownleaf.co/terms-conditions/" target="_blank" className="underline hover:text-stone-800">
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="https://crownleaf.co/privacy-policy/" target="_blank" className="underline hover:text-stone-800">
                  Privacy Policy
                </Link>
              </p>

              {/* Action Buttons Row */}
              <div className="flex items-center justify-between pt-2">
                <Link
                  href="/"
                  className="text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1.5 transition"
                >
                  <span>←</span>
                  <span>Return to Cart</span>
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#A67D44] hover:bg-[#8E6935] text-white text-xs font-semibold rounded tracking-wide transition shadow-xs disabled:opacity-60 cursor-pointer flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Place Order</span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Order Summary Box                          */}
          {/* ======================================================== */}
          <div className="lg:col-span-5">
            <div className="border border-stone-200 rounded-md p-6 bg-[#FAFAFA]/70 space-y-4">
              <h2 className="text-base font-medium text-stone-900">Order summary</h2>

              {/* Products List */}
              <div className="divide-y divide-stone-200">
                {checkoutItems.map((item) => (
                  <div key={item.key} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                    {/* Thumbnail with Quantity Badge */}
                    <div className="relative w-14 h-14 bg-white border border-stone-200 rounded flex-shrink-0 overflow-visible">
                      {item.image ? (
                        <div className="w-full h-full relative overflow-hidden rounded">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="56px"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                          Item
                        </div>
                      )}
                      {/* Quantity Badge on Top-Right Corner */}
                      <span className="absolute -top-2 -right-2 w-5 h-5 bg-stone-700 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                        {item.quantity}
                      </span>
                    </div>

                    {/* Product Name & Unit Price */}
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="text-xs font-normal text-stone-800 leading-snug line-clamp-2">
                        {item.name}
                      </h3>
                      <p className="text-[11px] text-stone-500 mt-1">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Total Price */}
                    <div className="text-right">
                      <span className="text-xs font-semibold text-stone-900 whitespace-nowrap">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Coupons Accordion */}
              <div className="border-t border-b border-stone-200/90 py-3">
                <button
                  type="button"
                  onClick={() => setShowCouponAccordion(!showCouponAccordion)}
                  className="w-full flex items-center justify-between text-xs text-stone-700 font-normal hover:text-stone-900 transition"
                >
                  <span>Add coupons</span>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform ${showCouponAccordion ? "rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCouponAccordion && (
                  <div className="pt-3 animate-fade-in space-y-2">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 bg-stone-100 rounded text-xs">
                        <span className="font-mono font-semibold text-stone-800">
                          {appliedCoupon.code}
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-red-600 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Coupon code"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          className="flex-1 px-3 py-1.5 border border-stone-300 rounded text-xs uppercase placeholder-stone-400 focus:outline-none focus:border-stone-800"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs rounded transition disabled:opacity-50"
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
                  </div>
                )}
              </div>

              {/* Subtotal & Shipping breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>−{formatPrice(discountAmount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600">
                  <span>
                    {shippingOption === "express" ? "Express Shipping" : "Standard Shipping"}
                  </span>
                  <span className="font-medium text-stone-900">{formatPrice(shippingCost)}</span>
                </div>
              </div>

              {/* Final Total */}
              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-stone-900">Total</span>
                <span className="text-xl font-bold text-stone-900 font-mono">
                  {formatPrice(finalTotal)}
                </span>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-[#A67D44]/20 border-t-[#A67D44] rounded-full animate-spin" />
            <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
              Loading Checkout...
            </span>
          </div>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
