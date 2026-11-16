import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";
import {
  captureRazorpayPayment,
  fetchRazorpayPayment,
  loadOwnedOrder,
  metaValue,
  razorpayConfigured,
  toPaise,
  verifyPaymentSignature,
} from "@/lib/razorpay";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

const fail = (error, status) => NextResponse.json({ error }, { status });

// POST { orderId, orderKey, razorpay_order_id, razorpay_payment_id, razorpay_signature }
// Confirms a payment made in the Razorpay popup and, only then, marks the WooCommerce order as paid.
export async function POST(request) {
  const limit = rateLimit(`rzp-verify:${getClientIp(request)}`, { limit: 30, windowMs: 10 * 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  if (!razorpayConfigured()) return fail("Online payment is not configured on this site.", 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  const { razorpay_order_id: rzpOrderId, razorpay_payment_id: rzpPaymentId, razorpay_signature: signature } = body || {};

  // 1. The signature proves Razorpay (not the browser) produced this payment result.
  if (!verifyPaymentSignature({ orderId: rzpOrderId, paymentId: rzpPaymentId, signature })) {
    return fail("Payment could not be verified.", 400);
  }

  try {
    // 2. The caller must own the WooCommerce order, and it must be the order this payment was made for.
    const loaded = await loadOwnedOrder(body?.orderId, body?.orderKey);
    if (loaded.error) return fail(loaded.error, loaded.status);
    const { order } = loaded;

    if (metaValue(order, "_cl_razorpay_order_id") !== rzpOrderId) return fail("Payment does not match this order.", 400);

    // Already paid (for example WooCommerce's own webhook got there first): nothing more to do.
    if (!["pending", "failed", "on-hold"].includes(order.status)) {
      return NextResponse.json({ success: true, status: order.status, orderNumber: order.number || order.id });
    }

    // 3. Ask Razorpay directly for the payment and check amount, currency and status.
    const amountPaise = toPaise(order.total);
    let payment = await fetchRazorpayPayment(rzpPaymentId);
    if (payment.order_id !== rzpOrderId || payment.amount !== amountPaise || payment.currency !== "INR") {
      return fail("Payment details do not match this order.", 400);
    }
    if (payment.status === "authorized") payment = await captureRazorpayPayment(rzpPaymentId, amountPaise);
    if (payment.status !== "captured") return fail("Payment was not completed.", 402);

    // 4. Mark the order paid. WooCommerce then reduces stock and sends the customer and admin emails.
    const updated = await wcApi.put(`orders/${order.id}`, {
      set_paid: true,
      transaction_id: rzpPaymentId,
      meta_data: [{ key: "_cl_razorpay_payment_id", value: rzpPaymentId }],
    });

    return NextResponse.json({
      success: true,
      status: updated.data?.status || "processing",
      orderNumber: order.number || order.id,
    });
  } catch (err) {
    console.error("Razorpay verification failed:", err?.code || err?.message);
    return fail(
      "We could not confirm your payment yet. If money was deducted, it will be confirmed automatically or we will contact you.",
      502
    );
  }
}
