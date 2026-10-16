"use client";

import ProductCard from "./ProductCard";

export default function CategorySection({
  title,
  description,
  products = [],
  categoryHref = "#inventory",
}) {
  // Display up to 4 items max: 4 on xl, 3 on md, 2 on sm/mobile via CSS
  const displayedProducts = products.slice(0, 4);

  return (
    <section className="py-4 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-[1300px] mx-auto w-full border-b border-[#E4DCCF] last:border-b-0">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-3.5 sm:mb-4 pb-2.5 border-b border-[#E4DCCF] gap-2">
        <div className="max-w-2xl">
          <h2 className="text-lg sm:text-xl font-bold text-[#17472F] tracking-tight leading-tight">
            {title}
          </h2>
          {description && (
            <p className="mt-1.5 text-xs sm:text-sm font-light text-stone-600 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Responsive Grid: 4 on xl, 3 on md, 2 on sm */}
      {displayedProducts.length === 0 ? (
        <div className="text-center py-12 bg-[#FAF7F0] rounded-2xl border border-[#E4DCCF]">
          <p className="text-stone-500 text-sm font-medium">
            No published products currently available in this collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 lg:gap-6">
          {displayedProducts.map((product, idx) => {
            // Native responsive count:
            // 3rd item is hidden on mobile (< md), 4th item is hidden on < xl (mobile and md)
            const responsiveClass =
              idx === 2 ? "hidden md:block" : idx === 3 ? "hidden xl:block" : "";

            return (
              <div key={product.id} className={`h-full min-w-0 ${responsiveClass}`}>
                <ProductCard product={product} />
              </div>
            );
          })}
        </div>
      )}

      {/* View All Category Action Button - Matches Bulk Enquiry */}
      {categoryHref && (
        <div className="mt-2 sm:mt-4 flex items-center justify-center">
          <a
            href={categoryHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-8 py-2.5 sm:py-3 rounded-full text-xs font-bold tracking-wider uppercase border border-[#A67D44] bg-[#A67D44] text-white hover:bg-[#8E6935] hover:border-[#8E6935] transition-all duration-200 shadow-xs cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A67D44]"
          >
            <span>View All</span>
            <span className="ml-1.5 text-xs">→</span>
          </a>
        </div>
      )}
    </section>
  );
}
