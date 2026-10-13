import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  const imageSrc = product.images && product.images.length > 0 ? product.images[0].src : null;
  const isInStock = product.stock_status === "instock";
  const categoryName =
    product.categories && product.categories.length > 0 ? product.categories[0].name : "Corporate Gift";

  return (
    <article className="group bg-white rounded-2xl border border-[#E2D9CF] shadow-xs hover:shadow-lg hover:border-[#D1B2B2] transition-all duration-300 overflow-hidden flex flex-col">
      {/* Product Image Showcase Stage */}
      <div className="relative aspect-4/3 w-full bg-[#FAF8F5] overflow-hidden flex items-center justify-center p-6 border-b border-[#E2D9CF]/60">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="text-slate-400 text-xs uppercase tracking-wider font-medium">Image Not Available</div>
        )}

        {/* Minimalist Stock Pill (No Emojis, No Pulsing Dots) */}
        <div className="absolute top-3 left-3">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              isInStock
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-stone-100 text-stone-600 border border-stone-200"
            }`}
          >
            {isInStock ? "In Stock" : "Sold Out"}
          </span>
        </div>

        {/* Optional SKU Tag */}
        {product.sku && (
          <div className="absolute top-3 right-3 text-[10px] font-mono text-slate-400 bg-white/90 px-2 py-0.5 rounded border border-[#E2D9CF]">
            SKU: {product.sku}
          </div>
        )}
      </div>

      {/* Product Metadata & Content */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.12em] font-bold text-[#A67D44] mb-1.5">
            {categoryName}
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-[#003108] line-clamp-2 group-hover:text-[#A67D44] transition-colors leading-snug">
            {product.name}
          </h3>
          {product.short_description && (
            <div
              className="mt-2 text-xs text-slate-500 line-clamp-2 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}
        </div>

        {/* Price & Action Trigger */}
        <div className="pt-5 mt-5 border-t border-[#E2D9CF]/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-slate-400 block font-medium">
              Unit Price
            </span>
            <div className="text-xl font-bold text-[#003108]">
              {product.price ? `₹${product.price}` : "On Request"}
            </div>
          </div>

          <Link
            href={`/product/${product.slug}`}
            className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#003108] text-white hover:bg-[#A67D44] transition-colors shadow-xs"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
