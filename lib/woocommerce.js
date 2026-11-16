import WooCommerceRestApiPkg from "@woocommerce/woocommerce-rest-api";
import { WP_URL } from "@/lib/site";

const WooCommerceRestApi = WooCommerceRestApiPkg.default || WooCommerceRestApiPkg;

export const hasWooCredentials = Boolean(process.env.WC_CONSUMER_KEY && process.env.WC_CONSUMER_SECRET);

if (!hasWooCredentials) {
  // Keep the app bootable (pages show their "unable to load" states) but make the cause obvious.
  console.error(
    "[woocommerce] WC_CONSUMER_KEY / WC_CONSUMER_SECRET are not set. All WooCommerce requests will fail. See .env.example."
  );
}

export const wcApi = new WooCommerceRestApi({
  url: WP_URL,
  consumerKey: process.env.WC_CONSUMER_KEY || "missing_consumer_key",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "missing_consumer_secret",
  version: "wc/v3",
  // Never hang forever on a slow WordPress server.
  axiosConfig: { timeout: 20000 },
});

// ---- Retry reads on temporary network problems ------------------------------------------------
// The WordPress host is a separate server, and requests from build servers or serverless functions
// occasionally time out or are throttled. A short retry with backoff turns those blips into a slightly
// slower response instead of an error. Only GET requests are retried: creating or updating orders must
// never be repeated automatically, or one click could create two orders.

const RETRIES = 3;
const BASE_DELAY_MS = 600;
const TRANSIENT_CODES = new Set(["ETIMEDOUT", "ECONNRESET", "ECONNABORTED", "ENETUNREACH", "EAI_AGAIN", "ECONNREFUSED", "EPIPE"]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isTransient(err) {
  const status = err?.response?.status;
  if (status) return status === 429 || status === 408 || status >= 500;
  // No HTTP response at all: a network-level failure
  const code = err?.code || err?.cause?.code;
  const aggregated = Array.isArray(err?.errors) ? err.errors.some((e) => TRANSIENT_CODES.has(e?.code)) : false;
  return TRANSIENT_CODES.has(code) || aggregated || /timeout|ETIMEDOUT|ENETUNREACH/i.test(String(err?.message));
}

const originalGet = wcApi.get.bind(wcApi);
wcApi.get = async (...args) => {
  let lastError;
  for (let attempt = 0; attempt <= RETRIES; attempt += 1) {
    try {
      return await originalGet(...args);
    } catch (err) {
      lastError = err;
      if (attempt === RETRIES || !isTransient(err)) throw err;
      await sleep(BASE_DELAY_MS * 2 ** attempt);
    }
  }
  throw lastError;
};
