import WooCommerceRestApiPkg from "@woocommerce/woocommerce-rest-api";

const WooCommerceRestApi = WooCommerceRestApiPkg.default || WooCommerceRestApiPkg;

export const wcApi = new WooCommerceRestApi({
  url: process.env.NEXT_PUBLIC_WORDPRESS_URL || "https://crownleaf.co",
  consumerKey: process.env.WC_CONSUMER_KEY || "missing_consumer_key",
  consumerSecret: process.env.WC_CONSUMER_SECRET || "missing_consumer_secret",
  version: "wc/v3",
});
