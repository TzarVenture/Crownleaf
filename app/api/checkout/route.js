import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";
import { WP_URL } from "@/lib/site";
import { INDIAN_STATES, INDIAN_STATE_CODES } from "@/lib/states";
import { getShippingOptions } from "@/lib/shipping";
import { validateCoupon } from "@/lib/coupons";
import { applyCartSession, readCartSession, storeFetch } from "@/lib/storeApi";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";
import { clean, isEmail, isGstin, isPinCode, normalizeIndianPhone, stripHtml } from "@/lib/validation";

const MAX_ITEMS = 50;
const MAX_QTY = 9999;

const fail = (message, status = 400, extra = {}) => NextResponse.json({ error: message, ...extra }, { status });

// GET: states, live shipping options and (optionally) one published product
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = Number.parseInt(searchParams.get("productId") || "", 10);

    const shipping = await getShippingOptions();
    let product = null;

    if (Number.isInteger(productId) && productId > 0) {
      // GET /products/{id} ignores the status filter and would return drafts, so use the list
      // endpoint, which honours `status: "publish"` (mandatory rule: published products only).
      const res = await wcApi.get("products", { include: String(productId), status: "publish", per_page: 1 });
      product = res.data?.[0] || null;
      if (!product) return fail("Product not found.", 404, { states: INDIAN_STATES, shipping });
    }

    return NextResponse.json({ states: INDIAN_STATES, shipping, product });
  } catch (err) {
    console.error("Error in GET /api/checkout:", err?.response?.data || err.message);
    return fail("Unable to load checkout details right now.", 502, { states: INDIAN_STATES });
  }
}

// Check every requested line against WooCommerce and return trusted lines + subtotal.
async function verifyItems(rawItems) {
  const items = rawItems.map((it) => ({
    productId: Number.parseInt(it?.productId ?? it?.id, 10),
    variationId: Number.parseInt(it?.variationId, 10) || 0,
    quantity: Number.parseInt(it?.quantity, 10),
  }));

  if (items.some((it) => !Number.isInteger(it.productId) || it.productId < 1 || !Number.isInteger(it.quantity) || it.quantity < 1 || it.quantity > MAX_QTY)) {
    return { error: "Your cart contains an invalid item. Please review your bag." };
  }

  const ids = [...new Set(items.map((it) => it.productId))];
  const productsRes = await wcApi.get("products", { include: ids.join(","), status: "publish", per_page: 100 });
  const products = new Map((productsRes.data || []).map((p) => [p.id, p]));

  const lines = [];
  let subtotal = 0;

  for (const it of items) {
    const product = products.get(it.productId);
    if (!product) return { error: "One of the products in your bag is no longer available." };
    if (!product.purchasable || !product.price) {
      return { error: `"${stripHtml(product.name)}" is available on request only. Please send us a quote request.` };
    }
    if (product.stock_status !== "instock") return { error: `"${stripHtml(product.name)}" is out of stock.` };

    let unitPrice = Number.parseFloat(product.price);
    let variationId = 0;

    if (product.type === "variable") {
      if (!it.variationId) return { error: `Please choose options for "${stripHtml(product.name)}".` };
      const vRes = await wcApi.get(`products/${product.id}/variations/${it.variationId}`);
      const variation = vRes.data;
      if (!variation || !variation.purchasable || variation.stock_status !== "instock") {
        return { error: `The selected option of "${stripHtml(product.name)}" is not available.` };
      }
      variationId = variation.id;
      unitPrice = Number.parseFloat(variation.price);
    }

    if (product.manage_stock && product.stock_quantity != null && it.quantity > product.stock_quantity) {
      return { error: `Only ${product.stock_quantity} of "${stripHtml(product.name)}" are available.` };
    }

    subtotal += unitPrice * it.quantity;
    lines.push({
      product_id: product.id,
      quantity: it.quantity,
      ...(variationId ? { variation_id: variationId } : {}),
    });
  }

  return { lines, subtotal };
}

