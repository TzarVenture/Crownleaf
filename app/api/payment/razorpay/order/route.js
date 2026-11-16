import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";
import { createRazorpayOrder, loadOwnedOrder, metaValue, razorpayConfigured, toPaise } from "@/lib/razorpay";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

const fail = (error, status) => NextResponse.json({ error }, { status });

// POST { orderId, orderKey } -> creates (or reuses) the Razorpay order for an unpaid WooCommerce order
// and returns what the browser needs to open the Razorpay payment popup.
export async function POST(request) {
  const limit = rateLimit(`rzp-order:${getClientIp(request)}`, { limit: 20, windowMs: 10 * 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  if (!razorpayConfigured()) return fail("Online payment is not configured on this site.", 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid request.", 400);
  }

  try {
    const loaded = await loadOwnedOrder(body?.orderId, body?.orderKey);
    if (loaded.error) return fail(loaded.error, loaded.status);
    const { order } = loaded;

    if (!["pending", "failed"].includes(order.status)) return fail("This order has already been processed.", 409);

    // The amount always comes from the WooCommerce order, never from the browser.
    const amountPaise = toPaise(order.total);
    if (!Number.isInteger(amountPaise) || amountPaise < 100) return fail("This order cannot be paid online.", 400);

    // Reuse the Razorpay order if one was already created for the same amount (e.g. shopper retries).
    let razorpayOrderId = metaValue(order, "_cl_razorpay_order_id");
    if (!razorpayOrderId || Number(metaValue(order, "_cl_razorpay_amount")) !== amountPaise) {
      const rzpOrder = await createRazorpayOrder({
        amountPaise,
        receipt: `cl-${order.number || order.id}`.slice(0, 40),
        notes: { woocommerce_order_id: String(order.id), source: "crownleaf-nextjs" },
      });
      razorpayOrderId = rzpOrder.id;
      await wcApi.put(`orders/${order.id}`, {
        meta_data: [
          { key: "_cl_razorpay_order_id", value: razorpayOrderId },
          { key: "_cl_razorpay_amount", value: String(amountPaise) },
        ],
      });
    }

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      razorpayOrderId,
      amount: amountPaise,
      currency: "INR",
      name: "CrownLeaf",
      description: `Order #${order.number || order.id}`,
      prefill: {
        name: [order.billing?.first_name, order.billing?.last_name].filter(Boolean).join(" "),
        email: order.billing?.email || "",
        contact: order.billing?.phone || "",
      },
    });
  } catch (err) {
    console.error("Razorpay order creation failed:", err?.code || err?.message);
    return fail("We could not start the payment. Please try again.", 502);
  }
}
