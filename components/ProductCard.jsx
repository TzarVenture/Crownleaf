import Image from "next/image";
import Link from "next/link";

/**
 * Compact, End-to-End Product Card Component
 *
 * Requirements:
 * 1. Product image displayed end-to-end (full-bleed, edge-to-edge)
 * 2. On card hover, smooth crossfade to next image in product gallery
 * 3. Compact padding and typography for streamlined scanning
 * 4. 2-line clamped title with strike-through MRP
 */
export default function ProductCard({
  product,
  aspectRatio = "aspect-square",
  className = "",
}) {
  if (!product) return null;

  const primaryImage =
    product.images && product.images.length > 0 ? product.images[0].src : null;
  const secondaryImage =
    product.images && product.images.length > 1 ? product.images[1].src : null;
  const slug = product.slug || "";

  // Price & MRP formatting
  const rawPrice = product.price ? parseFloat(product.price) : null;
  const rawRegularPrice = product.regular_price
    ? parseFloat(product.regular_price)
    : null;

  const formattedPrice =
    rawPrice !== null
      ? `₹${rawPrice.toLocaleString("en-IN")}`
      : "Price On Request";

  const showMrp =
    rawRegularPrice !== null &&
    rawPrice !== null &&
    rawRegularPrice > rawPrice;

  const formattedMrp = showMrp
    ? `₹${rawRegularPrice.toLocaleString("en-IN")}`
    : null;

  return (
    <article
      className={`h-full flex flex-col bg-transparent rounded-none overflow-hidden select-none ${className}`}
    >
      <Link
        href={slug ? `/product/${slug}` : "#"}
        className="group flex flex-col h-full focus:outline-none focus-visible:ring-1 focus-visible:ring-[#A67D44]"
      >
        {/* 1. End-to-End Edge-to-Edge Image Stage with Gallery Hover Swap */}
        <div
          className={`relative ${aspectRatio} w-full bg-[#FAF8F5] overflow-hidden shrink-0`}
        >
          {primaryImage ? (
            <>
              {/* Primary Image */}
              <Image
                src={primaryImage}
                alt={product.name || "CrownLeaf Corporate Gift"}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover transition-opacity duration-500 ease-in-out ${
                  secondaryImage ? "group-hover:opacity-0" : ""
                }`}
              />

              {/* Secondary Image on Hover (from gallery) */}
              {secondaryImage && (
                <Image
                  src={secondaryImage}
                  alt={`${product.name || "CrownLeaf Corporate Gift"} - Alternate view`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none"
                />
              )}
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 text-[11px] uppercase tracking-wider font-medium">
              Image Not Available
            </div>
          )}
        </div>

        {/* 2. Compact Content Stage: Title & Price */}
        <div className="pt-2.5 sm:pt-3 pb-1 px-0.5 sm:px-1 flex-1 flex flex-col justify-between">
          <div>
            {/* Title clamped to max 2 lines with lighter, legible typography */}
            <h3
              title={product.name}
              className="text-xs sm:text-sm font-medium text-stone-800 leading-snug line-clamp-2 h-[2.4rem] sm:h-[2.5rem] flex items-start"
            >
              {product.name}
            </h3>

            {/* Price with MRP strike-through directly below title in refined medium weight */}
            <div className="mt-1.5 flex items-baseline gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-medium text-stone-900">
                {formattedPrice}
              </span>

              {showMrp && (
                <span className="text-[11px] sm:text-xs text-stone-400 line-through font-normal">
                  {formattedMrp}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
