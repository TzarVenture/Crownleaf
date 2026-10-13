# WordPress & WooCommerce REST API Specification

This document serves as the comprehensive API reference, architectural blueprint, and contract for the **CrownLeaf** Headless Next.js storefront powered by WordPress and WooCommerce.

---

## 1. Architectural Overview & Security Boundary

```
┌─────────────────────────────────┐                 ┌─────────────────────────────────┐
│     Next.js Frontend (Client)   │                 │   WordPress + WooCommerce (API) │
│                                 │                 │                                 │
│  - React Server Components (RSC)│ ── Server Fetch ─▶  WooCommerce REST API (v3)     │
│    (uses secret Consumer Keys)  │    (HTTPS)      │  - Products, Stock, Orders      │
│                                 │                 │                                 │
│  - Client Components (Browser)  │ ── Public Fetch ─▶  WooCommerce Store API         │
│    (uses Cart-Token session)    │    (Session)    │  - Cart, Items, Checkout        │
└─────────────────────────────────┘                 └─────────────────────────────────┘
```

### Security Rules:
* **Admin Consumer Keys (`WC_CONSUMER_KEY`, `WC_CONSUMER_SECRET`)** must **NEVER** be exposed to client-side code (`browser`). All requests using these keys must execute in **Server Components**, **Server Actions**, or **Route Handlers** (`/api/...`).
* **Client-side interactions** (like cart updates) must use the public **WooCommerce Store API** (`/wp-json/wc/store/v1/...`) with a session-based `Cart-Token` header.

---

## 2. Catalog & Inventory API (Published Products Only)

### ⚠️ Critical Rule: Filtering Out Drafts
Because requests authenticate using admin API keys, WooCommerce returns **all** products (including `draft`, `private`, and `pending`) by default.
* **Mandatory Parameter**: Every product listing and detail query **MUST** include `status: "publish"`.

