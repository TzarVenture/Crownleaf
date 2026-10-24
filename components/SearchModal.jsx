"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

const TRENDING_SEARCHES = [
  "Gift Sets",
  "Laptop Sleeve",
  "Luggage Tag",
  "Drinkware",
  "Passport Cover",
  "Cable Organizer",
  "Vegan Leather",
];

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const inputRef = useRef(null);
  const modalRef = useRef(null);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Focus input and lock scroll on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setQuery("");
      setResults([]);
      setHasSearched(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setHasSearched(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?search=${encodeURIComponent(trimmed)}&per_page=6`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.products || []);
          setTotalCount(data.total || (data.products ? data.products.length : 0));
        } else {
          setResults([]);
          setTotalCount(0);
        }
      } catch (err) {
        console.error("Search fetch error:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Submit search directly to /products?search=...
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSelectTrending = (term) => {
    setQuery(term);
    inputRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-14 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-xs transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        className="w-full max-w-2xl bg-[#FAF8F5] rounded-2xl shadow-2xl border border-[#E4DCCF] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[85vh]"
      >
        {/* Search Header Bar */}
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center px-4 sm:px-6 py-4 border-b border-[#E4DCCF] bg-white gap-3"
        >
          {/* Search Icon */}
          <svg
            className="w-5 h-5 text-[#A67D44] shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Search Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gifts, products, organizers, sleeves..."
            className="w-full bg-transparent text-sm sm:text-base text-[#17472F] placeholder-[#8A8275] focus:outline-none font-medium"
          />

          {/* Clear button if query has text */}
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Clear search input"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="w-4 h-4 border-2 border-[#A67D44] border-t-transparent rounded-full animate-spin shrink-0" />
          )}

          {/* Close Modal Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-500 hover:text-[#003108] hover:bg-stone-100 transition-colors text-xs font-semibold flex items-center gap-1 shrink-0"
            aria-label="Close search"
          >
            <span className="hidden sm:inline-block text-[11px] uppercase tracking-wider text-stone-400 border border-stone-200 px-1.5 py-0.5 rounded">
              ESC
            </span>
            <svg className="w-5 h-5 sm:hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </form>

        {/* Search Body Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 flex-1">
          {/* Default State: Trending Searches */}
          {!hasSearched && !loading && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#A67D44] mb-3">
                Trending Searches
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectTrending(term)}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium bg-white text-[#17472F] border border-[#E4DCCF] hover:border-[#A67D44] hover:bg-[#FAF7F0] transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results List */}
          {hasSearched && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-3">
                <span>
                  {loading
                    ? "Searching..."
                    : results.length > 0
                    ? `Found ${totalCount} ${totalCount === 1 ? "Product" : "Products"}`
                    : "No Results"}
                </span>
                {results.length > 0 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="text-[#A67D44] hover:underline normal-case font-semibold text-xs"
                  >
                    View all results &rarr;
                  </button>
                )}
              </div>

              {/* No results message */}
              {!loading && results.length === 0 && (
                <div className="text-center py-8 text-stone-500">
                  <p className="text-sm font-medium text-stone-700">No products matching &ldquo;{query}&rdquo;</p>
                  <p className="text-xs text-stone-400 mt-1">
                    Try searching for &ldquo;sleeve&rdquo;, &ldquo;gift&rdquo;, &ldquo;bag&rdquo;, or &ldquo;leather&rdquo;.
                  </p>
                </div>
              )}

              {/* Product Results */}
              <div className="divide-y divide-[#E4DCCF]/60">
                {results.map((product) => {
                  const imageSrc = product.images?.[0]?.src || null;
                  const price = product.price ? `₹${parseFloat(product.price).toFixed(2)}` : null;
                  const regularPrice =
                    product.regular_price && product.regular_price !== product.price
                      ? `₹${parseFloat(product.regular_price).toFixed(2)}`
                      : null;
                  const categoryName = product.categories?.[0]?.name || null;

                  return (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 sm:gap-4 py-3 group hover:bg-white/80 px-2 rounded-xl transition-colors"
                    >
                      {/* Product Thumbnail */}
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
                          <div className="w-full h-full flex items-center justify-center text-stone-300 text-[10px]">
                            No img
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        {categoryName && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#A67D44]">
                            {categoryName}
                          </span>
                        )}
                        <h4 className="text-xs sm:text-sm font-semibold text-[#17472F] group-hover:text-[#A67D44] transition-colors truncate">
                          {product.name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          {price && (
                            <span className="text-xs sm:text-sm font-bold text-[#003108]">
                              {price}
                            </span>
                          )}
                          {regularPrice && (
                            <span className="text-[11px] text-stone-400 line-through">
                              {regularPrice}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Arrow CTA */}
                      <span className="text-stone-300 group-hover:text-[#A67D44] group-hover:translate-x-0.5 transition-all shrink-0">
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

        {/* Footer info bar */}
        {results.length > 0 && (
          <div className="bg-[#FAF7F0] border-t border-[#E4DCCF] px-4 sm:px-6 py-3 flex items-center justify-between text-xs">
            <span className="text-stone-500 text-[11px]">
              Press <kbd className="font-mono bg-white px-1.5 py-0.5 rounded border border-stone-200">Enter</kbd> to see all
            </span>
            <button
              type="button"
              onClick={handleSubmit}
              className="text-[#003108] hover:text-[#A67D44] font-bold text-xs flex items-center gap-1 transition-colors"
            >
              See all results ({totalCount}) &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
