"use client";

import { useState, useEffect, useMemo, useSyncExternalStore, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useCart } from "@/context/CartContext";
import { DIRECT_CHECKOUT_KEY } from "@/components/ProductActions";
import { INDIAN_STATES } from "@/lib/states";
import { formatINR } from "@/lib/site";
import { isEmail, isGstin, isPinCode, normalizeIndianPhone } from "@/lib/validation";

const DEFAULT_SHIPPING = {
  standard: { title: "Standard Shipping", cost: 80 },
  express: { title: "Express Shipping", cost: 250 },
};

const inputClass =
  "w-full px-3.5 py-2.5 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800 transition bg-white";

const noopSubscribe = () => () => {};

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";
let razorpayScriptPromise = null;

// Loads the Razorpay checkout script once, when the shopper actually needs to pay.
function loadRazorpayScript() {
  if (typeof window !== "undefined" && window.Razorpay) return Promise.resolve(true);
  if (!razorpayScriptPromise) {
    razorpayScriptPromise = new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => {
        razorpayScriptPromise = null;
        resolve(false);
      };
      document.body.appendChild(script);
    });
  }
  return razorpayScriptPromise;
}

function Field({ id, label, error, optional, className = "", children }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-[11px] font-semibold text-stone-700 mb-1">
        {label}
        {optional && <span className="font-normal text-stone-500"> (optional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-[11px] text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const isDirect = searchParams.get("direct") === "1" || searchParams.get("direct") === "true";

  const { cart, cartReady, refreshCart } = useCart();

  // "Buy now" item saved in sessionStorage by the product page. Read through useSyncExternalStore so
  // the server render and first client render agree.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const rawDirect = useSyncExternalStore(
    noopSubscribe,
    () => {
      try {
        return isDirect ? sessionStorage.getItem(DIRECT_CHECKOUT_KEY) : null;
      } catch {
        return null;
      }
    },
    () => null
  );
  const directItem = useMemo(() => {
    try {
      return rawDirect ? JSON.parse(rawDirect) : null;
    } catch {
      return null;
    }
  }, [rawDirect]);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    company: "",
    gstin: "",
    address: "",
    apartment: "",
    showApartment: false,
    city: "",
    state: "MH",
    pinCode: "",
    addNote: false,
    customerNote: "",
    website: "", // honeypot, must stay empty
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const update = (patch) => setFormData((prev) => ({ ...prev, ...patch }));

  // Shipping options come from WooCommerce
  const [shipping, setShipping] = useState(DEFAULT_SHIPPING);
  const [shippingOption, setShippingOption] = useState("standard");
  useEffect(() => {
    let ignore = false;
    fetch("/api/checkout")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.shipping) setShipping(data.shipping);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, []);

  // Coupon
  const [showCouponAccordion, setShowCouponAccordion] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);

  // Payment window state once the order has been created
  const [payment, setPayment] = useState({ status: "idle", message: "" });

  const payForOrder = async (order) => {
    setPayment({ status: "opening", message: "" });
    try {
      const res = await fetch("/api/payment/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: order.orderId, orderKey: order.orderKey }),
      });
      const data = await res.json().catch(() => ({}));

      // Online payment not configured on this site: fall back to the WooCommerce payment page
      if (res.status === 503 && order.paymentUrl) {
        window.location.assign(order.paymentUrl);
        return;
      }
      if (!res.ok) throw new Error(data.error || "We could not start the payment. Please try again.");

      const loaded = await loadRazorpayScript();
      if (!loaded || !window.Razorpay) {
        throw new Error("The payment window could not be loaded. Please check your connection and try again.");
      }

      const popup = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: data.name,
        description: data.description,
        order_id: data.razorpayOrderId,
        prefill: data.prefill,
        theme: { color: "#003108" },
        modal: {
          ondismiss: () =>
            setPayment((prev) =>
              prev.status === "processing" || prev.status === "paid"
                ? prev
                : {
                    status: "dismissed",
                    message: "Payment was not completed. Your order is saved, so you can pay whenever you are ready.",
                  }
            ),
        },
        handler: async (response) => {
          setPayment({ status: "processing", message: "" });
          try {
            const verify = await fetch("/api/payment/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: order.orderId, orderKey: order.orderKey, ...response }),
            });
            const verified = await verify.json().catch(() => ({}));
            if (!verify.ok) throw new Error(verified.error || "We could not confirm your payment yet.");
            setPayment({ status: "paid", message: "" });
          } catch (err) {
            setPayment({ status: "failed", message: err.message });
          }
        },
      });
      popup.on("payment.failed", (event) =>
        setPayment({ status: "failed", message: event?.error?.description || "The payment failed. Please try again." })
      );
      popup.open();
      setPayment({ status: "awaiting", message: "" });
    } catch (err) {
      setPayment({ status: "failed", message: err.message });
    }
  };

  // Items being purchased
  const checkoutItems = useMemo(() => {
    if (isDirect) {
      if (!directItem?.product) return [];
      const qty = Number.parseInt(directItem.quantity, 10) || 1;
      const unitPrice = Number.parseFloat(directItem.unitPrice) || 0;
      return [
        {
          key: `direct_${directItem.product.id}_${directItem.variationId || 0}`,
          productId: directItem.product.id,
          variationId: directItem.variationId || 0,
          name: directItem.product.name,
          quantity: qty,
          price: unitPrice,
          total: unitPrice * qty,
          image: directItem.product.image || null,
          variation: directItem.variation || [],
        },
      ];
    }
    return cart.items || [];
  }, [isDirect, directItem, cart.items]);

  const subtotal = useMemo(
    () => checkoutItems.reduce((acc, it) => acc + (it.total ?? it.price * it.quantity), 0),
    [checkoutItems]
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percent") return (subtotal * appliedCoupon.amount) / 100;
    return Math.min(appliedCoupon.amount, subtotal);
  }, [appliedCoupon, subtotal]);

  const chosenShipping = shipping[shippingOption] || DEFAULT_SHIPPING.standard;
  const shippingCost = appliedCoupon?.freeShipping ? 0 : chosenShipping.cost;
  const finalTotal = Math.max(0, subtotal - discountAmount + (checkoutItems.length > 0 ? shippingCost : 0));

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError(null);
    try {
      const res = await fetch("/api/cart/coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Invalid coupon code.");
      setAppliedCoupon(data);
      setCouponCode("");
    } catch (err) {
      setCouponError(err.message);
    } finally {
      setCouponLoading(false);
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "Please enter your first name.";
    if (!isEmail(formData.email)) errors.email = "Please enter a valid email address.";
    if (!normalizeIndianPhone(formData.phone)) errors.phone = "Please enter a valid 10-digit mobile number.";
    if (!formData.address.trim()) errors.address = "Please enter your delivery address.";
    if (!formData.city.trim()) errors.city = "Please enter your city.";
    if (!isPinCode(formData.pinCode)) errors.pinCode = "Please enter a valid 6-digit PIN code.";
    if (formData.gstin.trim() && !isGstin(formData.gstin)) errors.gstin = "Enter a valid 15-character GSTIN, or leave blank.";
    return errors;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (checkoutItems.length === 0) {
      setFormError("Your bag is empty.");
      return;
    }
    const errors = validate();
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setFormError("Please correct the highlighted fields.");
      document.getElementById(`field-${Object.keys(errors)[0]}`)?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: isDirect ? "direct" : "cart",
          billing: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            email: formData.email.trim(),
            phone: formData.phone.trim(),
            company: formData.company.trim(),
            gstin: formData.gstin.trim().toUpperCase(),
            address1: formData.address.trim(),
            address2: formData.apartment.trim(),
            city: formData.city.trim(),
            state: formData.state,
            postcode: formData.pinCode.trim(),
          },
          // Only IDs and quantities are sent. Prices are always taken from WooCommerce.
          items: checkoutItems.map((it) => ({
            productId: it.productId,
            variationId: it.variationId || 0,
            quantity: it.quantity,
          })),
          shippingOption,
          couponCode: appliedCoupon ? appliedCoupon.code : "",
          customerNote: formData.addNote ? formData.customerNote.trim() : "",
          website: formData.website,
        }),
      });

      const result = await res.json().catch(() => ({}));
      if (!res.ok) {
        if (result.fields) setFieldErrors(result.fields);
        throw new Error(result.error || "We could not place your order. Please try again.");
      }

      if (isDirect) {
        try {
          sessionStorage.removeItem(DIRECT_CHECKOUT_KEY);
        } catch {
          // Nothing to clean up if storage is unavailable.
        }
      } else {
        refreshCart();
      }

      setPlacedOrder(result);
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Open the Razorpay payment window for this order
      payForOrder(result);
    } catch (err) {
      setFormError(err.message);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ---------------- Order placed: payment ----------------
  if (placedOrder) {
    const isPaid = payment.status === "paid";
    const needsRetry = payment.status === "dismissed" || payment.status === "failed";
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
        <Navbar />
        <main id="main-content" className="max-w-2xl mx-auto px-4 py-16 text-center w-full">
          <div className="border border-stone-200 bg-white rounded-lg p-8 sm:p-12 shadow-xs" role="status" aria-live="polite">
            {isPaid ? (
              <>
                <h1 className="text-2xl font-bold text-[#003108] mb-2">Payment received</h1>
                <p className="text-sm text-stone-700 mb-1">
                  Order #{placedOrder.orderNumber} is confirmed. Amount paid: <strong>{formatINR(placedOrder.total)}</strong>
                </p>
                <p className="text-xs text-stone-600 mb-8">A confirmation email is on its way to {formData.email}.</p>
                <Link
                  href="/products"
                  className="inline-block px-8 py-3 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider transition"
                >
                  Continue shopping
                </Link>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-[#003108] mb-2">Order #{placedOrder.orderNumber} created</h1>
                <p className="text-sm text-stone-700 mb-1">
                  Total to pay: <strong>{formatINR(placedOrder.total)}</strong>
                </p>
                {payment.status === "processing" ? (
                  <p className="text-xs text-stone-600 mb-2">Confirming your payment. Please do not close this page.</p>
                ) : needsRetry ? (
                  <>
                    <p role="alert" className="text-xs text-red-800 mb-6 max-w-md mx-auto">
                      {payment.message}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <button
                        type="button"
                        onClick={() => payForOrder(placedOrder)}
                        className="px-8 py-3 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider transition"
                      >
                        Pay now
                      </button>
                      {placedOrder.paymentUrl && (
                        <a
                          href={placedOrder.paymentUrl}
                          className="px-8 py-3 bg-white border border-[#003108] text-[#003108] hover:bg-[#003108] hover:text-white text-xs font-bold uppercase tracking-wider transition"
                        >
                          Use our payment page
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-stone-600 mb-2">Opening the secure payment window...</p>
                )}
              </>
            )}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ---------------- Empty bag ----------------
  const stillLoading = !mounted || (!isDirect && !cartReady);
  if (!stillLoading && checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
        <Navbar />
        <main id="main-content" className="max-w-xl mx-auto px-4 py-20 text-center w-full">
          <div className="border border-stone-200 bg-white rounded-lg p-10">
            <h1 className="text-2xl font-bold text-[#003108] mb-2">Your bag is empty</h1>
            <p className="text-xs text-stone-600 mb-8">You haven&apos;t added any items yet.</p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider transition"
            >
              Browse Corporate Gifts
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const showErr = (name) => fieldErrors[name];
  const errProps = (name) => ({
    "aria-invalid": showErr(name) ? true : undefined,
    "aria-describedby": showErr(name) ? `field-${name}-error` : undefined,
  });
  // Field ids double as the focus target after a failed validation
  const idOf = (name) => `field-${name}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col justify-between">
      <Navbar />

      <main id="main-content" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#003108] tracking-tight">Checkout</h1>
          <div className="text-xs text-stone-600 mt-2 flex items-center justify-center gap-1.5">
            <Link href="/" className="hover:underline">
              Home
            </Link>
            <span aria-hidden="true">&gt;</span>
            <span className="text-stone-500">Checkout</span>
          </div>
        </div>

        {formError && (
          <div
            role="alert"
            className="max-w-4xl mx-auto mb-8 p-3.5 bg-red-50 border border-red-200 rounded text-xs text-red-800 flex items-center gap-2"
          >
            <svg className="w-4 h-4 flex-shrink-0 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmitOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* LEFT COLUMN: details */}
          <div className="lg:col-span-7 space-y-8">
            {/* Honeypot (hidden from people and assistive tech) */}
            <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="checkout-website">Leave this field empty</label>
              <input
                id="checkout-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={formData.website}
                onChange={(e) => update({ website: e.target.value })}
              />
            </div>

            {/* 1. Contact */}
            <section aria-labelledby="contact-heading" className="space-y-3.5">
              <h2 id="contact-heading" className="text-base font-semibold text-stone-900">
                Contact information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id={idOf("email")} label="Email address" error={showErr("email")}>
                  <input
                    id={idOf("email")}
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={(e) => update({ email: e.target.value })}
                    className={inputClass}
                    {...errProps("email")}
                  />
                </Field>
                <Field id={idOf("phone")} label="Mobile number" error={showErr("phone")}>
                  <input
                    id={idOf("phone")}
                    type="tel"
                    autoComplete="tel"
                    inputMode="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={(e) => update({ phone: e.target.value })}
                    className={inputClass}
                    {...errProps("phone")}
                  />
                </Field>
              </div>
              <p className="text-[11px] text-stone-600">
                You are checking out as a guest. Order updates are sent to this email and mobile number.
              </p>
            </section>

            {/* 2. Delivery address */}
            <section aria-labelledby="address-heading" className="space-y-3.5">
              <h2 id="address-heading" className="text-base font-semibold text-stone-900">
                Delivery address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id={idOf("firstName")} label="First name" error={showErr("firstName")}>
                  <input
                    id={idOf("firstName")}
                    type="text"
                    autoComplete="given-name"
                    required
                    value={formData.firstName}
                    onChange={(e) => update({ firstName: e.target.value })}
                    className={inputClass}
                    {...errProps("firstName")}
                  />
                </Field>
                <Field id={idOf("lastName")} label="Last name" optional>
                  <input
                    id={idOf("lastName")}
                    type="text"
                    autoComplete="family-name"
                    value={formData.lastName}
                    onChange={(e) => update({ lastName: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id={idOf("company")} label="Company name" optional>
                  <input
                    id={idOf("company")}
                    type="text"
                    autoComplete="organization"
                    value={formData.company}
                    onChange={(e) => update({ company: e.target.value })}
                    className={inputClass}
                  />
                </Field>
                <Field id={idOf("gstin")} label="GSTIN (for a GST invoice)" optional error={showErr("gstin")}>
                  <input
                    id={idOf("gstin")}
                    type="text"
                    autoCapitalize="characters"
                    maxLength={15}
                    value={formData.gstin}
                    onChange={(e) => update({ gstin: e.target.value.toUpperCase() })}
                    className={inputClass}
                    {...errProps("gstin")}
                  />
                </Field>
              </div>

              <Field id={idOf("address")} label="Address" error={showErr("address")}>
                <input
                  id={idOf("address")}
                  type="text"
                  autoComplete="address-line1"
                  required
                  value={formData.address}
                  onChange={(e) => update({ address: e.target.value })}
                  className={inputClass}
                  {...errProps("address")}
                />
              </Field>

              {!formData.showApartment ? (
                <button
                  type="button"
                  onClick={() => update({ showApartment: true })}
                  className="text-xs text-stone-700 hover:text-stone-900 underline block pt-0.5"
                >
                  + Add apartment, suite, etc.
                </button>
              ) : (
                <Field id={idOf("apartment")} label="Apartment, suite, etc." optional>
                  <input
                    id={idOf("apartment")}
                    type="text"
                    autoComplete="address-line2"
                    value={formData.apartment}
                    onChange={(e) => update({ apartment: e.target.value })}
                    className={inputClass}
                  />
                </Field>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id={idOf("city")} label="City" error={showErr("city")}>
                  <input
                    id={idOf("city")}
                    type="text"
                    autoComplete="address-level2"
                    required
                    value={formData.city}
                    onChange={(e) => update({ city: e.target.value })}
                    className={inputClass}
                    {...errProps("city")}
                  />
                </Field>
                <Field id={idOf("state")} label="State">
                  <select
                    id={idOf("state")}
                    autoComplete="address-level1"
                    value={formData.state}
                    onChange={(e) => update({ state: e.target.value })}
                    className={inputClass}
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s.code} value={s.code}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field id={idOf("pinCode")} label="PIN code" error={showErr("pinCode")}>
                  <input
                    id={idOf("pinCode")}
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    required
                    value={formData.pinCode}
                    onChange={(e) => update({ pinCode: e.target.value.replace(/\D/g, "") })}
                    className={inputClass}
                    {...errProps("pinCode")}
                  />
                </Field>
                <Field id="field-country" label="Country">
                  <input id="field-country" type="text" value="India" readOnly className={`${inputClass} bg-stone-50`} />
                </Field>
              </div>
              <p className="text-[11px] text-stone-600">Your billing address is the same as this delivery address.</p>
            </section>

            {/* 3. Shipping options */}
            <fieldset className="space-y-3">
              <legend className="text-base font-semibold text-stone-900 mb-3">Shipping options</legend>
              <div className="border border-stone-300 rounded overflow-hidden divide-y divide-stone-200 bg-white">
                {["standard", "express"].map((key) => (
                  <label
                    key={key}
                    className={`flex items-center justify-between p-3.5 text-xs cursor-pointer transition ${
                      shippingOption === key ? "bg-stone-50" : "hover:bg-stone-50/50"
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping_method"
                        checked={shippingOption === key}
                        onChange={() => setShippingOption(key)}
                        className="w-3.5 h-3.5 accent-[#003108] cursor-pointer"
                      />
                      <span className="text-stone-900">{shipping[key]?.title}</span>
                    </span>
                    <span className="text-stone-900 font-medium">
                      {appliedCoupon?.freeShipping ? "Free" : formatINR(shipping[key]?.cost)}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* 4. Payment */}
            <section aria-labelledby="payment-heading" className="space-y-3">
              <h2 id="payment-heading" className="text-base font-semibold text-stone-900">
                Payment
              </h2>
              <div className="border border-stone-300 rounded p-4 bg-white">
                <span className="text-xs font-semibold text-stone-900 block">Pay online with Razorpay</span>
                <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                  Cards, UPI and net banking. After you place the order you are taken to our secure payment page to
                  complete payment. Your order is confirmed once payment succeeds.
                </p>
              </div>
            </section>

            {/* 5. Note and submit */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="add-note"
                  checked={formData.addNote}
                  onChange={(e) => update({ addNote: e.target.checked })}
                  className="w-3.5 h-3.5 accent-[#003108] cursor-pointer"
                />
                <label htmlFor="add-note" className="text-xs text-stone-700 select-none cursor-pointer">
                  Add a note to your order
                </label>
              </div>

              {formData.addNote && (
                <div>
                  <label htmlFor="order-note" className="sr-only">
                    Order note
                  </label>
                  <textarea
                    id="order-note"
                    rows={3}
                    maxLength={500}
                    placeholder="Special instructions for gift delivery or branding..."
                    value={formData.customerNote}
                    onChange={(e) => update({ customerNote: e.target.value })}
                    className={inputClass}
                  />
                </div>
              )}

              <p className="text-[11px] text-stone-600 leading-normal">
                By placing your order you agree to our{" "}
                <a href="https://crownleaf.co/terms-conditions/" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-900">
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a href="https://crownleaf.co/privacy-policy/" target="_blank" rel="noopener noreferrer" className="underline hover:text-stone-900">
                  Privacy Policy
                </a>
                .
              </p>

              <div className="flex items-center justify-between pt-2">
                <Link href="/products" className="text-xs text-stone-700 hover:text-stone-900 flex items-center gap-1.5 transition">
                  <span aria-hidden="true">←</span>
                  <span>Continue shopping</span>
                </Link>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 bg-[#8E6935] hover:bg-[#7A5A2D] text-white text-xs font-bold uppercase tracking-wider rounded transition shadow-xs disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? "Placing order..." : "Place order and pay"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: order summary */}
          <aside className="lg:col-span-5" aria-label="Order summary">
            <div className="border border-stone-200 rounded-md p-6 bg-white space-y-4">
              <h2 className="text-base font-semibold text-stone-900">Order summary</h2>

              {stillLoading ? (
                <p className="text-xs text-stone-500">Loading your bag...</p>
              ) : (
                <div className="divide-y divide-stone-200">
                  {checkoutItems.map((item) => (
                    <div key={item.key} className="py-3.5 first:pt-0 last:pb-0 flex items-center gap-3.5">
                      <div className="relative w-14 h-14 bg-white border border-stone-200 rounded flex-shrink-0 overflow-visible">
                        {item.image ? (
                          <div className="w-full h-full relative overflow-hidden rounded">
                            <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                          </div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">Item</div>
                        )}
                        <span className="absolute -top-2 -right-2 w-5 h-5 bg-stone-700 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-xs">
                          {item.quantity}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="text-xs text-stone-800 leading-snug line-clamp-2">{item.name}</h3>
                        {item.variation?.length > 0 && (
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {item.variation.map((v) => `${v.attribute}: ${v.value}`).join(", ")}
                          </p>
                        )}
                        <p className="text-[11px] text-stone-500 mt-1">{formatINR(item.price)}</p>
                      </div>

                      <span className="text-xs font-semibold text-stone-900 whitespace-nowrap">
                        {formatINR(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupons */}
              <div className="border-t border-b border-stone-200 py-3">
                <button
                  type="button"
                  onClick={() => setShowCouponAccordion(!showCouponAccordion)}
                  aria-expanded={showCouponAccordion}
                  className="w-full flex items-center justify-between text-xs text-stone-700 hover:text-stone-900 transition"
                >
                  <span>Add coupon</span>
                  <svg className={`w-3.5 h-3.5 transition-transform ${showCouponAccordion ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showCouponAccordion && (
                  <div className="pt-3 space-y-2">
                    {appliedCoupon ? (
                      <div className="flex items-center justify-between p-2 bg-stone-100 rounded text-xs">
                        <span className="font-mono font-semibold text-stone-800">{appliedCoupon.code}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setAppliedCoupon(null);
                            setCouponError(null);
                          }}
                          className="text-[11px] text-red-700 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <label htmlFor="coupon-code" className="sr-only">
                          Coupon code
                        </label>
                        <input
                          id="coupon-code"
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
                          {couponLoading ? "Checking..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p role="alert" className="text-[11px] text-red-700">
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{formatINR(subtotal)}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-800">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>−{formatINR(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-stone-600">
                  <span>{chosenShipping.title}</span>
                  <span className="font-medium text-stone-900">{shippingCost === 0 ? "Free" : formatINR(shippingCost)}</span>
                </div>
              </div>

              <div className="border-t border-stone-200 pt-3 flex justify-between items-baseline">
                <span className="text-sm font-semibold text-stone-900">Total</span>
                <span className="text-xl font-bold text-stone-900">{formatINR(finalTotal)}</span>
              </div>
              <p className="text-[11px] text-stone-500 leading-relaxed">
                Final amount, including any taxes and discounts, is confirmed by our store when you pay.
              </p>
            </div>
          </aside>
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
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
          <span className="text-xs font-medium text-stone-600 uppercase tracking-wider">Loading checkout...</span>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
