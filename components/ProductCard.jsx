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

  const prevImage = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length]
  );

  const nextImage = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setActiveImageIndex((prev) => (prev + 1) % images.length);
    },
    [images.length]
  );

  return (
    <article
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg) translateY(${spotlight.opacity ? "-4px" : "0"
          })`,
        transition: spotlight.opacity
          ? "transform 0.12s ease-out, box-shadow 0.3s ease"
          : "transform 0.5s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.4s ease",
      }}
      className="group relative h-full bg-[#FAF7F0] rounded-xl sm:rounded-2xl border border-[#E4DCCF] shadow-[0_4px_18px_-4px_rgba(23,71,47,0.09),0_2px_6px_-1px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_32px_-6px_rgba(23,71,47,0.16),0_6px_16px_-2px_rgba(164,122,60,0.12)] hover:border-[#A47A3C]/50 transition-all duration-400 overflow-hidden flex flex-col select-none contain-paint"
    >
      {/* 1. Cursor Spotlight Radial Border (Beleorix inspired) */}
      <div
        className="pointer-events-none absolute inset-0 z-30 rounded-xl sm:rounded-2xl transition-opacity duration-300"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(220px circle at ${spotlight.x}% ${spotlight.y}%, rgba(164, 122, 60, 0.28), transparent 70%)`,
          mask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          maskComposite: "exclude",
          WebkitMaskComposite: "xor",
          padding: "1.5px",
        }}
        aria-hidden="true"
      />

      {/* 2. Product Image Showcase Stage - Seamless Edge-to-Edge Framing */}
      <div className="relative aspect-[4/3] w-full bg-white sm:bg-stone-100 overflow-hidden flex items-center justify-center border-b border-[#E4DCCF] shrink-0">
        {/* Subtle Diagonal Shine Sweep on Hover */}
        <div
          className="pointer-events-none absolute inset-0 z-20 transition-transform duration-700 ease-out -translate-x-[120%] group-hover:translate-x-[120%]"
          style={{
            background:
              "linear-gradient(115deg, transparent 35%, rgba(255, 255, 255, 0.45) 50%, transparent 65%)",
          }}
          aria-hidden="true"
        />

        {/* Product Image with Edge-to-Edge Cover & Parallax Shift */}
        {currentImage ? (
          <div
            className="relative w-full h-full transition-transform duration-500 ease-out group-hover:scale-105"
            style={{
              transform: `translate(${-tilt.tx * 0.7}px, ${-tilt.ty * 0.7}px)`,
            }}
          >
            <Image
              src={currentImage}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
              className="object-contain transition-opacity duration-300"
            />
          </div>
        ) : (
          <div className="text-stone-400 text-xs uppercase tracking-wider font-medium">
            Image Not Available
          </div>
        )}

        {/* Minimalist Stock Pill (No Emojis) */}
        <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10">
          <span
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[8px] sm:text-[9px] font-semibold uppercase tracking-[0.12em] sm:tracking-[0.14em] shadow-xs backdrop-blur-md ${isInStock
              ? "bg-white/95 text-[#17472F] border border-[#17472F]/15"
              : "bg-stone-100/95 text-stone-600 border border-stone-200"
              }`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${isInStock ? "bg-[#17472F]" : "bg-stone-400"
                }`}
            />
            {isInStock ? "In Stock" : "Sold Out"}
          </span>
        </div>

        {/* Technical SKU Tag */}
        {product.sku && (
          <div className="hidden sm:block absolute top-2.5 right-2.5 z-10 text-[9px] tracking-wider uppercase font-semibold text-[#17472F] bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#E4DCCF] shadow-2xs">
            SKU: {product.sku}
          </div>
        )}

        {/* Manual Left/Right Image Navigation Chevrons */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={prevImage}
              aria-label="Previous Product Image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-[#17472F] border border-[#E4DCCF] shadow-xs flex items-center justify-center cursor-pointer transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={nextImage}
              aria-label="Next Product Image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/95 hover:bg-white text-[#17472F] border border-[#E4DCCF] shadow-xs flex items-center justify-center cursor-pointer transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 hover:scale-105 active:scale-95"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Gallery Preview Swatches (Crossfade on Hover/Click if multiple images exist) */}
        {images.length > 1 && (
          <div
            className="absolute bottom-2.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-md border border-[#E4DCCF] shadow-2xs opacity-80 group-hover:opacity-100 transition-opacity"
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
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${activeImageIndex === idx
                  ? "w-3 bg-[#A47A3C]"
                  : "bg-[#17472F]/30 hover:bg-[#17472F]/60"
                  }`}
                aria-label={`View product image ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 3. Product Metadata - Clean, Full Titles & Zero Overflow */}
      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between">
        <div>
          {/* Product Title - Full Title Visible */}
          <h3 className="text-[11.5px] sm:text-[13px] font-semibold text-[#17472F] group-hover:text-[#A47A3C] transition-colors leading-[1.3] sm:leading-[1.35]">
            <Link href={`/product/${product.slug}`} className="hover:underline">
              {product.name}
            </Link>
          </h3>
        </div>

        {/* 4. Price & Action Trigger - Guaranteed zero overflow: full width on mobile/tablet, side-by-side on xl desktop */}
        <div className="pt-2 sm:pt-2 mt-1.5 border-t border-[#E4DCCF] flex flex-col xl:flex-row xl:items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-baseline justify-between xl:block min-w-0">
            <span className="text-[7.5px] sm:text-[9px] uppercase tracking-[0.14em] text-[#A47A3C] font-semibold block leading-tight">
              Unit Price
            </span>
            <div className="text-[13px] sm:text-[15px] xl:text-[16px] font-bold text-[#17472F] tracking-tight">
              {product.price ? `₹${product.price}` : "On Request"}
            </div>
          </div>

          {/* View Details CTA Pill - Full width on mobile & md, auto on xl */}
          <Link
            href={`/product/${product.slug}`}
            className="group/btn inline-flex items-center justify-center w-full xl:w-auto px-3.5 py-1.5 sm:py-2 rounded-full text-[9px] sm:text-[10px] xl:text-[11px] font-semibold uppercase tracking-wider bg-[#17472F] text-white hover:bg-[#123825] active:bg-[#0E2C1D] transition-all shadow-xs text-center shrink-0"
          >
            <span>View Details</span>
            <span className="inline-block transition-transform duration-300 group-hover/btn:translate-x-1 ml-1 text-xs">
              →
            </span>
          </Link>
        </div>
      </div>
    </article>
  );
}
