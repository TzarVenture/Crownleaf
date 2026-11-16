// Small in-memory rate limiter for public API routes (checkout, enquiry, coupon, cart).
//
// Limits are per server instance. That is enough to stop casual abuse and accidental floods;
// on a multi-instance/serverless deployment, back it with a shared store (e.g. Redis/Upstash)
// or a WAF rule for a hard guarantee.

const buckets = new Map();
let lastSweep = 0;

function sweep(now) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, bucket] of buckets) {
    if (bucket.reset <= now) buckets.delete(key);
  }
}

export function getClientIp(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

/**
 * @param {string} key unique per client and route, e.g. `checkout:${ip}`
 * @param {{limit: number, windowMs: number}} options
 * @returns {{ok: boolean, retryAfter: number}} retryAfter is in seconds
 */
export function rateLimit(key, { limit, windowMs }) {
  const now = Date.now();
  sweep(now);
  let bucket = buckets.get(key);
  if (!bucket || bucket.reset <= now) {
    bucket = { count: 0, reset: now + windowMs };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  return {
    ok: bucket.count <= limit,
    retryAfter: Math.max(1, Math.ceil((bucket.reset - now) / 1000)),
  };
}

export function tooManyRequests(retryAfter) {
  return new Response(
    JSON.stringify({ error: "Too many requests. Please wait a moment and try again.", success: false, message: "Too many requests. Please wait a moment and try again." }),
    { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(retryAfter) } }
  );
}
