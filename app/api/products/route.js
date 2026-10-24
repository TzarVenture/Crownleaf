import { NextResponse } from "next/server";
import { wcApi } from "@/lib/woocommerce";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const categoryParam = searchParams.get("category"); // can be slug or numeric ID
    const minPrice = searchParams.get("min_price");
    const maxPrice = searchParams.get("max_price");
    const stockStatus = searchParams.get("stock_status");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "latest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const perPage = parseInt(searchParams.get("per_page") || "18", 10);

    // Build WooCommerce REST API v3 query parameters
    const params = {
      status: "publish", // Mandatory: only show published products
      stock_status: "instock", // Strictly show in-stock products only
      per_page: perPage,
      page: Math.max(1, page),
    };

    // Category Resolution: if slug is provided, resolve to Category ID
    if (categoryParam && categoryParam !== "all") {
      if (/^\d+$/.test(categoryParam)) {
        params.category = categoryParam;
      } else {
        // Fetch category by slug
        try {
          const catRes = await wcApi.get("products/categories", {
            slug: categoryParam.toLowerCase().trim(),
            per_page: 1,
          });
          if (catRes.data && catRes.data.length > 0) {
            params.category = catRes.data[0].id;
          }
        } catch (catErr) {
          console.warn("Could not resolve category slug:", categoryParam, catErr?.message);
        }
      }
    }

    // Price Filtering
    if (minPrice && !isNaN(parseFloat(minPrice))) {
      params.min_price = String(parseFloat(minPrice));
    }
    if (maxPrice && !isNaN(parseFloat(maxPrice))) {
      params.max_price = String(parseFloat(maxPrice));
    }

    // Availability Filter
    if (stockStatus) {
      params.stock_status = stockStatus;
    }

    // Search Query
    if (search && search.trim()) {
      params.search = search.trim();
    }

    // Sorting Options
    switch (sort) {
      case "price_asc":
        params.orderby = "price";
        params.order = "asc";
        break;
      case "price_desc":
        params.orderby = "price";
        params.order = "desc";
        break;
      case "popularity":
        params.orderby = "popularity";
        params.order = "desc";
        break;
      case "title_asc":
        params.orderby = "title";
        params.order = "asc";
        break;
      case "rating":
        params.orderby = "rating";
        params.order = "desc";
        break;
      case "latest":
      default:
        params.orderby = "date";
        params.order = "desc";
        break;
    }

    // Execute WooCommerce REST API Query
    const response = await wcApi.get("products", params);

    const total = parseInt(response.headers["x-wp-total"] || "0", 10);
    const totalPages = parseInt(response.headers["x-wp-totalpages"] || "1", 10);

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
      {
        products: [],
        total: 0,
        totalPages: 0,
        error: "Unable to retrieve products from WooCommerce",
      },
      { status: 500 }
    );
  }
}
