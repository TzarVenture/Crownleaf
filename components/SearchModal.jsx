"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFocusTrap } from "@/lib/useFocusTrap";
import { formatINR } from "@/lib/site";

const TRENDING_SEARCHES = [
  "Gift Sets",
  "Laptop Sleeve",
  "Luggage Tag",
  "Drinkware",
  "Passport Cover",
  "Cable Organizer",
  "Vegan Leather",
];

/**
 * Search dialog. Mount it only while it is open (the navbar does this), so every opening starts
 * with a clean state and no reset logic is needed.
 */
export default function SearchModal({ onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const dialogRef = useRef(null);

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  // Results are stored with the query they belong to so stale answers are never shown
  const [found, setFound] = useState({ query: "", products: [], total: 0 });

  const trimmed = query.trim();
  const hasSearched = trimmed.length > 0;
  const results = found.query === trimmed ? found.products : [];
  const totalCount = found.query === trimmed ? found.total : 0;

  // Keyboard: focus moves into the dialog, Tab stays inside, Escape closes
  useFocusTrap(dialogRef, true, onClose);

  // Lock page scroll while the dialog is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Debounced search against our own API
  useEffect(() => {
    if (!trimmed) return undefined;
    let ignore = false;

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&per_page=6`);
        const data = res.ok ? await res.json() : { products: [], total: 0 };
        if (!ignore) setFound({ query: trimmed, products: data.products || [], total: data.total || 0 });
      } catch (err) {
        console.error("Search fetch error:", err);
        if (!ignore) setFound({ query: trimmed, products: [], total: 0 });
      } finally {
        if (!ignore) setLoading(false);
      }
    }, 280);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };
  }, [trimmed]);

  const handleChange = (value) => {
    setQuery(value);
    setLoading(value.trim().length > 0);
  };

  // Submit search directly to /products?search=...
  const handleSubmit = (e) => {
    e.preventDefault();
    if (trimmed) {
      onClose();
      router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-xs"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E4DCCF] overflow-hidden flex flex-col max-h-[85vh]"
      >
        <form onSubmit={handleSubmit} className="relative flex items-center px-4 sm:px-6 py-4 border-b border-[#E4DCCF] bg-white gap-3">
          <svg className="w-5 h-5 text-[#8E6935] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>

          <label htmlFor="site-search" className="sr-only">
            Search gifts and products
          </label>
          <input
            id="site-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="Search gifts, products, organizers, sleeves..."
            className="w-full bg-transparent text-sm sm:text-base text-[#003108] placeholder-[#6F675A] focus:outline-none font-medium"
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                handleChange("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-stone-500 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              aria-label="Clear search input"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {loading && <div className="w-4 h-4 border-2 border-[#8E6935] border-t-transparent rounded-full animate-spin shrink-0" aria-hidden="true" />}

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-600 hover:text-[#003108] hover:bg-stone-100 transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
            aria-label="Close search"
          >
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider text-stone-500 border border-stone-200 px-1.5 py-0.5 rounded" aria-hidden="true">
              ESC
            </span>
            <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1" aria-live="polite">
          {!hasSearched && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#8E6935] mb-3">Trending Searches</div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      handleChange(term);
                      inputRef.current?.focus();
                    }}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white text-[#003108] border border-[#E4DCCF] hover:border-[#8E6935] hover:bg-[#FAF7F0] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasSearched && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-600 mb-3">
                <span>
                  {loading
                    ? "Searching..."
                    : results.length > 0
                    ? `Found ${totalCount} ${totalCount === 1 ? "Product" : "Products"}`
                    : "No Results"}
                </span>
                {results.length > 0 && (
                  <button type="button" onClick={handleSubmit} className="text-[#8E6935] hover:underline normal-case font-semibold text-xs">
                    View all results &rarr;
                  </button>
                )}
              </div>

              {!loading && results.length === 0 && (
                <div className="text-center py-8 text-stone-600">
                  <p className="text-sm font-medium text-stone-700">No products matching &ldquo;{trimmed}&rdquo;</p>
                  <p className="text-xs text-stone-500 mt-1">
                    Try searching for &ldquo;sleeve&rdquo;, &ldquo;gift&rdquo;, &ldquo;bag&rdquo;, or &ldquo;leather&rdquo;.
                  </p>
                </div>
              )}

              <div className="divide-y divide-[#E4DCCF]/60">
                {results.map((product) => {
                  const imageSrc = product.images?.[0]?.src || null;
                  const price = product.price ? formatINR(product.price) : null;
                  const regularPrice =
                    product.regular_price && product.regular_price !== product.price ? formatINR(product.regular_price) : null;
                  const categoryName = product.categories?.[0]?.name || null;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 sm:gap-4 py-3 group hover:bg-white/80 px-2 rounded-xl transition-colors"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200 relative">
                        {imageSrc ? (
                          <Image
                            src={imageSrc}
                            alt={product.name}
                            fill
                            sizes="64px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 text-[10px]">No img</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {categoryName && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8E6935]">{categoryName}</span>
                        )}
                        <h4 className="text-xs sm:text-sm font-semibold text-[#003108] group-hover:text-[#8E6935] transition-colors truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {price ? (
                            <span className="text-xs sm:text-sm font-bold text-[#003108]">{price}</span>
                          ) : (
                            <span className="text-xs text-stone-600">Price on request</span>
                          )}
                          {regularPrice && <span className="text-[11px] text-stone-500 line-through">{regularPrice}</span>}
                        </div>
                      </div>

                      <span className="text-stone-400 group-hover:text-[#8E6935] group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="bg-[#FAF7F0] border-t border-[#E4DCCF] px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
            <span className="text-stone-600 text-[11px]">
              Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">Enter</kbd> to see all
            </span>
            <button type="button" onClick={handleSubmit} className="text-[#003108] hover:text-[#8E6935] font-bold text-xs flex items-center gap-1 transition-colors">
              See all results ({totalCount}) &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
