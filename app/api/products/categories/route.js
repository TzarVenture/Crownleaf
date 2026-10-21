import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";

// Cache categories for 5 minutes in memory to avoid repetitive API overhead
let cachedCategories = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

export async function GET() {
  try {
    const now = Date.now();
    if (cachedCategories && now - lastCacheTime < CACHE_TTL_MS) {
      return NextResponse.json({ categories: cachedCategories });
    }

    const response = await wcApi.get("products/categories", {
      hide_empty: true,
      per_page: 50,
      orderby: "count",
      order: "desc",
    });

    const categories = (response.data || [])
      .filter((cat) => cat.slug !== "uncategorized" && cat.count > 0)
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count,
        parent: cat.parent,
      }));

    cachedCategories = categories;
    lastCacheTime = now;

    return NextResponse.json({ categories });
  } catch (err) {
    console.error("Error fetching WooCommerce categories:", err?.response?.data || err.message);
    return NextResponse.json(
      { categories: cachedCategories || [], error: "Unable to load categories from WooCommerce" },
      { status: cachedCategories ? 200 : 500 }
    );
  }
}
