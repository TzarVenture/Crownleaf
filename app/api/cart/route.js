import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const STORE_API_BASE = "https://crownleaf.co/wp-json/wc/store/v1";

// Helper to normalize Store API cart items and totals
function formatCartData(wcCart) {
  const items = (wcCart.items || []).map((item) => {
    const rawPrice = parseInt(item.prices?.price || "0", 10);
    const unitPrice = rawPrice / 100;
    const lineTotal = parseInt(item.totals?.line_total || "0", 10) / 100;

    return {
      key: item.key,
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      price: unitPrice,
      total: lineTotal,
      currency: item.prices?.currency_symbol || "₹",
      image: item.images?.[0]?.src || item.images?.[0]?.thumbnail || null,
      variation: item.variation || [],
      permalink: item.permalink || "",
      sku: item.sku || "",
    };
  });

  const totalItemsMinor = parseInt(wcCart.totals?.total_items || "0", 10);
  const totalPriceMinor = parseInt(wcCart.totals?.total_price || "0", 10);
  const totalShippingMinor = parseInt(wcCart.totals?.total_shipping || "0", 10);

  return {
    items,
    itemsCount: wcCart.items_count || items.reduce((acc, it) => acc + it.quantity, 0),
    totals: {
      subtotal: totalItemsMinor / 100,
      total: totalPriceMinor / 100,
      shipping: totalShippingMinor / 100,
      currency: wcCart.totals?.currency_symbol || "₹",
    },
    raw: wcCart,
  };
}

// GET: Fetch current user cart from WooCommerce Store API
export async function GET() {
  try {
    const cookieStore = await cookies();
    const cartToken = cookieStore.get("wc_cart_token")?.value || "";
    const cartNonce = cookieStore.get("wc_cart_nonce")?.value || "";

    const headers = {
      "Content-Type": "application/json",
    };
    if (cartToken) headers["Cart-Token"] = cartToken;
    if (cartNonce) headers["Nonce"] = cartNonce;

    const res = await fetch(`${STORE_API_BASE}/cart`, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("WooCommerce Store API GET error:", res.status, errText);
      return NextResponse.json({ error: "Failed to fetch cart from WooCommerce" }, { status: res.status });
    }

    const newCartToken = res.headers.get("cart-token");
    const newCartNonce = res.headers.get("nonce");
    const data = await res.json();
    const formatted = formatCartData(data);

    const response = NextResponse.json(formatted);

    // Persist new token & nonce in cookies if provided
    if (newCartToken) {
      response.cookies.set("wc_cart_token", newCartToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 14, // 14 days
        sameSite: "lax",
        httpOnly: false,
      });
    }
    if (newCartNonce) {
      response.cookies.set("wc_cart_nonce", newCartNonce, {
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
        sameSite: "lax",
        httpOnly: false,
      });
    }

    return response;
  } catch (err) {
    console.error("Error in GET /api/cart:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

// POST: Execute cart operations (add, update, remove, apply-coupon)
export async function POST(req) {
  try {
    const body = await req.json();
    const { action } = body;

    const cookieStore = await cookies();
    let cartToken = cookieStore.get("wc_cart_token")?.value || "";
    let cartNonce = cookieStore.get("wc_cart_nonce")?.value || "";

    // If no cart token or nonce exists, fetch one first
    if (!cartToken || !cartNonce) {
      const initRes = await fetch(`${STORE_API_BASE}/cart`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
      });
      cartToken = initRes.headers.get("cart-token") || cartToken;
      cartNonce = initRes.headers.get("nonce") || cartNonce;
    }

    const headers = {
      "Content-Type": "application/json",
    };
    if (cartToken) headers["Cart-Token"] = cartToken;
    if (cartNonce) headers["Nonce"] = cartNonce;

    let targetEndpoint = "";
    let requestPayload = {};

    switch (action) {
      case "add":
        targetEndpoint = `${STORE_API_BASE}/cart/add-item`;
        requestPayload = {
          id: body.id,
          quantity: body.quantity || 1,
          variation: body.variation || [],
        };
        break;

      case "update":
        targetEndpoint = `${STORE_API_BASE}/cart/update-item`;
        requestPayload = {
          key: body.key,
          quantity: body.quantity,
        };
        break;

      case "remove":
        targetEndpoint = `${STORE_API_BASE}/cart/remove-item`;
        requestPayload = {
          key: body.key,
        };
        break;

      case "coupon":
        targetEndpoint = `${STORE_API_BASE}/cart/apply-coupon`;
        requestPayload = {
          code: body.code,
        };
        break;

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const res = await fetch(targetEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(requestPayload),
      cache: "no-store",
    });

    const newCartToken = res.headers.get("cart-token") || cartToken;
    const newCartNonce = res.headers.get("nonce") || cartNonce;

    if (!res.ok) {
      const errorJson = await res.json().catch(() => ({}));
      console.error("WooCommerce Store API error:", res.status, errorJson);
      return NextResponse.json(
        { error: errorJson.message || "WooCommerce cart action failed", details: errorJson },
        { status: res.status }
      );
    }

    const updatedData = await res.json();
    const formatted = formatCartData(updatedData);

    const response = NextResponse.json(formatted);

    if (newCartToken) {
      response.cookies.set("wc_cart_token", newCartToken, {
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
        sameSite: "lax",
        httpOnly: false,
      });
    }
    if (newCartNonce) {
      response.cookies.set("wc_cart_nonce", newCartNonce, {
        path: "/",
        maxAge: 60 * 60 * 24 * 14,
        sameSite: "lax",
        httpOnly: false,
      });
    }

    return response;
  } catch (err) {
    console.error("Error in POST /api/cart:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
