import { NextResponse } from "next/server";
import { validateCoupon } from "@/lib/coupons";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

// POST { code, subtotal } -> validates the coupon against the coupons that exist in WooCommerce.
// Previously this route accepted hard-coded demo codes that WooCommerce did not know about.
export async function POST(request) {
  const limit = rateLimit(`coupon:${getClientIp(request)}`, { limit: 10, windowMs: 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const subtotal = Number.parseFloat(body?.subtotal) || 0;
  const result = await validateCoupon(body?.code, subtotal);

  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: result.unavailable ? 502 : 400 });
  }
  return NextResponse.json({ success: true, ...result.coupon });
}
