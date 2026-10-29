import Link from "next/link";
import ProductCard from "./ProductCard";

/**
 * BrandFeatureSection Component
 *
 * Implements the executive "Why Choose CrownLeaf" brand callout alongside 4 real
 * in-stock WooCommerce products in a responsive atelier layout.
 *
 * Features:
 * 1. Left brand authority card with value propositions and sharp-cornered CTA.
 * 2. 4 real WooCommerce products with gallery hover image swap and live pricing.
 * 3. 100% responsive: horizontal swipe shelf on mobile, 4-column grid on desktop.
 * 4. Architectural theme: sharp corners (rounded-none), atelier borders, CrownLeaf palette.
 */
export default function BrandFeatureSection({ products = [] }) {
  const displayProducts = products && products.length > 0 ? products.slice(0, 4) : [];

  const valuePoints = [
    "Custom Logo & Bespoke Branding",
    "Handcrafted Luxury Packaging",
    "Useful & Memorable Corporate Gifts",
    "Pan-India Express Bulk Delivery",
  ];

  return (
    <section
      aria-label="Why Leading Brands Choose CrownLeaf"
      className="py-8 sm:py-12 lg:py-14 bg-[#F7F3EE] border-b border-[#E2D9CF] select-none"
    >
      <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-stretch gap-5 sm:gap-6 lg:gap-6 xl:gap-7">
          {/* Left Feature Callout Panel (Brand Authority Block) */}
          <div className="w-full lg:w-[29%] xl:w-[27%] shrink-0 bg-[#FAF7F2] border border-[#E5DDD2] p-5 sm:p-6 lg:p-7 flex flex-col justify-between">
            <div>
              {/* Eyebrow Header */}
              <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
                <span className="text-[10.5px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-[#A67D44]">
                  Reasons to Partner
                </span>
                <span className="h-px flex-1 bg-[#D1B2B2]/60" />
              </div>

              {/* Display Headline */}
              <h2 className="text-2xl sm:text-3xl lg:text-[27px] xl:text-[30px] font-bold tracking-tight text-[#003108] leading-[1.18]">
                Why Brands Love{" "}
                <span className="text-[#A67D44] block">CrownLeaf</span>
              </h2>

              {/* Subtle Atelier Divider */}
              <div className="flex items-center gap-2 my-3.5 sm:my-4">
                <div className="h-px w-8 bg-[#A67D44]/40" />
                <div className="w-1.5 h-1.5 rotate-45 border border-[#A67D44]" />
                <div className="h-px w-8 bg-[#A67D44]/40" />
              </div>

              {/* Value Points List with Clean SVGs */}
              <ul className="space-y-2.5 sm:space-y-3">
                {valuePoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="w-4.5 h-4.5 mt-0.5 rounded-none bg-[#003108]/10 text-[#003108] flex items-center justify-center shrink-0">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                    <span className="text-xs sm:text-[13px] font-medium text-stone-700 leading-snug">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Action CTA Button (Sharp Corners, Atelier Theme) */}
            <div className="mt-6 sm:mt-7 pt-4 sm:pt-5 border-t border-[#E5DDD2]">
              <Link
                href="/products"
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 sm:py-3.5 bg-[#003108] hover:bg-[#002205] text-white text-xs sm:text-[13px] font-bold uppercase tracking-[0.14em] transition-colors shadow-xs rounded-none"
              >
                <span>Explore Collection</span>
                <span className="text-sm">→</span>
              </Link>
            </div>
          </div>

          {/* Right Product Showcase (4 Real In-Stock Products) */}
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            {displayProducts.length === 0 ? (
              <div className="h-full min-h-[260px] flex items-center justify-center p-8 bg-white border border-[#E5DDD2] text-stone-500 text-sm">
                Curating corporate collections...
              </div>
            ) : (
              /* Responsive shelf: Horizontal swipe on mobile, 4-col grid on desktop */
              <div className="flex lg:grid lg:grid-cols-4 overflow-x-auto lg:overflow-visible snap-x snap-mandatory scrollbar-none gap-3 sm:gap-3.5 lg:gap-3.5 xl:gap-4 pb-2 lg:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0">
                {displayProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex-shrink-0 w-[62vw] max-w-[230px] sm:w-[42vw] lg:w-auto snap-start bg-white border border-[#E5DDD2] p-2.5 sm:p-3 flex flex-col justify-between"
                  >
                    <ProductCard
                      product={product}
                      aspectRatio="aspect-square"
                      className="h-full"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

