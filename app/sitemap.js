import { wcApi } from "@/lib/woocommerce";
import { SITE_URL } from "@/lib/site";

// Rebuilt at most once an hour
export const revalidate = 3600;

export default async function sitemap() {
  const entries = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/products`, changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    // Published products only (mandatory rule), 100 per page
    for (let page = 1; page <= 10; page += 1) {
      const res = await wcApi.get("products", { status: "publish", per_page: 100, page });
      const products = res.data || [];
      for (const p of products) {
        entries.push({
          url: `${SITE_URL}/product/${p.slug}`,
          lastModified: p.date_modified_gmt ? new Date(`${p.date_modified_gmt}Z`) : undefined,
          changeFrequency: "weekly",
          priority: 0.7,
        });
      }
      if (products.length < 100) break;
    }
  } catch (err) {
    // Still serve the static pages if WooCommerce is unreachable
    console.error("Sitemap product fetch failed:", err?.message);
  }

  return entries;
}
