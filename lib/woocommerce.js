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
});
