import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";

// Cache categories for 5 minutes in memory to avoid repetitive API overhead
let cached = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cached && now - lastCacheTime < CACHE_TTL_MS) {
      return NextResponse.json(cached);
    }

    const [categoriesRes, totalRes] = await Promise.all([
      wcApi.get("products/categories", {
        hide_empty: true,
        per_page: 50,
        orderby: "count",
        order: "desc",
      }),
      // Total of all published, in-stock products (what "All" shows in the catalogue)
      wcApi.get("products", { status: "publish", stock_status: "instock", per_page: 1 }),
    ]);

    const categories = (categoriesRes.data || [])
      .filter((cat) => cat.slug !== "uncategorized" && cat.count > 0)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count,
        parent: cat.parent,
      }));

    cached = {
      categories,
      totalProducts: Number.parseInt(totalRes.headers["x-wp-total"] || "0", 10),
    };
    lastCacheTime = now;

    return NextResponse.json(cached);
  } catch (err) {
    console.error("Error fetching WooCommerce categories:", err?.response?.data || err.message);
    return NextResponse.json(
      {
        categories: cached?.categories || [],
        totalProducts: cached?.totalProducts || 0,
        error: "Unable to load categories from WooCommerce",
      },
      { status: cached ? 200 : 502 }
    );
  }
}