// POST: create the WooCommerce order and hand the shopper to WooCommerce's secure payment page
export async function POST(request) {
  // Loose limit on every attempt (typos and retries are fine); the strict limit on real order
  // creation is applied below, after the request has passed validation.
  const ip = getClientIp(request);
  const attempts = rateLimit(`checkout-attempt:${ip}`, { limit: 60, windowMs: 10 * 60_000 });
  if (!attempts.ok) return tooManyRequests(attempts.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.");
  }

  // Honeypot: real visitors never fill this hidden field.
  if (clean(body?.website)) return fail("Unable to place your order.");

  // --- Validate contact and address ---------------------------------------------------------
  const b = body?.billing || {};
  const phone = normalizeIndianPhone(clean(b.phone, 20));
  const errors = {};
  if (!clean(b.firstName, 60)) errors.firstName = "Please enter your first name.";
  if (!isEmail(clean(b.email, 254))) errors.email = "Please enter a valid email address.";
  if (!phone) errors.phone = "Please enter a valid 10-digit mobile number.";
  if (!clean(b.address1, 200)) errors.address1 = "Please enter your delivery address.";
  if (!clean(b.city, 80)) errors.city = "Please enter your city.";
  if (!INDIAN_STATE_CODES.has(b.state)) errors.state = "Please choose a valid state.";
  if (!isPinCode(clean(b.postcode, 10))) errors.postcode = "Please enter a valid 6-digit PIN code.";
  if (clean(b.gstin, 20) && !isGstin(clean(b.gstin, 20))) errors.gstin = "Please enter a valid 15-character GSTIN, or leave it blank.";
  const firstError = Object.values(errors)[0];
  if (firstError) return fail(firstError, 400, { fields: errors });

  const rawItems = Array.isArray(body?.items) ? body.items : [];
  if (rawItems.length === 0) return fail("Your bag is empty.");
  if (rawItems.length > MAX_ITEMS) return fail("Too many items in one order. Please contact us for a bulk order.");

  // Strict limit: at most 6 orders per client per 10 minutes
  const orders = rateLimit(`checkout-order:${ip}`, { limit: 6, windowMs: 10 * 60_000 });
  if (!orders.ok) return tooManyRequests(orders.retryAfter);

  try {
    // --- Verify products against WooCommerce (never trust client prices) --------------------
    const verified = await verifyItems(rawItems);
    if (verified.error) return fail(verified.error);

    // --- Shipping and coupon, both from WooCommerce ------------------------------------------
    const shippingOptions = await getShippingOptions();
    const shippingChoice = body?.shippingOption === "express" ? shippingOptions.express : shippingOptions.standard;
    let shippingCost = shippingChoice.cost;

    const couponCode = clean(body?.couponCode, 40);
    let coupon = null;
    if (couponCode) {
      const result = await validateCoupon(couponCode, verified.subtotal);
      if (!result.ok) return fail(result.message);
      coupon = result.coupon;
      if (coupon.freeShipping) shippingCost = 0;
    }

    // --- Create the order ------------------------------------------------------------------
    const mode = body?.mode === "direct" ? "direct" : "cart";
    const address = {
      first_name: clean(b.firstName, 60),
      last_name: clean(b.lastName, 60),
      company: clean(b.company, 100),
      address_1: clean(b.address1, 200),
      address_2: clean(b.address2, 200),
      city: clean(b.city, 80),
      state: b.state,
      postcode: clean(b.postcode, 10),
      country: "IN",
    };

    const orderData = {
      status: "pending",
      payment_method: "razorpay",
      payment_method_title: "Credit Card/Debit Card/NetBanking",
      set_paid: false,
      billing: { ...address, email: clean(b.email, 254).toLowerCase(), phone },
      shipping: address,
      line_items: verified.lines,
      shipping_lines: [
        {
          method_id: shippingChoice.methodId,
          method_title: shippingChoice.title,
          total: shippingCost.toFixed(2),
        },
      ],
      ...(coupon ? { coupon_lines: [{ code: coupon.code }] } : {}),
      customer_note: clean(body?.customerNote, 500),
      meta_data: [
        { key: "_order_source", value: "CrownLeaf Headless Next.js" },
        { key: "_checkout_mode", value: mode },
        ...(clean(b.gstin, 20) ? [{ key: "_billing_gstin", value: clean(b.gstin, 20).toUpperCase() }] : []),
      ],
    };

    const orderResponse = await wcApi.post("orders", orderData);
    const order = orderResponse.data;

    // WooCommerce's own order-pay page collects the payment with the enabled gateway (Razorpay),
    // then sends the customer emails and updates the order status and stock.
    const paymentUrl =
      order.payment_url ||
      `${WP_URL}/checkout/order-pay/${order.id}/?pay_for_order=true&key=${encodeURIComponent(order.order_key)}`;

    const response = NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number || order.id,
      orderKey: order.order_key, // the shopper's proof of ownership, used by the payment routes
      status: order.status,
      total: order.total,
      currency: order.currency_symbol || "₹",
      paymentUrl,
    });

    // An order was placed from the bag: empty the WooCommerce cart session (best effort).
    if (mode === "cart") {
      try {
        const { session } = await storeFetch("/cart/items", { method: "DELETE", session: await readCartSession() });
        applyCartSession(response, session);
      } catch (clearErr) {
        console.warn("Cart session clear after order creation skipped:", clearErr?.message);
      }
    }

    return response;
  } catch (err) {
    console.error("WooCommerce order creation error:", err?.response?.data || err.message);
    const wcMessage = stripHtml(err?.response?.data?.message);
    const isClientError = err?.response?.status >= 400 && err?.response?.status < 500;
    return fail(
      isClientError && wcMessage ? wcMessage : "We could not place your order right now. Please try again, or contact us on WhatsApp.",
      isClientError ? 400 : 502
    );
  }
}
