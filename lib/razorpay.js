import crypto from "node:crypto";
import { wcApi } from "@/lib/woocommerce";

// Server-side Razorpay helpers. RAZORPAY_KEY_SECRET must never reach the browser.

const API = "https://api.razorpay.com/v1";

export const razorpayConfigured = () => Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

function authHeader() {
  const token = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
  return `Basic ${token}`;
}

async function razorpayRequest(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: authHeader(), "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error = new Error(data?.error?.description || `Razorpay request failed (${res.status})`);
    error.status = res.status;
    error.code = data?.error?.code;
    throw error;
  }
  return data;
}

export const createRazorpayOrder = ({ amountPaise, receipt, notes }) =>
  razorpayRequest("/orders", {
    method: "POST",
    body: { amount: amountPaise, currency: "INR", receipt, notes, payment_capture: 1 },
  });

export const fetchRazorpayPayment = (paymentId) => razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);

export const captureRazorpayPayment = (paymentId, amountPaise) =>
  razorpayRequest(`/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: "POST",
    body: { amount: amountPaise, currency: "INR" },
  });

// Razorpay signs "<razorpay_order_id>|<razorpay_payment_id>" with the key secret (HMAC SHA256, hex).
export function verifyPaymentSignature({ orderId, paymentId, signature, secret = process.env.RAZORPAY_KEY_SECRET }) {
  if (!orderId || !paymentId || !signature || !secret) return false;
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex");
  const a = Buffer.from(expected);
  const b = Buffer.from(String(signature));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

const safeEqual = (a, b) => {
  const x = Buffer.from(String(a ?? ""));
  const y = Buffer.from(String(b ?? ""));
  return x.length === y.length && x.length > 0 && crypto.timingSafeEqual(x, y);
};

/**
 * Load a WooCommerce order and prove the caller owns it: the order key is only known to the shopper
 * who just placed the order (it is the same secret WooCommerce puts in its own pay-for-order links).
 * Returns { order } or { error, status }.
 */
export async function loadOwnedOrder(orderId, orderKey) {
  const id = Number.parseInt(orderId, 10);
  if (!Number.isInteger(id) || id < 1 || typeof orderKey !== "string" || !orderKey) {
    return { error: "Invalid order.", status: 400 };
  }
  let order;
  try {
    order = (await wcApi.get(`orders/${id}`)).data;
  } catch (err) {
    if (err?.response?.status === 404) return { error: "Order not found.", status: 404 };
    throw err;
  }
  if (!safeEqual(order.order_key, orderKey)) return { error: "Order not found.", status: 404 };
  if (order.payment_method !== "razorpay") return { error: "This order is not payable online.", status: 400 };
  return { order };
}

export const metaValue = (order, key) => order.meta_data?.find((m) => m.key === key)?.value;
export const toPaise = (total) => Math.round(Number.parseFloat(total) * 100);
