# CrownLeaf storefront

Headless corporate-gifting store for [crownleaf.co](https://crownleaf.co): a **Next.js** (App Router) front end on top of **WordPress + WooCommerce**.

- Next.js handles pages, routing, SEO, the cart drawer and checkout screens.
- WordPress/WooCommerce is the catalogue, stock, coupon, shipping, tax and order system, and takes the payment.

## Getting started

```bash
npm install
cp .env.example .env   # then fill in the WooCommerce keys
npm run dev
```

Open <http://localhost:3000>.

| Script | What it does |
| :-- | :-- |
| `npm run dev` | Development server |
| `npm run build` | Production build (must pass with no errors) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## How an order flows

1. **Browse**: pages read products with the WooCommerce REST API on the server (published products only).
2. **Cart**: the cart lives in WooCommerce (Store API session). Variable products (e.g. colour) are added by their variation ID.
3. **Checkout** (`/checkout`): the server re-checks every product, price, shipping rate and coupon against WooCommerce, then creates a *pending* order.
4. **Payment**: the shopper pays in the Razorpay popup on our own page. The server creates the Razorpay order from the WooCommerce order total, verifies the payment signature and asks Razorpay to confirm the payment, and only then marks the WooCommerce order paid (which updates stock and sends the emails). If the Razorpay keys are not set, checkout falls back to WooCommerce's own order-pay page.
5. Products with no online price (quote only) show a WhatsApp / enquiry request instead of buy buttons.

## Project map

| Path | Purpose |
| :-- | :-- |
| `app/` | Pages (`/`, `/products`, `/product/[slug]`, `/checkout`), API routes, sitemap, robots, error pages |
| `app/api/*` | Server routes: `cart`, `cart/coupon`, `checkout`, `enquiry`, `products`, `products/categories` |
| `components/` | UI components |
| `context/CartContext.jsx` | Cart state (server cart is the source of truth) |
| `lib/` | WooCommerce client, Store API helpers, shipping, coupons, validation, rate limiting, site constants |
| `docs/` | Design system and WordPress API notes |

## Rules for contributors

See `AGENTS.md`: published products only, WooCommerce keys server-side only, Montserrat typography, 1300px container, no unsolicited commits.

## Things configured in WordPress, not here

Shipping rates, coupons, tax rates (GST), payment gateways, product data (descriptions, SKUs, weights) and the Contact Form 7 form used for enquiries all live in WordPress admin.
