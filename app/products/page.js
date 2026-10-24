"use client";

import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";

// Standard Corporate Budget Tiers matching CrownLeaf catalog
const PRICE_TIERS = [
  { label: "All Prices", min: null, max: null },
  { label: "Under ₹1,000", min: null, max: 1000 },
  { label: "₹1,000 to ₹2,500", min: 1000, max: 2500 },
  { label: "₹2,500 to ₹5,000", min: 2500, max: 5000 },
  { label: "Above ₹5,000", min: 5000, max: null },
];

// Sort Options
const SORT_OPTIONS = [
  { value: "latest", label: "Latest Additions" },
  { value: "popularity", label: "Best Sellers" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "title_asc", label: "Alphabetical (A–Z)" },
];

function ProductsCatalogContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read current filter state from URL search params
  const currentCategory = searchParams.get("category") || "all";
  const currentMinPrice = searchParams.get("min_price") || "";
  const currentMaxPrice = searchParams.get("max_price") || "";
  const currentSort = searchParams.get("sort") || "latest";
  const currentSearch = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Local state
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [productsLoading, setProductsLoading] = useState(true);

  // Search input local state for debouncing
  const [searchInput, setSearchInput] = useState(currentSearch);

  // Custom price input local state
  const [customMin, setCustomMin] = useState(currentMinPrice);
  const [customMax, setCustomMax] = useState(currentMaxPrice);

  // Mobile filter drawer state
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Fetch Categories from WooCommerce API
  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await fetch("/api/products/categories");
        if (res.ok) {
          const data = await res.json();
          setCategories(data.categories || []);
        }
      } catch (err) {
        console.error("Failed to load WooCommerce categories:", err);
      } finally {
        setCategoriesLoading(false);
      }
    }
    loadCategories();
  }, []);

  // Update URL helper
  const updateQuery = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "" || value === "all") {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      // Reset page to 1 whenever any filter other than page changes
      if (!("page" in updates)) {
        params.delete("page");
      }

      router.push(`/products?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Fetch Products from WooCommerce API whenever URL parameters change
  useEffect(() => {
    let ignore = false;
    setProductsLoading(true);

    async function loadProducts() {
      try {
        const params = new URLSearchParams(searchParams.toString());
        if (!params.has("per_page")) {
          params.set("per_page", "18");
        }

        const res = await fetch(`/api/products?${params.toString()}`);
        if (!res.ok) {
          throw new Error("Failed to load products");
        }

        const data = await res.json();
        if (!ignore) {
          setProducts(data.products || []);
          setTotalProducts(data.total || 0);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
        if (!ignore) {
          setProducts([]);
          setTotalProducts(0);
          setTotalPages(1);
        }
      } finally {
        if (!ignore) {
          setProductsLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      ignore = true;
    };
  }, [searchParams]);

  // Keep search input synced with URL
  useEffect(() => {
    setSearchInput(currentSearch);
  }, [currentSearch]);

  // Keep custom price inputs synced with URL
  useEffect(() => {
    setCustomMin(currentMinPrice);
    setCustomMax(currentMaxPrice);
  }, [currentMinPrice, currentMaxPrice]);

  // Handle live search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateQuery({ search: searchInput.trim() });
  };

  const handleClearSearch = () => {
    setSearchInput("");
    updateQuery({ search: null });
  };

  // Handle custom price apply
  const handleApplyCustomPrice = (e) => {
    e.preventDefault();
    updateQuery({
      min_price: customMin ? parseFloat(customMin) : null,
      max_price: customMax ? parseFloat(customMax) : null,
    });
  };

  // Check which price tier is active
  const activePriceTierIndex = useMemo(() => {
    const minVal = currentMinPrice ? parseFloat(currentMinPrice) : null;
    const maxVal = currentMaxPrice ? parseFloat(currentMaxPrice) : null;

    if (minVal === null && maxVal === null) return 0;
    const idx = PRICE_TIERS.findIndex(
      (t) => t.min === minVal && t.max === maxVal
    );
    return idx !== -1 ? idx : -1;
  }, [currentMinPrice, currentMaxPrice]);

  // Active Category Name
  const activeCategoryObj = useMemo(() => {
    if (!currentCategory || currentCategory === "all") return null;
    return categories.find(
      (c) => c.slug === currentCategory || String(c.id) === currentCategory
    );
  }, [categories, currentCategory]);

  const activeCategoryTitle = activeCategoryObj
    ? activeCategoryObj.name
    : "All Corporate Gifts";

  // Total active filter count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentCategory && currentCategory !== "all") count++;
    if (currentMinPrice || currentMaxPrice) count++;
    if (currentSearch) count++;
    return count;
  }, [currentCategory, currentMinPrice, currentMaxPrice, currentSearch]);

  // Clear all filters
  const handleClearAll = () => {
    router.push("/products", { scroll: false });
  };

  // -------------------------------------------------------------
  // Filter Sidebar Content (Shared between desktop and mobile)
  // -------------------------------------------------------------
  const FilterSidebarContent = () => (
    <div className="space-y-6">
      {/* Active Filters Summary */}
      {activeFiltersCount > 0 && (
        <div className="pb-4 border-b border-stone-200">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#003108]">
              Active Filters ({activeFiltersCount})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-[#A67D44] hover:text-[#8E6935] font-semibold underline"
            >
              Clear All
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {activeCategoryObj && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 rounded text-xs">
                <span>{activeCategoryObj.name}</span>
                <button
                  type="button"
                  onClick={() => updateQuery({ category: null })}
                  className="hover:text-red-600 font-bold ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}

            {(currentMinPrice || currentMaxPrice) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 rounded text-xs">
                <span>
                  {currentMinPrice && currentMaxPrice
                    ? `₹${currentMinPrice} – ₹${currentMaxPrice}`
                    : currentMinPrice
                    ? `Above ₹${currentMinPrice}`
                    : `Under ₹${currentMaxPrice}`}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuery({ min_price: null, max_price: null })}
                  className="hover:text-red-600 font-bold ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}


            {currentSearch && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-stone-100 text-stone-800 rounded text-xs">
                <span>&ldquo;{currentSearch}&rdquo;</span>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="hover:text-red-600 font-bold ml-0.5"
                >
                  ✕
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* 1. Category Filter Group */}
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-900 mb-2.5">
          Categories
        </h3>

        <div className="space-y-0.5 max-h-[340px] overflow-y-auto pr-1">
          {/* All Categories Option */}
          <button
            type="button"
            onClick={() => updateQuery({ category: null })}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition ${
              currentCategory === "all" || !currentCategory
                ? "bg-[#003108] text-white font-semibold"
                : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
            }`}
          >
            <span>All Solutions</span>
            <span
              className={`text-[11px] ${
                currentCategory === "all" || !currentCategory
                  ? "text-white/80"
                  : "text-stone-400"
              }`}
            >
              204
            </span>
          </button>

          {/* Dynamic Categories from WooCommerce */}
          {categoriesLoading ? (
            <div className="space-y-1.5 py-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-6 bg-stone-100 rounded animate-pulse" />
              ))}
            </div>
          ) : (
            categories.map((cat) => {
              const isSelected =
                currentCategory === cat.slug || currentCategory === String(cat.id);

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateQuery({ category: cat.slug })}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition text-left ${
                    isSelected
                      ? "bg-[#003108] text-white font-semibold"
                      : "text-stone-700 hover:bg-stone-50 hover:text-stone-900"
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span
                    className={`text-[11px] shrink-0 ${
                      isSelected ? "text-white/80" : "text-stone-400"
                    }`}
                  >
                    ({cat.count})
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* 2. Price Range Filter Group */}
      <div className="pt-4 border-t border-stone-200">
        <h3 className="text-[11px] font-bold uppercase tracking-wider text-stone-900 mb-2.5">
          Price Range
        </h3>

        {/* Quick Tiers */}
        <div className="space-y-0.5 mb-3.5">
          {PRICE_TIERS.map((tier, idx) => {
            const isSelected = activePriceTierIndex === idx;

            return (
              <label
                key={tier.label}
                onClick={() =>
                  updateQuery({
                    min_price: tier.min,
                    max_price: tier.max,
                  })
                }
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-xs cursor-pointer transition select-none ${
                  isSelected
                    ? "bg-stone-100 text-[#003108] font-semibold"
                    : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
                }`}
              >
                <div
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                    isSelected
                      ? "border-[#003108] bg-[#003108]"
                      : "border-stone-300 bg-white"
                  }`}
                >
                  {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                </div>
                <span>{tier.label}</span>
              </label>
            );
          })}
        </div>

        {/* Custom Price Inputs */}
        <form onSubmit={handleApplyCustomPrice} className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs">₹</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={customMin}
                onChange={(e) => setCustomMin(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-800"
              />
            </div>
            <span className="text-stone-400 text-xs">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1.5 text-stone-400 text-xs">₹</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={customMax}
                onChange={(e) => setCustomMax(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-stone-300 rounded bg-white focus:outline-none focus:border-stone-800"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-stone-100 border border-stone-300 hover:bg-[#003108] hover:text-white text-stone-800 text-xs font-medium rounded transition"
          >
            Apply Price
          </button>
        </form>
      </div>

    </div>
  );

  return (
    <div className="min-h-screen bg-white text-stone-900 flex flex-col justify-between">
      <Navbar />

      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 w-full">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="text-xs text-stone-500 mb-5 flex items-center gap-1.5">
          <Link href="/" className="hover:underline text-stone-600">
            Home
          </Link>
          <span>&gt;</span>
          <Link href="/products" className="hover:underline text-stone-600">
            Corporate Gifts
          </Link>
          {activeCategoryObj && (
            <>
              <span>&gt;</span>
              <span className="text-stone-900 font-semibold">{activeCategoryObj.name}</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-6 border-b border-stone-200">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#A67D44]">
              Corporate Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1 tracking-tight">
              {activeCategoryTitle}
            </h1>
            <p className="text-xs text-stone-500 mt-1 max-w-xl">
              Curated corporate gifts, bespoke employee welcome hampers, and branded executive sets.
            </p>
          </div>

          {/* Quick Count & Mobile Filter Trigger */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500 hidden sm:inline-block">
              {productsLoading ? (
                "Loading products..."
              ) : (
                `Showing ${products.length} of ${totalProducts} items`
              )}
            </span>

            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-stone-300 rounded text-xs font-semibold text-stone-900 shadow-2xs"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#003108] text-white text-[9px] flex items-center justify-center font-bold">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* 2-Column Catalog Layout: Filter on Left, Products on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          {/* ======================================================== */}
          {/* LEFT SIDE: Desktop Filter Sidebar (Sticky)               */}
          {/* ======================================================== */}
          <aside className="hidden lg:block lg:col-span-3 bg-white border border-stone-200 rounded-none p-5 shadow-2xs sticky top-28">
            <FilterSidebarContent />
          </aside>

          {/* ======================================================== */}
          {/* RIGHT SIDE: Products Grid, Controls & Pagination         */}
          {/* ======================================================== */}
          <section className="lg:col-span-9 space-y-6">
            {/* Top Controls: Search Bar & Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
              {/* Search Input */}
              <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-sm">
                <input
                  type="text"
                  placeholder="Search gifts, journals, bottles..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="w-full pl-8 pr-7 py-2 bg-stone-50/70 border border-stone-300 rounded text-xs text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-800"
                />
                <svg
                  className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>

                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-2 top-2 text-stone-400 hover:text-stone-700 text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
              </form>

              {/* Sort Selector */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
                <label className="text-xs text-stone-500 whitespace-nowrap font-medium">
                  Sort:
                </label>
                <select
                  value={currentSort}
                  onChange={(e) => updateQuery({ sort: e.target.value })}
                  className="px-2.5 py-1.5 bg-white border border-stone-300 rounded text-xs font-medium text-stone-900 focus:outline-none focus:border-stone-800 cursor-pointer"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Products Grid */}
            {productsLoading ? (
              /* Skeleton Loader matching ProductCard dimensions */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col animate-pulse">
                    <div className="aspect-square bg-stone-100 w-full" />
                    <div className="pt-2.5 space-y-2">
                      <div className="h-3.5 bg-stone-100 rounded w-4/5" />
                      <div className="h-3 bg-stone-100 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              /* Empty State */
              <div className="border border-stone-200 rounded p-12 text-center my-6">
                <h3 className="text-base font-serif text-stone-900 mb-1">
                  No products found
                </h3>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
                  We couldn&apos;t find any items matching your selected criteria. Try adjusting your filters.
                </p>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="px-6 py-2.5 bg-[#A67D44] hover:bg-[#8E6935] text-white text-xs font-semibold rounded transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              /* Native ProductCard Grid */
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-x-4 gap-y-7 sm:gap-x-6 sm:gap-y-9">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pt-10 flex items-center justify-center gap-1.5 border-t border-stone-200 mt-10">
                <button
                  type="button"
                  onClick={() => updateQuery({ page: Math.max(1, currentPage - 1) })}
                  disabled={currentPage <= 1 || productsLoading}
                  className="px-3 py-1.5 border border-stone-300 rounded text-xs text-stone-800 hover:bg-stone-50 disabled:opacity-30 transition font-medium"
                >
                  ← Prev
                </button>

                <div className="flex items-center gap-1 px-2">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    const isActive = pageNum === currentPage;

                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          type="button"
                          onClick={() => updateQuery({ page: pageNum })}
                          disabled={productsLoading}
                          className={`w-7 h-7 rounded text-xs font-medium transition flex items-center justify-center ${
                            isActive
                              ? "bg-[#003108] text-white"
                              : "border border-stone-300 text-stone-700 hover:bg-stone-50"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }

                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return (
                        <span key={pageNum} className="text-stone-400 text-xs px-0.5">
                          ...
                        </span>
                      );
                    }

                    return null;
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => updateQuery({ page: Math.min(totalPages, currentPage + 1) })}
                  disabled={currentPage >= totalPages || productsLoading}
                  className="px-3 py-1.5 border border-stone-300 rounded text-xs text-stone-800 hover:bg-stone-50 disabled:opacity-30 transition font-medium"
                >
                  Next →
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 transition-opacity"
            onClick={() => setMobileFilterOpen(false)}
          />

          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl p-6 overflow-y-auto flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-5">
                <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Filters
                </h2>
                <button
                  type="button"
                  onClick={() => setMobileFilterOpen(false)}
                  className="w-6 h-6 text-stone-500 hover:text-stone-900 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <FilterSidebarContent />
            </div>

            <div className="pt-4 border-t border-stone-200 mt-6">
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-2.5 bg-[#A67D44] hover:bg-[#8E6935] text-white text-xs font-semibold rounded transition"
              >
                View {totalProducts} Solutions
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-2 border-stone-300 border-t-[#003108] rounded-full animate-spin" />
            <span className="text-xs text-stone-500 uppercase tracking-wider">
              Loading Products...
            </span>
          </div>
        </div>
      }
    >
      <ProductsCatalogContent />
    </Suspense>
  );
}