### 2.1 Fetch Product Catalog
* **Endpoint**: `GET /wp-json/wc/v3/products`
* **Official Docs**: [WooCommerce Products API Reference](https://developer.woocommerce.com/docs/apis/rest-api/v3/products/)
* **Method**: `GET`
* **Query Parameters**:
  | Parameter | Type | Required | Description |
  | :--- | :--- | :--- | :--- |
  | `status` | string | **Yes** | Must be set to `"publish"` to exclude drafts and private items |
  | `per_page` | integer | No | Items per page (default: `10`, max: `100`) |
  | `page` | integer | No | Page number for pagination |
  | `category` | integer | No | Category ID to filter by |
  | `stock_status` | string | No | `"instock"`, `"outofstock"`, or `"onbackorder"` |
  | `search` | string | No | Search string to match titles, descriptions, and SKUs |
  | `min_price` | string | No | Minimum price filter (e.g., `"1000"`) |
  | `max_price` | string | No | Maximum price filter (e.g., `"2500"`) |
  | `orderby` | string | No | `"date"`, `"title"`, `"price"`, `"popularity"`, `"rating"` |
  | `order` | string | No | `"asc"` or `"desc"` (default: `"desc"`) |

#### Example Server-Side Call:
```js
import { wcApi } from "@/lib/woocommerce";

export async function getPublishedProducts(page = 1, perPage = 18) {
  const response = await wcApi.get("products", {
    status: "publish",
    per_page: perPage,
    page: page,
  });
  return response.data;
}
```

---

### 2.2 Fetch Single Product by Slug
* **Endpoint**: `GET /wp-json/wc/v3/products?slug={slug}&status=publish`
* **Official Docs**: [WooCommerce Products API - Retrieve a Product](https://developer.woocommerce.com/docs/apis/rest-api/v3/products/)
* **Response**: Returns an array with one matching published product object.

```js
export async function getProductBySlug(slug) {
  const response = await wcApi.get("products", {
    slug: slug,
    status: "publish",
  });
  return response.data[0] || null;
}
```

---

### 2.3 Product Variations (Attributes, Swatches & Colors)
* **Endpoint**: `GET /wp-json/wc/v3/products/{product_id}/variations`
* **Official Docs**: [WooCommerce Product Variations Reference](https://developer.woocommerce.com/docs/apis/rest-api/v3/product-variations/)
* **Parameters**:
  * `status: "publish"`
* **Use case**: For corporate gift hampers and products that come in different colors, packaging boxes, or sizes.

---

### 2.4 Product Categories
* **Endpoint**: `GET /wp-json/wc/v3/products/categories`
* **Official Docs**: [WooCommerce Product Categories Reference](https://developer.woocommerce.com/docs/apis/rest-api/v3/product-categories/)
* **Query Parameters**:
  * `hide_empty: true` (only shows categories containing published products)
  * `per_page: 50`

```js
export async function getCategories() {
  const response = await wcApi.get("products/categories", {
    hide_empty: true,
    per_page: 50,
  });
  return response.data;
}
```

---

## 3. Search, Filters & Sorting Specification

CrownLeaf organizes gifts into specific price tiers and celebration categories:

### 3.1 Price Tier Filters
| Menu Tier | API Query Parameters |
| :--- | :--- |
| **Under ₹1,000** | `GET /wp-json/wc/v3/products?status=publish&max_price=1000` |
| **₹1,000 to ₹2,500** | `GET /wp-json/wc/v3/products?status=publish&min_price=1000&max_price=2500` |
| **₹2,500 to ₹3,000** | `GET /wp-json/wc/v3/products?status=publish&min_price=2500&max_price=3000` |
| **Above ₹3,000** | `GET /wp-json/wc/v3/products?status=publish&min_price=3000` |

### 3.2 Live Search
* **Endpoint**: `GET /wp-json/wc/v3/products?status=publish&search={query}`
* Supports partial name search, SKU lookup, and description search.

### 3.3 Sorting Options
* **Price (Low to High)**: `orderby=price&order=asc`
* **Price (High to Low)**: `orderby=price&order=desc`
* **Latest Additions**: `orderby=date&order=desc`
* **Popular / Best Sellers**: `orderby=popularity&order=desc`

---

## 4. Headless Cart & Checkout (Store API)

* **Official Docs**: [WooCommerce Store API Official Documentation](https://developer.woocommerce.com/docs/apis/store-api/)
* **Base Endpoint**: `https://crownleaf.co/wp-json/wc/store/v1/`

### 4.1 How Cart Sessions Work in Next.js
The Store API uses a custom header called `Cart-Token` to track an anonymous visitor's cart session across requests.
1. When a user first adds an item, the Store API responds with a unique `Cart-Token` in the response headers.
2. Next.js saves this token in a browser cookie (`wc_cart_token`).
3. Subsequent requests pass `Cart-Token: <token>` in headers.

### 4.2 Cart Endpoints:
* **Get Cart**:
  * `GET /wp-json/wc/store/v1/cart`
* **Add Item to Cart**:
  * `POST /wp-json/wc/store/v1/cart/add-item`
  * Body:
    ```json
    {
      "id": 142,
      "quantity": 50
    }
    ```
* **Update Quantity**:
  * `POST /wp-json/wc/store/v1/cart/update-item`
  * Body: `{ "key": "cart_item_key", "quantity": 100 }`
* **Remove Item**:
  * `POST /wp-json/wc/store/v1/cart/remove-item`
  * Body: `{ "key": "cart_item_key" }`
* **Apply Coupon**:
  * `POST /wp-json/wc/store/v1/cart/apply-coupon`
  * Body: `{ "code": "CORPORATE10" }`

---

## 5. Orders & Payment Gateway Architecture

* **Official Docs**: [WooCommerce Orders API Reference](https://developer.woocommerce.com/docs/apis/rest-api/v3/orders/)
* **Payment Integrations**: [Razorpay Web Flow](https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/) | [Stripe Quickstart](https://stripe.com/docs/payments/quickstart)

### 5.1 End-to-End Payment Flow
1. **Initiation**: Customer clicks "Place Order" on Next.js checkout.
2. **Payment Order Created**: Next.js route handler (`/api/checkout/create-order`) calls Razorpay/Stripe API to generate a transaction order ID.
3. **Frontend Modal**: Customer completes the payment in the Razorpay popup modal.
4. **Verification**: Next.js route handler (`/api/checkout/verify`) validates payment signature using the secret webhook key.
5. **WooCommerce Sync**: Next.js creates the official order in WooCommerce with status `"processing"`:

```js
// POST /wp-json/wc/v3/orders
const orderData = {
  payment_method: "razorpay",
  payment_method_title: "Razorpay (Online Payment)",
  set_paid: true,
  transaction_id: razorpay_payment_id,
  billing: {
    first_name: "Rahul",
    last_name: "Sharma",
    company: "Acme Corp",
    email: "rahul@acme.com",
    phone: "9876543210",
  },
  line_items: [
    {
      product_id: 104,
      quantity: 50,
    },
  ],
};

const order = await wcApi.post("orders", orderData);
```

---

## 6. Customer Authentication

* **Plugin Reference**: [JWT Authentication for WP REST API](https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/)
* **WordPress Core Auth Reference**: [WordPress REST API Authentication](https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/)

### 6.1 Flow for Corporate Client Login
1. **Login Request**: Next.js Route Handler `POST /api/auth/login` forwards credentials to:
   * `POST https://crownleaf.co/wp-json/jwt-auth/v1/token`
   * Body: `{ "username": "...", "password": "..." }`
2. **Token Response**: WordPress returns `{ token, user_email, user_nicename, user_display_name }`.
3. **Session Storage**: Next.js stores the JWT in an **HTTP-only, Secure Cookie** (`crownleaf_session`).
4. **Order History**: User queries their past corporate orders using:
   * `GET /wp-json/wc/v3/orders?customer={user_id}` (executed server-side).

---

## 7. Summary of All Official Documentation Links

| Resource | Documentation URL |
| :--- | :--- |
| **WooCommerce REST v3 Products** | https://developer.woocommerce.com/docs/apis/rest-api/v3/products/ |
| **WooCommerce Product Variations** | https://developer.woocommerce.com/docs/apis/rest-api/v3/product-variations/ |
| **WooCommerce Product Categories** | https://developer.woocommerce.com/docs/apis/rest-api/v3/product-categories/ |
| **WooCommerce Orders API** | https://developer.woocommerce.com/docs/apis/rest-api/v3/orders/ |
| **WooCommerce REST Auth Guide** | https://developer.woocommerce.com/docs/apis/rest-api/authentication/ |
| **WooCommerce Store API (Cart)** | https://developer.woocommerce.com/docs/apis/store-api/ |
| **WordPress Core REST API** | https://developer.wordpress.org/rest-api/ |
| **JWT Authentication Plugin** | https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/ |
| **Razorpay Web Integration** | https://razorpay.com/docs/payments/payment-gateway/web-integration/custom/ |
| **Stripe Quickstart** | https://stripe.com/docs/payments/quickstart |
