import { wcApi } from "@/lib/woocommerce";

// Validate a coupon code against the coupons that exist in WooCommerce.
// Returns { ok: true, coupon } with display data, or { ok: false, message }.
// WooCommerce remains the source of truth: the order is created with the same code and WooCommerce
// recalculates the discount, so what we show here is only a preview.

export async function validateCoupon(rawCode, subtotal = 0) {
  const code = String(rawCode || "").trim().toLowerCase();
  if (!/^[a-z0-9_-]{2,40}$/i.test(code)) {
    return { ok: false, message: "Please enter a valid coupon code." };
  }

  let coupon;
  try {
    const res = await wcApi.get("coupons", { code, per_page: 1 });
    coupon = (res.data || [])[0];
  } catch (err) {
    console.error("Coupon lookup failed:", err?.response?.data || err?.message);
    return { ok: false, message: "Unable to check coupons right now. Please try again shortly.", unavailable: true };
  }

  if (!coupon || coupon.status !== "publish") {
    return { ok: false, message: `Coupon "${code.toUpperCase()}" is not valid.` };
  }
  if (coupon.date_expires && new Date(coupon.date_expires_gmt || coupon.date_expires) < new Date()) {
    return { ok: false, message: "This coupon has expired." };
  }
  if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
    return { ok: false, message: "This coupon has reached its usage limit." };
  }
  const minimum = Number.parseFloat(coupon.minimum_amount) || 0;
  if (minimum && subtotal < minimum) {
    return { ok: false, message: `This coupon needs a minimum order of ₹${minimum.toLocaleString("en-IN")}.` };
  }
  const maximum = Number.parseFloat(coupon.maximum_amount) || 0;
  if (maximum && subtotal > maximum) {
    return { ok: false, message: `This coupon is valid for orders up to ₹${maximum.toLocaleString("en-IN")}.` };
  }
  if (!["percent", "fixed_cart"].includes(coupon.discount_type)) {
    return { ok: false, message: "This coupon cannot be previewed here. Please contact us to apply it." };
  }

  const amount = Number.parseFloat(coupon.amount) || 0;
  return {
    ok: true,
    coupon: {
      code: coupon.code.toUpperCase(),
      discountType: coupon.discount_type,
      amount,
      description:
        coupon.discount_type === "percent" ? `${amount}% off your order` : `₹${amount.toLocaleString("en-IN")} off your order`,
      freeShipping: Boolean(coupon.free_shipping),
    },
  };
}
