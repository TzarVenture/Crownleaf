// Single place for site-wide constants.
// WP_URL is the WordPress/WooCommerce backend. SITE_URL is the public URL of this Next.js site;
// set NEXT_PUBLIC_SITE_URL once the storefront has its own domain (it falls back to WP_URL).

export const WP_URL = (process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://crownleaf.co").replace(/\/+$/, "");
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || WP_URL).replace(/\/+$/, "");

export const WHATSAPP_NUMBER = "917760775875";
export const SALES_PHONE_DISPLAY = "+91 7760775875";
export const SALES_PHONE_TEL = "+917760775875";

export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

// Pages that still live on WordPress.
export const WP_PAGES = {
  about: `${WP_URL}/about-us/`,
  account: `${WP_URL}/my-account/`,
  bulkEnquiry: `${WP_URL}/bulk-enquiry/`,
};

// Format a WooCommerce price string (e.g. "1449" or "599.00") for display in INR.
export function formatINR(value) {
  const n = Number.parseFloat(value);
  if (!Number.isFinite(n)) return null;
  return `₹${n.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}
