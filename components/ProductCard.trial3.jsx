"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export default function ProductCard({ product }) {
  const cardRef = useRef(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, opacity: 0 });
  const [tilt, setTilt] = useState({ rx: 0, ry: 0, tx: 0, ty: 0 });

  const images = product.images && product.images.length > 0 ? product.images : [];
  const currentImage = images[activeImageIndex]?.src || images[0]?.src || null;
  const isInStock = product.stock_status === "instock";
  const categoryName =
    product.categories && product.categories.length > 0 ? product.categories[0].name : "Corporate Gift";

  // 3D Tilt & Cursor Spotlight tracking (60fps GPU transform)
  const handlePointerMove = useCallback((e) => {
    // Check reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    // Spotlight cursor coords
    setSpotlight({
      x: px * 100,
      y: py * 100,
      opacity: 1,
    });

    // 3D perspective tilt angles (max ~5deg for subtle technical luxury)
    const rx = (py - 0.5) * -8;
    const ry = (px - 0.5) * 8;
    const tx = (px - 0.5) * 6;
    const ty = (py - 0.5) * 6;

    setTilt({ rx, ry, tx, ty });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setSpotlight((prev) => ({ ...prev, opacity: 0 }));
    setTilt({ rx: 0, ry: 0, tx: 0, ty: 0 });
  }, []);

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${
          spotlight.opacity ? "-4px" : "0"
        })`,
        transition: spotlight.opacity
          ? "transform 0.12s ease-out, box-shadow 0.3s ease"
          : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease",
      }}
      className="group relative bg-[#FAF7F0] rounded-[18px] border border-[#E4DCCF] shadow-xs hover:shadow-xl hover:shadow-[#17472F]/10 transition-shadow duration-400 overflow-hidden flex flex-col select-none contain-paint"
    >
      {/* 1. Cursor Spotlight Radial Border (Beleorix inspired) */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-[18px] transition-opacity duration-300"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(240px circle at ${spotlight.x}% ${spotlight.y}%, rgba(164, 122, 60, 0.28), transparent 70%)`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* 2. Product Image Showcase Stage */}
      <div className="relative aspect-4/3 w-full bg-white overflow-hidden flex items-center justify-center p-6 border-b border-[#E4DCCF]">
        {/* Subtle Diagonal Shine Sweep on Hover */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-transform duration-700 ease-out -translate-x-[120%] group-hover:translate-x-[120%]"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.45) 50%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        {/* Product Image with Subtle Parallax Offset */}
        {currentImage ? (
          <div
            className="relative w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
            style={{
              transform: `translate(${-tilt.tx * 0.8}px, ${-tilt.ty * 0.8}px)`,
            }}
          >
            <Image
              src={currentImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-contain p-2 transition-opacity duration-300"
            />
          </div>
        ) : (
          <div className="text-stone-400 text-xs uppercase tracking-wider font-medium">
            Image Not Available
          </div>
        )}

        {/* Minimalist Stock Pill (No Emojis) */}
        <div className="absolute top-3 left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9.5px] font-semibold uppercase tracking-[0.14em] shadow-2xs backdrop-blur-xs ${
              isInStock
                ? "bg-[#FAF7F0]/95 text-[#17472F] border border-[#17472F]/20"
                : "bg-stone-100/90 text-stone-600 border border-stone-200"
            }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isInStock ? "bg-[#17472F]" : "bg-stone-400"
              }`}
            />
            {isInStock ? "In Stock" : "Sold Out"}
          </span>
        </div>

        {/* Technical SKU Tag */}
        {product.sku && (
          <div className="absolute top-3 right-3 z-10 text-[9.5px] tracking-wider uppercase font-semibold text-[#17472F] bg-[#FAF7F0]/90 px-2 py-0.5 rounded-md border border-[#E4DCCF] shadow-2xs backdrop-blur-xs">
            SKU: {product.sku}
          </div>
        )}

        {/* Gallery Preview Swatches (Crossfade on Hover/Click if multiple images exist) */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full bg-[#FAF7F0]/90 border border-[#E4DCCF] shadow-2xs opacity-80 group-hover:opacity-100 transition-opacity"
            role="tablist"
            aria-label="Product image options"
          >
            {images.slice(0, 5).map((img, idx) => (
              <button
                key={img.id || idx}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveImageIndex(idx);
                }}
                onMouseEnter={() => setActiveImageIndex(idx)}
                className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                  activeImageIndex === idx
                    ? "w-4 bg-[#A47A3C]"
                    : "bg-[#17472F]/30 hover:bg-[#17472F]/60"
                }`}
                aria-label={`View product image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Product Metadata & Specifications */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between gap-4">
        <div>
          {/* Eyebrow & Expanding Atelier Rule Line (Beleorix inspired) */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.18em] font-bold text-[#A47A3C] shrink-0">
              {categoryName}
            </span>
            <span
              className="flex-1 h-px bg-[#A47A3C]/40 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"
              aria-hidden="true"
            />
          </div>

          {/* Product Title */}
          <h3 className="text-base sm:text-[17px] font-semibold text-[#17472F] line-clamp-2 group-hover:text-[#A47A3C] transition-colors leading-snug">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>

          {/* Short Description */}
          {product.short_description && (
            <div
              className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed font-light"
              dangerouslySetInnerHTML={{ __html: product.short_description }}
            />
          )}
        </div>

        {/* 4. Price & Action Trigger */}
        <div className="pt-4 border-t border-[#E4DCCF] flex items-end justify-between gap-3">
          <div>
            <span className="text-[9.5px] uppercase tracking-[0.16em] text-stone-500 block font-semibold">
              Unit Price
            </span>
            <div className="text-lg sm:text-xl font-bold text-[#17472F] tracking-tight mt-0.5">
              {product.price ? `₹${product.price}` : "On Request"}
            </div>
          </div>

          {/* View Details CTA with Beleorix-style Arrow Translation */}
          <Link
            href={`/product/${product.slug}`}
            className="group/btn inline-flex items-center justify-center px-4 sm:px-5 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-[#17472F] text-white hover:bg-[#123825] transition-all shadow-xs shrink-0"
          >
            <span>View Details</span>
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-1.5 text-xs">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
