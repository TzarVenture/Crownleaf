import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";
import { getClientIp, rateLimit, tooManyRequests } from "@/lib/rateLimit";

const SORTS = {
  latest: { orderby: "date", order: "desc" },
  popularity: { orderby: "popularity", order: "desc" },
  price_asc: { orderby: "price", order: "asc" },
  price_desc: { orderby: "price", order: "desc" },
  title_asc: { orderby: "title", order: "asc" },
  rating: { orderby: "rating", order: "desc" },
};
const STOCK_STATUSES = new Set(["instock", "outofstock", "onbackorder"]);
const MAX_PER_PAGE = 48;

const emptyResult = (page, perPage) => ({ products: [], total: 0, totalPages: 0, page, perPage });

const toPositiveInt = (value, fallback, max = Number.MAX_SAFE_INTEGER) => {
  const n = Number.parseInt(value ?? "", 10);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(n, max);
};

const toPrice = (value) => {
  const n = Number.parseFloat(value ?? "");
  return Number.isFinite(n) && n >= 0 ? String(n) : null;
};

export async function GET(request) {
  const limit = rateLimit(`products:${getClientIp(request)}`, { limit: 120, windowMs: 60_000 });
  if (!limit.ok) return tooManyRequests(limit.retryAfter);

  const { searchParams } = new URL(request.url);
  const page = toPositiveInt(searchParams.get("page"), 1, 1000);
  const perPage = toPositiveInt(searchParams.get("per_page"), 18, MAX_PER_PAGE);

  try {
    // Build WooCommerce REST API v3 query parameters
    const params = {
      status: "publish", // Mandatory: only show published products
      stock_status: "instock", // In-stock products only unless a valid override is requested
      per_page: perPage,
      page,
      ...(SORTS[searchParams.get("sort")] || SORTS.latest),
    };

    const stockStatus = searchParams.get("stock_status");
    if (stockStatus && STOCK_STATUSES.has(stockStatus)) params.stock_status = stockStatus;

    // Category: numeric ID or slug. An unknown category is an empty result, never "all products".
    const categoryParam = (searchParams.get("category") || "").trim().toLowerCase();
    if (categoryParam && categoryParam !== "all") {
      if (/^\d+$/.test(categoryParam)) {
        params.category = categoryParam;
      } else if (/^[a-z0-9-]{1,80}$/.test(categoryParam)) {
        const catRes = await wcApi.get("products/categories", { slug: categoryParam, per_page: 1 });
        if (!catRes.data?.length) return NextResponse.json(emptyResult(page, perPage));
        params.category = catRes.data[0].id;
      } else {
        return NextResponse.json(emptyResult(page, perPage));
      }
    }

    const minPrice = toPrice(searchParams.get("min_price"));
    const maxPrice = toPrice(searchParams.get("max_price"));
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;

    const search = (searchParams.get("search") || "").trim().slice(0, 100);
    if (search) params.search = search;

    const response = await wcApi.get("products", params);
    const total = Number.parseInt(response.headers["x-wp-total"] || "0", 10);
    const totalPages = Number.parseInt(response.headers["x-wp-totalpages"] || "1", 10);

    return NextResponse.json({
      products: response.data || [],
      total,
      totalPages,
      page,
      perPage,
    });
  } catch (err) {
    console.error("Error in GET /api/products:", err?.response?.data || err.message);
    return NextResponse.json(
      { ...emptyResult(page, perPage), error: "Unable to retrieve products from WooCommerce" },
      { status: 502 }
    );
  }
}
