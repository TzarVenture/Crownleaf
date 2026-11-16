import { cookies } from "next/headers";
import { WP_URL } from "@/lib/site";

// Helpers for talking to the WooCommerce Store API (cart) from Route Handlers.
// The cart session lives in WordPress; we keep its Cart-Token (and Nonce) in cookies that only
// the server reads, so browser scripts never see them.

export const STORE_API_BASE = `${WP_URL}/wp-json/wc/store/v1`;

const TOKEN_COOKIE = "wc_cart_token";
const NONCE_COOKIE = "wc_cart_nonce";
// WooCommerce issues Cart-Tokens that last 48 hours and re-issues a fresh one on every response,
// so an active shopper's cart never expires. Match that lifetime instead of keeping stale cookies.
const COOKIE_MAX_AGE = 60 * 60 * 24 * 2;

export async function readCartSession() {
  const store = await cookies();
  return {
    token: store.get(TOKEN_COOKIE)?.value || "",
    nonce: store.get(NONCE_COOKIE)?.value || "",
  };
}

export function applyCartSession(response, session) {
  const options = {
    path: "/",
    maxAge: COOKIE_MAX_AGE,
    sameSite: "lax",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  };
  if (session.token) response.cookies.set(TOKEN_COOKIE, session.token, options);
  if (session.nonce) response.cookies.set(NONCE_COOKIE, session.nonce, options);
  return response;
}

function buildHeaders(session) {
  const headers = { "Content-Type": "application/json" };
  if (session.token) headers["Cart-Token"] = session.token;
  if (session.nonce) headers["Nonce"] = session.nonce;
  return headers;
}

/**
 * Call the Store API with the shopper's cart session.
 * Creates a session first when the shopper does not have one yet (needed before any write).
 * Returns { res, data, session } where `session` carries the refreshed token/nonce to persist.
 */
export async function storeFetch(path, { method = "GET", body, session: incoming } = {}) {
  let session = { token: incoming?.token || "", nonce: incoming?.nonce || "" };

  if (!session.token && method !== "GET") {
    const init = await fetch(`${STORE_API_BASE}/cart`, { headers: buildHeaders(session), cache: "no-store" });
    session = {
      token: init.headers.get("cart-token") || "",
      nonce: init.headers.get("nonce") || session.nonce,
    };
  }

  const res = await fetch(`${STORE_API_BASE}${path}`, {
    method,
    headers: buildHeaders(session),
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  return {
    res,
    data,
    session: {
      token: res.headers.get("cart-token") || session.token,
      nonce: res.headers.get("nonce") || session.nonce,
    },
  };
}
