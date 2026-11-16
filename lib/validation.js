// Shared input validation for the checkout and enquiry APIs (and the checkout form).

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const isEmail = (v) => typeof v === "string" && v.length <= 254 && EMAIL_RE.test(v.trim());

// Indian mobile numbers: 10 digits starting 6-9, optionally prefixed with +91 / 91 / 0.
export function normalizeIndianPhone(v) {
  if (typeof v !== "string") return null;
  let digits = v.replace(/[\s\-().]/g, "");
  digits = digits.replace(/^\+?91/, "").replace(/^0/, "");
  return /^[6-9]\d{9}$/.test(digits) ? digits : null;
}

export const isPinCode = (v) => typeof v === "string" && /^[1-9]\d{5}$/.test(v.trim());
export const isGstin = (v) => typeof v === "string" && GSTIN_RE.test(v.trim().toUpperCase());

// Trim and cap a user-supplied string.
export function clean(v, max = 200) {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

// Strip HTML entities/tags from messages that come back from WordPress.
export function stripHtml(v) {
  return String(v || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&#8377;/g, "₹")
    .trim();
}
