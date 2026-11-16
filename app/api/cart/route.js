import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";
import { applyCartSession, readCartSession, storeFetch } from "@/lib/storeApi";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";
import { stripHtml } from "@/lib/validation";

// Cart API backed by the WooCommerce Store API.
// GET  -> current cart
// POST -> { action: "add" | "update" | "remove", ... }

// For a variation, the Store API returns the *variation* ID as the item id and gives no parent ID.
// WooCommerce orders need both, so resolve the parent from the product URL slug (cached).
const parentIdBySlug = new Map();

async function resolveParentProductId(item) {
  if (item.type !== "variation") return item.id;
  const slug = /\/product\/([^/?#]+)/.exec(item.permalink || "")?.[1];
  if (!slug) return item.id;
  if (parentIdBySlug.has(slug)) return parentIdBySlug.get(slug);
  try {
    const res = await wcApi.get("products", { slug, status: "publish", per_page: 1 });
    const id = res.data?.[0]?.id;
    if (id) {
      parentIdBySlug.set(slug, id);
      return id;
    }
  } catch (err) {
    console.warn("Could not resolve parent product for variation:", err?.message);
  }
  return item.id;
}

async function formatCartData(wcCart) {
  const minor = 10 ** (wcCart.totals?.currency_minor_unit ?? 2);
  const items = await Promise.all(
    (wcCart.items || []).map(async (item) => {
      const slug = /\/product\/([^/?#]+)/.exec(item.permalink || "")?.[1];
      const isVariation = item.type === "variation";
      return {
        key: item.key,
        id: item.id,
        productId: await resolveParentProductId(item),
        variationId: isVariation ? item.id : 0,
        name: stripHtml(item.name),
        quantity: item.quantity,
        price: Number.parseInt(item.prices?.price || "0", 10) / minor,
        total: Number.parseInt(item.totals?.line_total || "0", 10) / minor,
        currency: item.prices?.currency_symbol || "₹",
        image: item.images?.[0]?.thumbnail || item.images?.[0]?.src || null,
        variation: (item.variation || []).map((v) => ({ attribute: v.attribute, value: v.value })),
        // Link to our own product page, not the WordPress one
        permalink: slug ? `/product/${slug}` : "",
        sku: item.sku || "",
      };
    })
  );

  return {
    items,
    itemsCount: wcCart.items_count || items.reduce((acc, it) => acc + it.quantity, 0),
    totals: {
      subtotal: Number.parseInt(wcCart.totals?.total_items || "0", 10) / minor,
      total: Number.parseInt(wcCart.totals?.total_price || "0", 10) / minor,
      shipping: Number.parseInt(wcCart.totals?.total_shipping || "0", 10) / minor,
      currency: wcCart.totals?.currency_symbol || "₹",
    },
  };
}

function errorResponse(message, status, session) {
  const response = NextResponse.json({ error: message }, { status });
  return session ? applyCartSession(response, session) : response;
}

// GET: fetch the shopper's current cart
export async function GET(request) {
  const limit = rateLimit(`cart-get:${getClientIp(request)}`, { limit: 120, windowMs: 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  try {
    const { res, data, session } = await storeFetch("/cart", { session: await readCartSession() });
    if (!res.ok) {
      console.error("WooCommerce Store API GET /cart error:", res.status, data?.code);
      return errorResponse("Unable to load your cart right now.", res.status === 401 ? 401 : 502);
    }
    return applyCartSession(NextResponse.json(await formatCartData(data)), session);
  } catch (err) {
    console.error("Error in GET /api/cart:", err);
    return errorResponse("Unable to load your cart right now.", 502);
  }
}

const isId = (v) => Number.isInteger(v) && v > 0;

// POST: add, update or remove a cart item
export async function POST(request) {
  const limit = rateLimit(`cart-post:${getClientIp(request)}`, { limit: 60, windowMs: 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid request.", 400);
  }

  const session = await readCartSession();
  let path;
  let payload;

  switch (body?.action) {
    case "add": {
      const id = Number.parseInt(body.id, 10);
      const variationId = Number.parseInt(body.variationId, 10) || 0;
      const quantity = Number.parseInt(body.quantity, 10) || 1;
      if (!isId(id) || quantity < 1 || quantity > 9999) return errorResponse("Invalid product or quantity.", 400);
      path = "/cart/add-item";
      // A variation ID alone is enough for WooCommerce to add the right variation.
      payload = { id: isId(variationId) ? variationId : id, quantity };
      if (!isId(variationId) && Array.isArray(body.variation) && body.variation.length) {
        payload.variation = body.variation
          .slice(0, 10)
          .map((v) => ({ attribute: String(v.attribute || "").slice(0, 80), value: String(v.value || "").slice(0, 80) }));
      }
      break;
    }
    case "update": {
      const quantity = Number.parseInt(body.quantity, 10);
      if (typeof body.key !== "string" || !body.key || !Number.isInteger(quantity) || quantity < 1 || quantity > 9999) {
        return errorResponse("Invalid quantity.", 400);
      }
      path = "/cart/update-item";
      payload = { key: body.key, quantity };
      break;
    }
    case "remove":
      if (typeof body.key !== "string" || !body.key) return errorResponse("Invalid item.", 400);
      path = "/cart/remove-item";
      payload = { key: body.key };
      break;
    default:
      return errorResponse("Invalid action.", 400);
  }

  try {
    const { res, data, session: nextSession } = await storeFetch(path, { method: "POST", body: payload, session });

    if (!res.ok) {
      console.error("WooCommerce Store API error:", res.status, data?.code);
      const message =
        data?.code === "woocommerce_rest_missing_attributes"
          ? "Please choose all product options first."
          : data?.code === "woocommerce_rest_product_not_purchasable"
          ? "This product is not available to buy online. Please request a quote."
          : stripHtml(data?.message) || "We could not update your cart. Please try again.";
      return errorResponse(message, res.status >= 500 ? 502 : res.status, nextSession);
    }

    return applyCartSession(NextResponse.json(await formatCartData(data)), nextSession);
  } catch (err) {
    console.error("Error in POST /api/cart:", err);
    return errorResponse("We could not update your cart. Please try again.", 502);
  }
}
