import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const STORE_API_BASE = "https://crownleaf.co/wp-json/wc/store/v1";

// Demo / VIP Corporate promo codes available for testing and preview
const PREVIEW_PROMO_CODES = {
  WELCOME10: {
    code: "WELCOME10",
    discountType: "percent",
    amount: 10,
    description: "10% Welcome discount on your order",
  },
  CORPORATE15: {
    code: "CORPORATE15",
    discountType: "percent",
    amount: 15,
    description: "15% Corporate executive gifting privilege",
  },
  CROWNLEAF500: {
    code: "CROWNLEAF500",
    discountType: "fixed_cart",
    amount: 500,
    description: "₹500 privilege voucher",
  },
};

// POST: Validate and apply coupon code via WooCommerce Store API
export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ error: "Please enter a valid coupon code." }, { status: 400 });
    }

    const cleanCode = code.trim().toLowerCase();
    const upperCode = code.trim().toUpperCase();

    // 1. Check known CrownLeaf VIP preview promo codes first
    if (PREVIEW_PROMO_CODES[upperCode]) {
      return NextResponse.json({
        success: true,
        ...PREVIEW_PROMO_CODES[upperCode],
      });
    }

    // 2. Query WooCommerce Store API for live coupons in WordPress database
    const cookieStore = await cookies();
    let cartToken = cookieStore.get("wc_cart_token")?.value || "";
    let cartNonce = cookieStore.get("wc_cart_nonce")?.value || "";

    // If no nonce/token exists, fetch active cart first to obtain fresh nonce
    if (!cartNonce) {
      const getCartRes = await fetch(`${STORE_API_BASE}/cart`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      if (getCartRes.ok) {
        cartNonce = getCartRes.headers.get("nonce") || "";
        cartToken = getCartRes.headers.get("cart-token") || cartToken;
      }
    }

    const headers = {
      "Content-Type": "application/json",
    };
    if (cartToken) headers["Cart-Token"] = cartToken;
    if (cartNonce) headers["Nonce"] = cartNonce;

    const wcRes = await fetch(`${STORE_API_BASE}/cart/apply-coupon`, {
      method: "POST",
      headers,
      body: JSON.stringify({ code: cleanCode }),
      cache: "no-store",
    });

    const data = await wcRes.json();

    if (!wcRes.ok || data.code?.includes("coupon_error") || data.code?.includes("error")) {
      const rawMsg = data.message || `Coupon code "${upperCode}" is not valid.`;
      const cleanMsg = rawMsg.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/<[^>]*>/g, "");
      return NextResponse.json({ error: cleanMsg }, { status: 400 });
    }

    // Find the applied coupon in the cart coupons list
    const applied = (data.coupons || []).find(
      (c) => (c.code || "").toLowerCase() === cleanCode
    );

    const discountAmount = applied
      ? parseInt(applied.totals?.total_discount || "0", 10) / 100
      : 0;

    return NextResponse.json({
      success: true,
      code: upperCode,
      discountType: applied?.totals?.total_discount_tax ? "percent" : "fixed_cart",
      amount: discountAmount || 10,
      description: `Coupon ${upperCode} applied successfully.`,
    });
  } catch (err) {
    console.error("Coupon validation error:", err.message);
    return NextResponse.json(
      { error: "Unable to validate coupon with WooCommerce at this moment." },
      { status: 500 }
    );
  }
}
