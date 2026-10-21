import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { wcApi } from "@/lib/woocommerce";

import { INDIAN_STATES } from "@/lib/states";
export { INDIAN_STATES };

// GET: Retrieve Indian states & validate single product if requested
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    let product = null;
    if (productId) {
      const res = await wcApi.get(`products/${productId}`, {
        status: "publish", // Mandatory rule: Published only
      });
      product = res.data || null;
    }

    return NextResponse.json({
      states: INDIAN_STATES,
      product,
    });
  } catch (err) {
    console.error("Error in GET /api/checkout:", err?.response?.data || err.message);
    return NextResponse.json(
      {
        states: INDIAN_STATES,
        error: "Failed to validate product with WooCommerce",
      },
      { status: 500 }
    );
  }
}

// POST: Create an official order in WooCommerce
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      mode = "cart",
      billing,
      shipping,
      items,
      paymentMethod = "bacs",
      paymentMethodTitle = "Direct Bank Transfer / NEFT / RTGS",
      customerNote = "",
    } = body;

    const rawItems = body.items || body.line_items || [];
    const shippingOption = body.shippingOption || "standard";
    const couponCode = body.couponCode || null;

    // 1. Validation
    if (!billing?.email || !billing?.phone || !billing?.firstName || !billing?.address1 || !billing?.city || !billing?.postcode) {
      return NextResponse.json(
        { error: "Please provide all required billing and contact details." },
        { status: 400 }
      );
    }

    if (!rawItems || !Array.isArray(rawItems) || rawItems.length === 0) {
      return NextResponse.json(
        { error: "No items provided for checkout." },
        { status: 400 }
      );
    }

    // 2. Format Line Items for WooCommerce REST API v3
    const lineItems = rawItems.map((item) => {
      const productId = parseInt(item.product_id || item.id, 10);
      const formatted = {
        product_id: productId,
        quantity: parseInt(item.quantity, 10) || 1,
      };

      if (item.variationId || item.variation_id) {
        formatted.variation_id = parseInt(item.variationId || item.variation_id, 10);
      }

      // Preserve chosen attributes (Color, Size, Custom Branding, etc.) in line item metadata
      if (item.variation && Array.isArray(item.variation) && item.variation.length > 0) {
        formatted.meta_data = item.variation.map((v) => ({
          key: v.attribute || v.name || "Option",
          value: v.value || v.option || "",
        }));
      } else if (item.variation && typeof item.variation === "object") {
        formatted.meta_data = Object.entries(item.variation).map(([k, v]) => ({
          key: k,
          value: String(v),
        }));
      }

      return formatted;
    });

    // 3. Construct Order Payload for WooCommerce REST API v3
    const ship = shipping || billing;
    const orderData = {
      status: "pending",
      payment_method: paymentMethod,
      payment_method_title: paymentMethodTitle,
      set_paid: false,
      billing: {
        first_name: billing.firstName.trim(),
        last_name: (billing.lastName || "").trim(),
        company: (billing.company || "").trim(),
        address_1: billing.address1.trim(),
        address_2: (billing.address2 || "").trim(),
        city: billing.city.trim(),
        state: billing.state || "MH",
        postcode: billing.postcode.trim(),
        country: "IN",
        email: billing.email.trim(),
        phone: billing.phone.trim(),
      },
      shipping: {
        first_name: (ship.firstName || billing.firstName).trim(),
        last_name: (ship.lastName || billing.lastName || "").trim(),
        company: (ship.company || billing.company || "").trim(),
        address_1: (ship.address1 || billing.address1).trim(),
        address_2: (ship.address2 || billing.address2 || "").trim(),
        city: (ship.city || billing.city).trim(),
        state: ship.state || billing.state || "MH",
        postcode: (ship.postcode || billing.postcode).trim(),
        country: "IN",
      },
      line_items: lineItems,
      shipping_lines: [
        {
          method_id: shippingOption === "express" ? "express_shipping" : "flat_rate",
          method_title: shippingOption === "express" ? "Express Shipping" : "Standard Shipping",
          total: shippingOption === "express" ? "250.00" : "80.00",
        },
      ],
      ...(couponCode && typeof couponCode === "string" && couponCode.trim()
        ? { coupon_lines: [{ code: couponCode.trim() }] }
        : {}),
      customer_note: customerNote.trim(),
      meta_data: [
        { key: "_order_source", value: "CrownLeaf Headless Next.js" },
        { key: "_checkout_mode", value: mode },
        ...(billing.gstin ? [{ key: "_billing_gstin", value: billing.gstin.trim() }] : []),
      ],
    };

    // 4. Submit Order to WooCommerce REST API v3
    const orderResponse = await wcApi.post("orders", orderData);
    const order = orderResponse.data;

    // 5. If checkout was from Cart, clear the WooCommerce Store API cart session
    if (mode === "cart") {
      try {
        const cookieStore = await cookies();
        const cartToken = cookieStore.get("wc_cart_token")?.value || "";
        const cartNonce = cookieStore.get("wc_cart_nonce")?.value || "";

        if (cartToken) {
          const STORE_API_BASE = "https://crownleaf.co/wp-json/wc/store/v1";
          const headers = { "Content-Type": "application/json", "Cart-Token": cartToken };
          if (cartNonce) headers["Nonce"] = cartNonce;

          // Clear items from WooCommerce Store API cart
          await fetch(`${STORE_API_BASE}/cart/items`, {
            method: "DELETE",
            headers,
          });
        }
      } catch (clearErr) {
        console.warn("Notice: Cart session clear after order creation skipped:", clearErr?.message);
      }
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number || order.id,
      status: order.status,
      total: order.total,
      currency: order.currency_symbol || "₹",
      dateCreated: order.date_created,
      billing: order.billing,
      shipping: order.shipping,
      lineItems: order.line_items,
    });
  } catch (err) {
    console.error("WooCommerce Order Creation Error:", err?.response?.data || err.message);
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "An unexpected error occurred while communicating with WooCommerce. Please try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
